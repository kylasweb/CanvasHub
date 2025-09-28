import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'warning', 'error', 'success']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  channel: z.enum(['email', 'sms', 'webhook', 'slack', 'in_app']),
  targetAudience: z.string(),
  scheduledAt: z.string().optional(),
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const channel = searchParams.get('channel');

    // Build filter conditions
    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (channel) whereClause.channel = channel;

    const [notifications, totalCount] = await Promise.all([
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

    return NextResponse.json({
      notifications: notifications.map(notification => ({
        id: notification.id,
        title: notification.action,
        message: `${notification.entityType} ${notification.action}${notification.entityId ? ` (${notification.entityId})` : ''}`,
        type: notification.entityType,
        priority: 'normal',
        channel: 'system',
        targetAudience: 'admin',
        status: 'sent',
        scheduledAt: null,
        sentAt: notification.createdAt,
        createdAt: notification.createdAt,
        createdBy: notification.user?.name || 'System',
        recipients: null,
        delivered: null,
        opened: null,
        clicked: null,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
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
    const validatedData = notificationSchema.parse(body);

    // Create notification
    const notification = await db.notification.create({
      data: {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        priority: validatedData.priority,
        channel: validatedData.channel,
        targetAudience: validatedData.targetAudience,
        status: validatedData.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log notification creation
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'NOTIFICATION_CREATED',
        entityType: 'Notification',
        entityId: notification.id,
        newValues: JSON.stringify({
          type: validatedData.type,
          channel: validatedData.channel,
          targetAudience: validatedData.targetAudience,
        }),
      },
    });

    return NextResponse.json({
      message: 'Notification created successfully',
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        channel: notification.channel,
        targetAudience: notification.targetAudience,
        status: notification.status,
        scheduledAt: notification.scheduledAt,
        createdAt: notification.createdAt,
        createdBy: notification.createdBy?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);

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