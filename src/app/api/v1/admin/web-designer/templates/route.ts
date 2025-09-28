import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTemplateSchema = z.object({
  templateName: z.string().min(1).max(100),
  category: z.enum(['BLOG', 'PORTFOLIO', 'ECOMMERCE', 'BUSINESS', 'PERSONAL', 'LANDING_PAGE', 'EVENT', 'CREATIVE']),
  previewImageUrl: z.string().url().optional(),
  templateData: z.any(),
  isPremium: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

const updateTemplateSchema = z.object({
  templateName: z.string().min(1).max(100).optional(),
  category: z.enum(['BLOG', 'PORTFOLIO', 'ECOMMERCE', 'BUSINESS', 'PERSONAL', 'LANDING_PAGE', 'EVENT', 'CREATIVE']).optional(),
  previewImageUrl: z.string().url().optional(),
  templateData: z.any().optional(),
  isPremium: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
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
    const validatedData = createTemplateSchema.parse(body);

    // Create template
    const template = await db.webDesignerTemplate.create({
      data: {
        templateName: validatedData.templateName,
        category: validatedData.category,
        previewImageUrl: validatedData.previewImageUrl,
        templateData: validatedData.templateData,
        isPremium: validatedData.isPremium,
        isFeatured: validatedData.isFeatured,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      id: template.id,
      templateName: template.templateName,
      category: template.category,
      previewImageUrl: template.previewImageUrl,
      isPremium: template.isPremium,
      isFeatured: template.isFeatured,
      usageCount: template.usageCount,
      status: template.status,
      createdAt: template.createdAt,
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('Error creating template:', error);
    
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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isFeatured = searchParams.get('featured');
    const isPremium = searchParams.get('premium');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions
    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (isFeatured === 'true') whereClause.isFeatured = true;
    if (isFeatured === 'false') whereClause.isFeatured = false;
    if (isPremium === 'true') whereClause.isPremium = true;
    if (isPremium === 'false') whereClause.isPremium = false;

    // Get templates with pagination
    const [templates, totalCount] = await Promise.all([
      db.webDesignerTemplate.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { usageCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webDesignerTemplate.count({ where: whereClause }),
    ]);

    // Get template statistics
    const stats = await db.webDesignerTemplate.groupBy({
      by: ['category', 'status'],
      _count: {
        id: true,
      },
    });

    // Format response
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      templateName: template.templateName,
      category: template.category,
      previewImageUrl: template.previewImageUrl,
      isPremium: template.isPremium,
      isFeatured: template.isFeatured,
      usageCount: template.usageCount,
      status: template.status,
      projectsCount: template._count.projects,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));

    return NextResponse.json({
      templates: formattedTemplates,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
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
    const { templateId, ...updateData } = body;
    const validatedData = updateTemplateSchema.parse(updateData);

    // Find the template
    const template = await db.webDesignerTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update template
    const updatedTemplate = await db.webDesignerTemplate.update({
      where: { id: templateId },
      data: validatedData,
    });

    return NextResponse.json({
      id: updatedTemplate.id,
      templateName: updatedTemplate.templateName,
      category: updatedTemplate.category,
      previewImageUrl: updatedTemplate.previewImageUrl,
      isPremium: updatedTemplate.isPremium,
      isFeatured: updatedTemplate.isFeatured,
      usageCount: updatedTemplate.usageCount,
      status: updatedTemplate.status,
      updatedAt: updatedTemplate.updatedAt,
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating template:', error);
    
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