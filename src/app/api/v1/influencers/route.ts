import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createInfluencerSchema = z.object({
  commissionRate: z.number().min(0).max(1).default(0.1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInfluencerSchema.parse(body);

    // Check if user already has an influencer profile
    const existingInfluencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
    });

    if (existingInfluencer) {
      return NextResponse.json(
        { error: 'Influencer profile already exists' },
        { status: 400 }
      );
    }

    // Create influencer profile
    const influencer = await db.influencer.create({
      data: {
        userId: session.user.id,
        commissionRate: validatedData.commissionRate,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      id: influencer.id,
      userId: influencer.userId,
      status: influencer.status,
      commissionRate: influencer.commissionRate,
      createdAt: influencer.createdAt,
      message: 'Influencer profile created successfully. Pending admin approval.',
    });
  } catch (error) {
    console.error('Error creating influencer:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's influencer profile
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 100, // Last 100 events
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 payouts
        },
      },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 }
      );
    }

    // Calculate metrics
    const totalClicks = influencer.metrics.filter(m => m.eventType === 'CLICK').length;
    const totalSignups = influencer.metrics.filter(m => m.eventType === 'SIGNUP').length;
    const totalConversions = influencer.metrics.filter(m => m.eventType === 'CONVERSION').length;
    const totalEarnings = totalConversions * 50; // Assuming $50 per conversion
    const pendingPayouts = influencer.payouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
      id: influencer.id,
      userId: influencer.userId,
      userName: influencer.user.name,
      userEmail: influencer.user.email,
      status: influencer.status,
      trackingLink: influencer.trackingLink,
      commissionRate: influencer.commissionRate,
      createdAt: influencer.createdAt,
      updatedAt: influencer.updatedAt,
      metrics: {
        totalClicks,
        totalSignups,
        totalConversions,
        totalEarnings,
        pendingPayouts,
        recentEvents: influencer.metrics.slice(0, 20), // Last 20 events
      },
      payouts: influencer.payouts,
    });
  } catch (error) {
    console.error('Error fetching influencer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}