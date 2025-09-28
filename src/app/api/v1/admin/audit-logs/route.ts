import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const auditLogSchema = z.object({
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  details: z.any(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'success']).optional(),
});

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filter conditions
    const whereClause: any = {};
    if (action) whereClause.action = action;
    if (severity) whereClause.severity = severity;
    if (userId) whereClause.userId = userId;
    if (dateFrom || dateTo) {
      whereClause.timestamp = {};
      if (dateFrom) whereClause.timestamp.gte = new Date(dateFrom);
      if (dateTo) whereClause.timestamp.lte = new Date(dateTo);
    }

    const [logs, totalCount] = await Promise.all([
      db.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.activityLog.count({ where: whereClause }),
    ]);

    // Get stats
    const [todayLogs, weekLogs, monthLogs, severityStats] = await Promise.all([
      db.activityLog.count({
        where: {
          ...whereClause,
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.activityLog.count({
        where: {
          ...whereClause,
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.activityLog.count({
        where: {
          ...whereClause,
          timestamp: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
      db.activityLog.groupBy({
        by: ['action'],
        where: whereClause,
        _count: {
          action: true,
        },
      }),
    ]);

    const actionDistribution = severityStats.reduce((acc, stat) => {
      acc[stat.action] = stat._count.action;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.name || 'Unknown',
        userEmail: log.user?.email || '',
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: {
          oldValues: log.oldValues,
          newValues: log.newValues,
        },
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.createdAt,
      })),
      stats: {
        totalLogs: totalCount,
        todayLogs,
        weekLogs,
        monthLogs,
        actionDistribution,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = auditLogSchema.parse(body);

    // Create audit log entry
    const auditLog = await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: validatedData.action,
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        oldValues: JSON.stringify(validatedData.details?.oldValues || {}),
        newValues: JSON.stringify(validatedData.details?.newValues || {}),
        ipAddress: validatedData.ipAddress || 'unknown',
        userAgent: validatedData.userAgent || request.headers.get('user-agent') || 'unknown',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Audit log created successfully',
      log: {
        id: auditLog.id,
        userId: auditLog.userId,
        userName: auditLog.user?.name || 'Unknown',
        userEmail: auditLog.user?.email || '',
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        details: {
          oldValues: auditLog.oldValues,
          newValues: auditLog.newValues,
        },
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        timestamp: auditLog.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);

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