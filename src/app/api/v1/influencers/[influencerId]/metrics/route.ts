import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { influencerId } = await params;

    // Get influencer with detailed metrics
    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1000, // Last 1000 events
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 payouts
        },
      },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    // Calculate detailed metrics
    const metrics = influencer.metrics;
    const clicks = metrics.filter(m => m.eventType === 'CLICK');
    const signups = metrics.filter(m => m.eventType === 'SIGNUP');
    const conversions = metrics.filter(m => m.eventType === 'CONVERSION');

    // Group by date for charts
    const eventsByDate = metrics.reduce((acc, event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { CLICK: 0, SIGNUP: 0, CONVERSION: 0 };
      }
      acc[date][event.eventType]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Calculate conversion rates
    const clickToSignupRate = clicks.length > 0 ? (signups.length / clicks.length) * 100 : 0;
    const signupToConversionRate = signups.length > 0 ? (conversions.length / signups.length) * 100 : 0;
    const overallConversionRate = clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0;

    // Get unique IPs for fraud detection
    const validClicks = clicks.filter(c => c.sourceIp !== null);
    const uniqueIPs = new Set(validClicks.map(c => c.sourceIp)).size;
    const suspiciousIPs = Array.from(
      validClicks.reduce((acc, click) => {
        acc.set(click.sourceIp!, (acc.get(click.sourceIp!) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).filter(([_, count]) => count > 10); // More than 10 clicks from same IP

    // Geographic distribution
    const locationCounts = clicks.reduce((acc, click) => {
      try {
        const location = JSON.parse(click.eventData || '{}');
        const country = location.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
      } catch {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Device distribution
    const deviceCounts = clicks.reduce((acc, click) => {
      try {
        const eventData = JSON.parse(click.eventData || '{}');
        const deviceType = eventData.deviceType || 'Unknown';
        acc[deviceType] = (acc[deviceType] || 0) + 1;
      } catch {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Payout summary
    const totalPayouts = influencer.payouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const processedPayouts = influencer.payouts
      .filter(p => p.status === 'PROCESSED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayouts = influencer.payouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
      influencer: {
        id: influencer.id,
        userId: influencer.userId,
        userName: influencer.user.name,
        userEmail: influencer.user.email,
        status: influencer.status,
        trackingLink: influencer.trackingLink,
        commissionRate: influencer.commissionRate,
        createdAt: influencer.createdAt,
        updatedAt: influencer.updatedAt,
      },
      metrics: {
        totals: {
          clicks: clicks.length,
          signups: signups.length,
          conversions: conversions.length,
          uniqueIPs,
          suspiciousIPs: suspiciousIPs.length,
        },
        rates: {
          clickToSignup: Math.round(clickToSignupRate * 100) / 100,
          signupToConversion: Math.round(signupToConversionRate * 100) / 100,
          overallConversion: Math.round(overallConversionRate * 100) / 100,
        },
        eventsByDate,
        geographicDistribution: locationCounts,
        deviceDistribution: deviceCounts,
        recentEvents: metrics.slice(0, 50), // Last 50 events
      },
      payouts: {
        total: totalPayouts,
        processed: processedPayouts,
        pending: pendingPayouts,
        history: influencer.payouts,
      },
      fraudIndicators: {
        highFrequencyIPs: suspiciousIPs.map(([ip, count]) => ({ ip, count })),
        unusualPatterns: suspiciousIPs.length > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching influencer metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}