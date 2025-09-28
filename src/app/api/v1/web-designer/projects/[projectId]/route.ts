import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateProjectSchema = z.object({
  projectName: z.string().min(1).max(100).optional(),
  siteData: z.any().optional(),
  customDomain: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Get project details
    const project = await db.webDesignerProject.findUnique({
      where: {
        id: projectId,
        userId: session.user.id, // Ensure user owns the project
      },
      include: {
        assets: true,
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: project.id,
      projectName: project.projectName,
      siteData: project.siteData,
      customDomain: project.customDomain,
      status: project.status,
      assets: project.assets,
      assetCount: project._count.assets,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    const body = await request.json();

    // Validate request body
    const validationResult = updateProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update project
    const updatedProject = await db.webDesignerProject.update({
      where: {
        id: projectId,
        userId: session.user.id, // Ensure user owns the project
      },
      data: updateData,
      include: {
        assets: true,
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedProject.id,
      projectName: updatedProject.projectName,
      siteData: updatedProject.siteData,
      customDomain: updatedProject.customDomain,
      status: updatedProject.status,
      assets: updatedProject.assets,
      assetCount: updatedProject._count.assets,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Delete project (this will cascade delete assets due to Prisma schema)
    await db.webDesignerProject.delete({
      where: {
        id: projectId,
        userId: session.user.id, // Ensure user owns the project
      },
    });

    return NextResponse.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}