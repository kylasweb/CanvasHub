import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { RateLimit } from '@/lib/rate-limit';

// Create rate limiter for tracking endpoint (100 requests per minute per IP)
const rateLimit = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});

const trackEventSchema = z.object({
  trackingLink: z.string().url(),
  eventType: z.enum(['CLICK', 'SIGNUP', 'CONVERSION']),
  sourceIp: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().url().optional(),
  eventData: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    deviceType: z.enum(['Desktop', 'Mobile', 'Tablet']).optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimitResult = await rateLimit.check(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = trackEventSchema.parse(body);

    // Extract influencer ID from tracking link
    // Assuming tracking link format: https://example.com/ref/{influencerId}
    try {
      const url = new URL(validatedData.trackingLink);
      const pathParts = url.pathname.split('/');
      const influencerId = pathParts[pathParts.length - 1];

      if (!influencerId) {
        return NextResponse.json(
          { error: 'Invalid tracking link' },
          { status: 400 }
        );
      }

      // Find influencer by tracking link
      const influencer = await db.influencer.findFirst({
        where: {
          OR: [
            { trackingLink: validatedData.trackingLink },
            { id: influencerId }
          ]
        },
      });

      if (!influencer) {
        return NextResponse.json(
          { error: 'Invalid tracking link' },
          { status: 404 }
        );
      }

      // Check if influencer is active
      if (influencer.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Influencer account is not active' },
          { status: 403 }
        );
      }

      // Get client IP for fraud detection
      const sourceIp = validatedData.sourceIp || clientIP;

      // Check for suspicious activity (high frequency from same IP)
      const recentEventsFromIP = await db.influencerMetric.count({
        where: {
          sourceIp,
          timestamp: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      if (recentEventsFromIP > 50) { // More than 50 events from same IP in an hour
        console.warn(`Suspicious activity detected from IP: ${sourceIp}`);
        // Still allow the event but log it for investigation
      }

      // Create tracking event
      const event = await db.influencerMetric.create({
        data: {
          influencerId: influencer.id,
          eventType: validatedData.eventType,
          sourceIp,
          eventData: validatedData.eventData ? JSON.stringify(validatedData.eventData) : null,
          timestamp: new Date(),
        },
      });

      // If this is a conversion, create a pending payout
      if (validatedData.eventType === 'CONVERSION') {
        const conversionAmount = 50; // Fixed amount per conversion
        const commissionAmount = conversionAmount * influencer.commissionRate.toNumber();

        await db.influencerPayout.create({
          data: {
            influencerId: influencer.id,
            amount: commissionAmount,
            status: 'PENDING',
            payoutMethod: 'Bank Transfer', // Default, can be updated later
          },
        });
      }

      return NextResponse.json({
        success: true,
        eventId: event.id,
        message: 'Event tracked successfully',
      });
    } catch (urlError) {
      return NextResponse.json(
        { error: 'Invalid tracking link format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error tracking event:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple tracking via query parameters (for redirects)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingLink = searchParams.get('link');
    const eventType = searchParams.get('type') || 'CLICK';

    if (!trackingLink) {
      return NextResponse.json(
        { error: 'Tracking link is required' },
        { status: 400 }
      );
    }

    // Apply rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimitResult = await rateLimit.check(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Extract influencer ID from tracking link
    try {
      const url = new URL(trackingLink);
      const pathParts = url.pathname.split('/');
      const influencerId = pathParts[pathParts.length - 1];

      if (!influencerId) {
        return NextResponse.json(
          { error: 'Invalid tracking link' },
          { status: 400 }
        );
      }

      // Find influencer by tracking link
      const influencer = await db.influencer.findFirst({
        where: {
          OR: [
            { trackingLink },
            { id: influencerId }
          ]
        },
      });

      if (!influencer) {
        return NextResponse.json(
          { error: 'Invalid tracking link' },
          { status: 404 }
        );
      }

      // Check if influencer is active
      if (influencer.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Influencer account is not active' },
          { status: 403 }
        );
      }

      // Get client info
      const sourceIp = clientIP;
      const userAgent = request.headers.get('user-agent') || '';
      const referrer = request.headers.get('referer') || '';

      // Create tracking event
      const event = await db.influencerMetric.create({
        data: {
          influencerId: influencer.id,
          eventType: eventType as 'CLICK' | 'SIGNUP' | 'CONVERSION',
          sourceIp,
          eventData: JSON.stringify({
            userAgent,
            referrer,
            trackingMethod: 'redirect',
          }),
          timestamp: new Date(),
        },
      });

      // Redirect to the target URL (or home page if not specified)
      const targetUrl = searchParams.get('target') || '/';
      return NextResponse.redirect(targetUrl);
    } catch (urlError) {
      return NextResponse.json(
        { error: 'Invalid tracking link format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error tracking event via GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}