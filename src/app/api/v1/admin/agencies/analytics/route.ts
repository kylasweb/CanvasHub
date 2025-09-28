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
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overall statistics
    const [
      totalAgencies,
      activeAgencies,
      totalMembers,
      totalClients,
      totalCampaigns,
      activeCampaigns,
    ] = await Promise.all([
      db.agency.count(),
      db.agency.count({ where: { subscriptionTier: 'BASIC' } }),
      db.agencyMember.count(),
      db.client.count(),
      db.campaign.count(),
      db.campaign.count({ where: { status: 'ACTIVE' } }),
    ]);

    // Get agencies created in the period
    const newAgencies = await db.agency.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get new members in the period
    const newMembers = await db.agencyMember.count({
      where: {
        joinedAt: {
          gte: startDate,
        },
      },
    });

    // Get new clients in the period
    const newClients = await db.client.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get new campaigns in the period
    const newCampaigns = await db.campaign.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get agency size distribution - not available in schema, using subscriptionTier instead
    const agencySizeDistribution = await db.agency.groupBy({
      by: ['subscriptionTier'],
      _count: {
        id: true,
      },
    });

    // Get industry distribution - not available in schema, removing this section

    // Get top performing agencies (by number of clients)
    const topAgencies = await db.agency.findMany({
      include: {
        clients: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            members: true,
            clients: true,
          },
        },
      },
      orderBy: {
        clients: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Calculate total budget - budget field not available in Campaign schema
    const totalBudget = { _sum: { budget: 0 } };

    // Get campaign status distribution
    const campaignStatusDistribution = await db.campaign.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Format top agencies
    const formattedTopAgencies = topAgencies.map(agency => {
      return {
        id: agency.id,
        agencyName: agency.agencyName,
        subscriptionTier: agency.subscriptionTier,
        stats: {
          membersCount: agency._count?.members || 0,
          clientsCount: agency._count?.clients || 0,
          campaignsCount: agency.clients?.length || 0,
        },
      };
    });

    return NextResponse.json({
      overview: {
        totalAgencies,
        activeAgencies,
        totalMembers,
        totalClients,
        totalCampaigns,
        activeCampaigns,
        totalBudget: totalBudget._sum.budget || 0,
      },
      growth: {
        period,
        newAgencies,
        newMembers,
        newClients,
        newCampaigns,
      },
      distributions: {
        agencySize: agencySizeDistribution.map(item => ({
          size: item.subscriptionTier,
          count: item._count.id,
        })),
        campaignStatus: campaignStatusDistribution.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
      },
      topAgencies: formattedTopAgencies,
    });
  } catch (error) {
    console.error('Error fetching agency analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}