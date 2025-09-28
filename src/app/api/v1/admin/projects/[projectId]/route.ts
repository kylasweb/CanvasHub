import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().min(0).optional(),
  spent: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  clientId: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
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

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        projectMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        timeEntries: {
          select: {
            id: true,
            description: true,
            hours: true,
            date: true,
            rate: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            size: true,
            type: true,
            uploadedAt: true,
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

    const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
    const totalHours = project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      dueDate: project.dueDate,
      progress: project.progress,
      budget: project.budget,
      spent: project.spent,
      tags: project.tags ? JSON.parse(project.tags) : [],
      notes: project.notes,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      user: project.user,
      client: project.client,
      tasks: project.tasks,
      members: project.projectMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        userName: member.user.name,
        userEmail: member.user.email,
        role: member.role,
        joinedAt: member.joinedAt,
        leftAt: member.leftAt,
      })),
      timeEntries: project.timeEntries,
      files: project.files,
      stats: {
        totalTasks: project.tasks.length,
        completedTasks,
        taskCompletionRate: project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0,
        totalMembers: project.projectMembers.length,
        totalHours,
        totalFiles: project.files.length,
      },
    };

    return NextResponse.json({ project: formattedProject });
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
    const { projectId } = await params
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
    const validatedData = updateProjectSchema.parse(body);

    // Find the project
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify user exists if userId is being updated
    if (validatedData.userId) {
      const user = await db.user.findUnique({
        where: { id: validatedData.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Verify client exists if clientId is being updated
    if (validatedData.clientId) {
      const client = await db.clientProfile.findUnique({
        where: { id: validatedData.clientId },
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Convert date strings to Date objects
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    // Convert tags array to JSON string
    if (validatedData.tags) {
      updateData.tags = JSON.stringify(validatedData.tags);
    }

    // Update project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log project update
    console.log(`Project updated by admin ${session.user.email}:`, {
      projectId: updatedProject.id,
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({
      project: {
        ...updatedProject,
        tags: updatedProject.tags ? JSON.parse(updatedProject.tags) : [],
      },
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Error updating project:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
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

    // Find the project
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tasks: true,
            projectMembers: true,
            timeEntries: true,
            files: true,
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

    // Check if project has related data
    const hasRelatedData =
      project._count.tasks > 0 ||
      project._count.projectMembers > 0 ||
      project._count.timeEntries > 0 ||
      project._count.files > 0;

    if (hasRelatedData) {
      // Instead of deleting, mark as cancelled
      await db.project.update({
        where: { id: projectId },
        data: { status: 'CANCELLED' },
      });

      // Log project cancellation
      console.log(`Project cancelled by admin ${session.user.email}:`, {
        projectId: project.id,
        name: project.name,
        reason: 'Has related data, cancelled instead of deleted',
      });

      return NextResponse.json({
        message: 'Project cancelled due to existing related data',
        projectId: project.id,
      });
    }

    // Delete the project
    await db.project.delete({
      where: { id: projectId },
    });

    // Log project deletion
    console.log(`Project deleted by admin ${session.user.email}:`, {
      projectId: project.id,
      name: project.name,
    });

    return NextResponse.json({
      message: 'Project deleted successfully',
      projectId: project.id,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}