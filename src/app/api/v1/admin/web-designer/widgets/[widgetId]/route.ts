import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params
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

    // Get widget with full details
    const widget = await db.webDesignerWidget.findUnique({
      where: { id: widgetId },
    });

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
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
      status: widget.status,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params
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

    // Instead of deleting, mark as inactive
    await db.webDesignerWidget.update({
      where: { id: widgetId },
      data: { status: 'INACTIVE' },
    });

    // Log widget deactivation
    console.log(`Widget deactivated by admin ${session.user.email}:`, {
      widgetId: widget.id,
      widgetName: widget.widgetName,
    });

    return NextResponse.json({
      message: 'Widget deactivated successfully',
      widgetId: widget.id,
    });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}