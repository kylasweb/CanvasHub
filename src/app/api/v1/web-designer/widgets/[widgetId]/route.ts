import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { widgetId } = await params;

    // Get widget with full details
    const widget = await db.webDesignerWidget.findUnique({
      where: {
        id: widgetId,
        status: 'ACTIVE',
      },
    });

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Check if user has access to premium widgets
    let hasAccess = true;
    if (widget.isPremium) {
      // In a real implementation, you would check user's subscription
      // For now, we'll allow access to all widgets
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Premium widget requires subscription' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: widget.id,
      widgetName: widget.widgetName,
      widgetType: widget.widgetType,
      widgetCode: widget.widgetCode,
      defaultSettings: widget.defaultSettings,
      category: widget.category,
      isPremium: widget.isPremium,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}