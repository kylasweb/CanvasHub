import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch all data in parallel
    const [
      userStats,
      projectStats,
      revenueStats,
      systemStats,
      webDesignStats,
      visitingCardStats,
      agencyStats,
      influencerStats,
      recentActivity
    ] = await Promise.all([
      // User Statistics
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ 
          where: { 
            lastLoginAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } 
          } 
        }),
        prisma.user.count({ 
          where: { 
            createdAt: { gte: startDate } 
          } 
        }),
        prisma.subscription.aggregate({
          _sum: { amount: true },
          where: { status: 'ACTIVE' }
        })
      ]),
      
      // Project Statistics
      Promise.all([
        prisma.project.count(),
        prisma.project.count({ 
          where: { 
            status: 'IN_PROGRESS',
            createdAt: { gte: startDate } 
          } 
        }),
        prisma.project.aggregate({
          _sum: { budget: true },
          where: { status: 'IN_PROGRESS' }
        })
      ]),
      
      // Revenue Statistics
      Promise.all([
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { 
            status: 'COMPLETED',
            createdAt: { gte: startDate } 
          }
        }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED' }
        }),
        prisma.subscription.count({
          where: { 
            status: 'ACTIVE',
            createdAt: { gte: startDate } 
          }
        })
      ]),
      
      // System Statistics
      Promise.all([
        // System load (simulated - would need real monitoring)
        Promise.resolve(Math.floor(Math.random() * 100)),
        // Storage usage (simulated - would need real storage monitoring)
        Promise.resolve(Math.floor(Math.random() * 100)),
        // Error rate (simulated - would need real error tracking)
        Promise.resolve(Math.random() * 2),
        // Uptime (simulated - would need real uptime monitoring)
        Promise.resolve('45d 12h')
      ]),
      
      // Web Design Statistics
      Promise.all([
        prisma.webDesign.count(),
        prisma.webDesign.count({ where: { status: 'PUBLISHED' } }),
        prisma.webDesign.aggregate({ _sum: { views: true } })
      ]),
      
      // Visiting Card Statistics
      Promise.all([
        prisma.virtualVisitingCard.count(),
        prisma.virtualVisitingCard.count({ where: { status: 'ACTIVE' } }),
        prisma.virtualVisitingCard.aggregate({ _sum: { views: true } })
      ]),
      
      // Agency Statistics
      Promise.all([
        prisma.agency.count(),
        prisma.agency.count(), // No status field in Agency model
        prisma.agencyMember.count(),
        prisma.client.count() // Use client count instead of agencyClient
      ]),
      
      // Influencer Statistics
      Promise.all([
        prisma.influencer.count(),
        prisma.influencer.count({ where: { status: 'ACTIVE' } }),
        prisma.influencerMetric.count({
          where: { 
            eventType: 'CONVERSION',
            timestamp: { gte: startDate } 
          }
        }),
        prisma.influencerPayout.aggregate({
          _sum: { amount: true },
          where: { status: 'PROCESSED' }
        })
      ]),
      
      // Recent Activity
      prisma.activityLog.findMany({
        where: {
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Calculate system health metrics
    const systemLoad = systemStats[0];
    const storageUsed = systemStats[1];
    const errorRate = systemStats[2];
    const uptime = systemStats[3];

    // Format the response data
    const dashboardStats = {
      users: {
        total: userStats[0],
        active: userStats[1],
        newThisPeriod: userStats[2],
        totalRevenue: Number(userStats[3]._sum.amount || 0)
      },
      projects: {
        total: projectStats[0],
        active: projectStats[1],
        totalBudget: Number(projectStats[2]._sum.budget || 0)
      },
      revenue: {
        thisPeriod: Number(revenueStats[0]._sum.amount || 0),
        totalLifetime: Number(revenueStats[1]._sum.amount || 0),
        newSubscriptions: revenueStats[2]
      },
      system: {
        load: systemLoad,
        storageUsed: storageUsed,
        errorRate: Math.round(errorRate * 100) / 100,
        uptime: uptime,
        health: Math.max(0, 100 - systemLoad - (errorRate * 10))
      },
      webDesigns: {
        total: webDesignStats[0],
        published: webDesignStats[1],
        totalViews: Number(webDesignStats[2]._sum.views || 0)
      },
      visitingCards: {
        total: visitingCardStats[0],
        active: visitingCardStats[1],
        totalViews: Number(visitingCardStats[2]._sum.views || 0)
      },
      agencies: {
        total: agencyStats[0],
        active: agencyStats[1],
        totalMembers: agencyStats[2],
        totalClients: agencyStats[3]
      },
      influencers: {
        total: influencerStats[0],
        active: influencerStats[1],
        totalConversions: influencerStats[2],
        totalPayouts: Number(influencerStats[3]._sum.amount || 0)
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: getActivityType(activity.action),
        action: activity.action,
        user: activity.user?.name || 'System',
        timestamp: activity.createdAt,
        details: activity.entityType ? `${activity.action} on ${activity.entityType}` : activity.action
      }))
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getActivityType(action: string): 'user' | 'project' | 'payment' | 'system' {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('user') || actionLower.includes('login') || actionLower.includes('register')) {
    return 'user';
  } else if (actionLower.includes('project') || actionLower.includes('design')) {
    return 'project';
  } else if (actionLower.includes('payment') || actionLower.includes('subscription') || actionLower.includes('revenue')) {
    return 'payment';
  } else {
    return 'system';
  }
}