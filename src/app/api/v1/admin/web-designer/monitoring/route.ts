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
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // Build filter conditions
    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;

    // Get projects with pagination and user details
    const [projects, totalCount] = await Promise.all([
      db.webDesignerProject.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          template: {
            select: {
              id: true,
              templateName: true,
              category: true,
            },
          },
          assets: {
            select: {
              id: true,
              fileType: true,
              fileSize: true,
            },
          },
          _count: {
            select: {
              assets: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webDesignerProject.count({ where: whereClause }),
    ]);

    // Get overall statistics
    const [
      totalProjects,
      totalUsers,
      publishedProjects,
      totalAssets,
      totalTemplatesUsed,
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
      db.webDesignerProject.count({
        where: {
          templateId: {
            not: null,
          },
        },
      }),
    ]);

    // Get projects created in the period
    const newProjects = await db.webDesignerProject.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...(userId && { userId }),
      },
    });

    // Get projects published in the period
    const publishedInPeriod = await db.webDesignerProject.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: startDate,
        },
        ...(userId && { userId }),
      },
    });

    // Get new users in the period
    const newUsers = await db.user.count({
      where: {
        webDesignerProjects: {
          some: {
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    });

    // Get template usage statistics
    const templateUsage = await db.webDesignerTemplate.findMany({
      where: {
        status: 'ACTIVE',
      },
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

    // Get user activity statistics
    const userActivity = await db.user.findMany({
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
      orderBy: {
        webDesignerProjects: {
          _count: 'desc',
        },
      },
      take: 20,
    });

    // Format response
    const formattedProjects = projects.map(project => {
      const totalAssetSize = project.assets.reduce((sum, asset) => sum + asset.fileSize, 0);
      
      return {
        id: project.id,
        projectName: project.projectName,
        status: project.status,
        publishedUrl: project.publishedUrl,
        customDomain: project.customDomain,
        user: {
          id: project.user.id,
          name: project.user.name,
          email: project.user.email,
        },
        template: project.template,
        assetsCount: project._count.assets,
        totalAssetSize,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        publishedAt: project.publishedAt,
      };
    });

    const formattedUserActivity = userActivity.map(user => {
      const userProjects = user.webDesignerProjects;
      const publishedProjects = userProjects.filter(p => p.status === 'PUBLISHED').length;
      const recentActivity = userProjects.filter(p => 
        new Date(p.updatedAt) > startDate
      ).length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        stats: {
          totalProjects: user._count.webDesignerProjects,
          publishedProjects,
          totalAssets: user._count.webDesignerAssets,
          recentActivity,
        },
        lastActivity: userProjects.length > 0 ? userProjects[0].updatedAt : null,
      };
    });

    return NextResponse.json({
      overview: {
        totalProjects,
        totalUsers,
        publishedProjects,
        totalAssets,
        totalTemplatesUsed,
      },
      growth: {
        period,
        newProjects,
        publishedInPeriod,
        newUsers,
      },
      projects: formattedProjects,
      userActivity: formattedUserActivity,
      templateUsage: templateUsage.map(template => ({
        id: template.id,
        templateName: template.templateName,
        category: template.category,
        usageCount: template._count.projects,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}