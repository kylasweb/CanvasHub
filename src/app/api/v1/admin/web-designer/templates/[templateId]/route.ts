import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params
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

    // Get template with full details
    const template = await db.webDesignerTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: template.id,
      templateName: template.templateName,
      category: template.category,
      previewImageUrl: template.previewImageUrl,
      templateData: template.templateData,
      isPremium: template.isPremium,
      isFeatured: template.isFeatured,
      usageCount: template.usageCount,
      status: template.status,
      projectsCount: template._count.projects,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params
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

    // Find the template
    const template = await db.webDesignerTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if template has related projects
    const hasRelatedData = template._count.projects > 0;

    if (hasRelatedData) {
      // Instead of deleting, mark as inactive
      await db.webDesignerTemplate.update({
        where: { id: templateId },
        data: { status: 'INACTIVE' },
      });

      // Log template deactivation
      console.log(`Template deactivated by admin ${session.user.email}:`, {
        templateId: template.id,
        templateName: template.templateName,
        projectsCount: template._count.projects,
      });

      return NextResponse.json({
        message: 'Template deactivated due to existing related projects',
        templateId: template.id,
      });
    }

    // Delete the template
    await db.webDesignerTemplate.delete({
      where: { id: templateId },
    });

    // Log template deletion
    console.log(`Template deleted by admin ${session.user.email}:`, {
      templateId: template.id,
      templateName: template.templateName,
    });

    return NextResponse.json({
      message: 'Template deleted successfully',
      templateId: template.id,
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}