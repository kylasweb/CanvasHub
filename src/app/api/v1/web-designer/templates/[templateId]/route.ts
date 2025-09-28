import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await params;

    // Get template with full details
    const template = await db.webDesignerTemplate.findUnique({
      where: {
        id: templateId,
        status: 'ACTIVE',
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if user has access to premium templates
    let hasAccess = true;
    if (template.isPremium) {
      // In a real implementation, you would check user's subscription
      // For now, we'll allow access to all templates
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Premium template requires subscription' },
        { status: 403 }
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