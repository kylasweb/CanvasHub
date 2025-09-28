import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build filter conditions
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { trackingLink: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get influencers with pagination
    const [influencers, totalCount] = await Promise.all([
      db.influencer.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              createdAt: true,
            },
          },
          metrics: {
            select: {
              id: true,
              eventType: true,
              timestamp: true,
            },
          },
          payouts: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              metrics: true,
              payouts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.influencer.count({ where: whereClause }),
    ]);

    // Format response
    const formattedInfluencers = influencers.map(influencer => {
      const totalClicks = influencer.metrics.filter(m => m.eventType === 'CLICK').length;
      const totalSignups = influencer.metrics.filter(m => m.eventType === 'SIGNUP').length;
      const totalConversions = influencer.metrics.filter(m => m.eventType === 'CONVERSION').length;
      const totalPayouts = influencer.payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
      const pendingPayouts = influencer.payouts
        .filter(p => p.status === 'PENDING')
        .reduce((sum, payout) => sum + Number(payout.amount), 0);

      return {
        id: influencer.id,
        userId: influencer.userId,
        status: influencer.status,
        trackingLink: influencer.trackingLink,
        commissionRate: Number(influencer.commissionRate),
        createdAt: influencer.createdAt,
        updatedAt: influencer.updatedAt,
        user: influencer.user,
        stats: {
          totalClicks,
          totalSignups,
          totalConversions,
          conversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0,
          totalPayouts,
          pendingPayouts,
          totalMetrics: influencer._count.metrics,
          totalPayoutsCount: influencer._count.payouts,
        },
      };
    });

    return NextResponse.json({
      influencers: formattedInfluencers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}