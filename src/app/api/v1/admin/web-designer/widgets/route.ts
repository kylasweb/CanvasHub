import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createWidgetSchema = z.object({
  widgetName: z.string().min(1).max(100),
  widgetType: z.enum(['TEXT', 'IMAGE', 'BUTTON', 'FORM', 'GALLERY', 'VIDEO', 'MAP', 'SOCIAL_MEDIA', 'ECOMMERCE', 'NAVIGATION', 'CONTAINER', 'CUSTOM']),
  widgetCode: z.string().min(1),
  defaultSettings: z.any(),
  category: z.string().max(50).optional(),
  isPremium: z.boolean().default(false),
});

const updateWidgetSchema = z.object({
  widgetName: z.string().min(1).max(100).optional(),
  widgetType: z.enum(['TEXT', 'IMAGE', 'BUTTON', 'FORM', 'GALLERY', 'VIDEO', 'MAP', 'SOCIAL_MEDIA', 'ECOMMERCE', 'NAVIGATION', 'CONTAINER', 'CUSTOM']).optional(),
  widgetCode: z.string().min(1).optional(),
  defaultSettings: z.any().optional(),
  category: z.string().max(50).optional(),
  isPremium: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
});

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
    const validatedData = createWidgetSchema.parse(body);

    // Create widget
    const widget = await db.webDesignerWidget.create({
      data: {
        widgetName: validatedData.widgetName,
        widgetType: validatedData.widgetType,
        widgetCode: validatedData.widgetCode,
        defaultSettings: validatedData.defaultSettings,
        category: validatedData.category,
        isPremium: validatedData.isPremium,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      id: widget.id,
      widgetName: widget.widgetName,
      widgetType: widget.widgetType,
      category: widget.category,
      defaultSettings: widget.defaultSettings,
      isPremium: widget.isPremium,
      status: widget.status,
      createdAt: widget.createdAt,
      message: 'Widget created successfully',
    });
  } catch (error) {
    console.error('Error creating widget:', error);
    
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

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isPremium = searchParams.get('premium');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions
    const whereClause: any = {};
    if (type) whereClause.widgetType = type;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (isPremium === 'true') whereClause.isPremium = true;
    if (isPremium === 'false') whereClause.isPremium = false;

    // Get widgets with pagination
    const [widgets, totalCount] = await Promise.all([
      db.webDesignerWidget.findMany({
        where: whereClause,
        orderBy: [
          { widgetType: 'asc' },
          { category: 'asc' },
          { widgetName: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webDesignerWidget.count({ where: whereClause }),
    ]);

    // Get widget statistics
    const stats = await db.webDesignerWidget.groupBy({
      by: ['widgetType', 'status'],
      _count: {
        id: true,
      },
    });

    // Format response
    const formattedWidgets = widgets.map(widget => ({
      id: widget.id,
      widgetName: widget.widgetName,
      widgetType: widget.widgetType,
      category: widget.category,
      defaultSettings: widget.defaultSettings,
      isPremium: widget.isPremium,
      status: widget.status,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
    }));

    return NextResponse.json({
      widgets: formattedWidgets,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { widgetId, ...updateData } = body;
    const validatedData = updateWidgetSchema.parse(updateData);

    // Find the widget
    const widget = await db.webDesignerWidget.findUnique({
      where: { id: widgetId },
    });

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Update widget
    const updatedWidget = await db.webDesignerWidget.update({
      where: { id: widgetId },
      data: validatedData,
    });

    return NextResponse.json({
      id: updatedWidget.id,
      widgetName: updatedWidget.widgetName,
      widgetType: updatedWidget.widgetType,
      category: updatedWidget.category,
      defaultSettings: updatedWidget.defaultSettings,
      isPremium: updatedWidget.isPremium,
      status: updatedWidget.status,
      updatedAt: updatedWidget.updatedAt,
      message: 'Widget updated successfully',
    });
  } catch (error) {
    console.error('Error updating widget:', error);
    
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