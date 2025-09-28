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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isPremium = searchParams.get('premium');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build filter conditions
    const whereClause: any = { status: 'ACTIVE' };
    if (type) whereClause.widgetType = type;
    if (category) whereClause.category = category;
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

    // Get widget types and categories for filtering
    const [widgetTypes, categories] = await Promise.all([
      db.webDesignerWidget.groupBy({
        by: ['widgetType'],
        where: { status: 'ACTIVE' },
        _count: {
          widgetType: true,
        },
      }),
      db.webDesignerWidget.groupBy({
        by: ['category'],
        where: { 
          status: 'ACTIVE',
          category: { not: null },
        },
        _count: {
          category: true,
        },
      }),
    ]);

    // Format response
    const formattedWidgets = widgets.map(widget => ({
      id: widget.id,
      widgetName: widget.widgetName,
      widgetType: widget.widgetType,
      category: widget.category,
      defaultSettings: widget.defaultSettings,
      isPremium: widget.isPremium,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
    }));

    return NextResponse.json({
      widgets: formattedWidgets,
      widgetTypes: widgetTypes.map(type => ({
        type: type.widgetType,
        count: type._count.widgetType,
      })),
      categories: categories.map(cat => ({
        category: cat.category,
        count: cat._count.category,
      })),
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