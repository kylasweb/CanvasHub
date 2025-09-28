import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createProjectSchema = z.object({
  projectName: z.string().min(1).max(100),
  templateId: z.string().optional(),
  customDomain: z.string().url().optional(),
});

const updateProjectSchema = z.object({
  projectName: z.string().min(1).max(100).optional(),
  siteData: z.any().optional(),
  customDomain: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // If templateId is provided, validate it exists
    if (validatedData.templateId) {
      const template = await db.webDesignerTemplate.findUnique({
        where: { id: validatedData.templateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
    }

    // Create project
    const project = await db.webDesignerProject.create({
      data: {
        userId: session.user.id,
        projectName: validatedData.projectName,
        templateId: validatedData.templateId,
        customDomain: validatedData.customDomain,
        status: 'DRAFT',
        siteData: validatedData.templateId 
          ? { template: validatedData.templateId }
          : { pages: [{ id: 'home', name: 'Home', components: [] }] },
      },
      include: {
        template: {
          select: {
            id: true,
            templateName: true,
            category: true,
            previewImageUrl: true,
          },
        },
      },
    });

    // If template is used, increment usage count
    if (validatedData.templateId) {
      await db.webDesignerTemplate.update({
        where: { id: validatedData.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      siteData: project.siteData,
      publishedUrl: project.publishedUrl,
      customDomain: project.customDomain,
      template: project.template,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter conditions
    const whereClause: any = { userId: session.user.id };
    if (status) whereClause.status = status;

    // Get projects with pagination
    const [projects, totalCount] = await Promise.all([
      db.webDesignerProject.findMany({
        where: whereClause,
        include: {
          template: {
            select: {
              id: true,
              templateName: true,
              category: true,
              previewImageUrl: true,
            },
          },
          assets: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              fileSize: true,
              createdAt: true,
            },
            take: 5, // Last 5 assets
            orderBy: { createdAt: 'desc' },
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

    // Format response
    const formattedProjects = projects.map(project => ({
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      publishedUrl: project.publishedUrl,
      customDomain: project.customDomain,
      template: project.template,
      assetsCount: project._count.assets,
      recentAssets: project.assets,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      publishedAt: project.publishedAt,
    }));

    return NextResponse.json({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}