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
    const reportType = searchParams.get('type') || 'overview'; // overview, templates, widgets, users, assets

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
      totalProjects,
      totalUsers,
      publishedProjects,
      totalAssets,
      totalTemplates,
      totalWidgets,
      activeTemplates,
      activeWidgets,
    ] = await Promise.all([
      db.webDesignerProject.count(),
      db.user.count({
        where: {
          webDesignerProjects: {
            some: {},
          },
        },
      }),
      db.webDesignerProject.count({
        where: { status: 'PUBLISHED' },
      }),
      db.webDesignerAsset.count(),
      db.webDesignerTemplate.count(),
      db.webDesignerWidget.count(),
      db.webDesignerTemplate.count({
        where: { status: 'ACTIVE' },
      }),
      db.webDesignerWidget.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    // Get growth metrics
    const [
      newProjects,
      newUsers,
      newPublishedProjects,
      newAssets,
    ] = await Promise.all([
      db.webDesignerProject.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      db.user.count({
        where: {
          webDesignerProjects: {
            some: {
              createdAt: {
                gte: startDate,
              },
            },
          },
        },
      }),
      db.webDesignerProject.count({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: startDate,
          },
        },
      }),
      db.webDesignerAsset.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Get template analytics
    const templateAnalytics = await db.webDesignerTemplate.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        projects: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Get widget usage by type
    const widgetUsageByType = await db.webDesignerWidget.groupBy({
      by: ['widgetType'],
      where: { status: 'ACTIVE' },
      _count: {
        id: true,
      },
    });

    // Get asset distribution by type
    const assetDistribution = await db.webDesignerAsset.groupBy({
      by: ['fileType'],
      _count: {
        id: true,
      },
    });

    // Get project status distribution
    const projectStatusDistribution = await db.webDesignerProject.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get template category distribution
    const templateCategoryDistribution = await db.webDesignerTemplate.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: {
        id: true,
      },
    });

    // Get user engagement metrics
    const userEngagement = await db.user.findMany({
      where: {
        webDesignerProjects: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            webDesignerProjects: true,
            webDesignerAssets: true,
          },
        },
        webDesignerProjects: {
          select: {
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      take: 50,
    });

    // Calculate engagement metrics
    const activeUsers = userEngagement.filter(user => {
      const recentProject = user.webDesignerProjects.find(p => 
        new Date(p.updatedAt) > startDate
      );
      return recentProject !== undefined;
    }).length;

    const powerUsers = userEngagement.filter(user => 
      user._count.webDesignerProjects >= 5
    ).length;

    // Get monthly trends (simplified for this example)
    const monthlyTrends = await db.webDesignerProject.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Format response based on report type
    const baseResponse = {
      period,
      overview: {
        totalProjects,
        totalUsers,
        publishedProjects,
        totalAssets,
        totalTemplates,
        totalWidgets,
        activeTemplates,
        activeWidgets,
      },
      growth: {
        newProjects,
        newUsers,
        newPublishedProjects,
        newAssets,
        activeUsers,
        powerUsers,
      },
      distributions: {
        projectStatus: projectStatusDistribution,
        templateCategories: templateCategoryDistribution,
        assetTypes: assetDistribution,
        widgetTypes: widgetUsageByType,
      },
      monthlyTrends,
    };

    switch (reportType) {
      case 'templates':
        return NextResponse.json({
          ...baseResponse,
          templates: {
            topPerforming: templateAnalytics.map(t => ({
              id: t.id,
              templateName: t.templateName,
              category: t.category,
              usageCount: t._count.projects,
              isPremium: t.isPremium,
              isFeatured: t.isFeatured,
            })),
            categoryDistribution: templateCategoryDistribution,
          },
        });

      case 'widgets':
        return NextResponse.json({
          ...baseResponse,
          widgets: {
            usageByType: widgetUsageByType,
            totalActive: activeWidgets,
            totalInactive: totalWidgets - activeWidgets,
          },
        });

      case 'users':
        return NextResponse.json({
          ...baseResponse,
          users: {
            totalActive: activeUsers,
            totalPower: powerUsers,
            engagement: userEngagement.slice(0, 20).map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              projectsCount: user._count.webDesignerProjects,
              assetsCount: user._count.webDesignerAssets,
              publishedProjects: user.webDesignerProjects.filter(p => p.status === 'PUBLISHED').length,
              lastActivity: user.webDesignerProjects.length > 0 ? user.webDesignerProjects[0].updatedAt : null,
            })),
          },
        });

      case 'assets':
        return NextResponse.json({
          ...baseResponse,
          assets: {
            distribution: assetDistribution,
            totalSize: await db.webDesignerAsset.aggregate({
              _sum: {
                fileSize: true,
              },
            }),
            newInPeriod: newAssets,
          },
        });

      default:
        return NextResponse.json({
          ...baseResponse,
          templates: {
            topPerforming: templateAnalytics.slice(0, 5).map(t => ({
              id: t.id,
              templateName: t.templateName,
              category: t.category,
              usageCount: t._count.projects,
            })),
          },
          widgets: {
            usageByType: widgetUsageByType,
          },
          users: {
            totalActive: activeUsers,
            totalPower: powerUsers,
          },
          assets: {
            distribution: assetDistribution,
          },
        });
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}