import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  clientId: z.string().optional(),
  userId: z.string(),
});

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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const clientId = searchParams.get('clientId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build filter conditions
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (clientId) whereClause.clientId = clientId;
    if (userId) whereClause.userId = userId;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get projects with pagination
    const [projects, totalCount] = await Promise.all([
      db.project.findMany({
        where: whereClause,
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
              status: true,
              priority: true,
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
              hours: true,
              date: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              projectMembers: true,
              timeEntries: true,
              files: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.project.count({ where: whereClause }),
    ]);

    // Format response
    const formattedProjects = projects.map(project => {
      const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
      const totalHours = project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      
      return {
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
        members: project.projectMembers.map(member => ({
          id: member.id,
          userId: member.userId,
          userName: member.user.name,
          userEmail: member.user.email,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
        stats: {
          totalTasks: project._count.tasks,
          completedTasks,
          taskCompletionRate: project._count.tasks > 0 ? Math.round((completedTasks / project._count.tasks) * 100) : 0,
          totalMembers: project._count.projectMembers,
          totalHours,
          totalFiles: project._count.files,
        },
      };
    });

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
    const validatedData = createProjectSchema.parse(body);

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify client exists if provided
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

    // Create project
    const newProject = await db.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status || 'PLANNING',
        priority: validatedData.priority || 'MEDIUM',
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        dueDate: new Date(validatedData.dueDate),
        progress: validatedData.progress || 0,
        budget: validatedData.budget,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        notes: validatedData.notes,
        clientId: validatedData.clientId,
        userId: validatedData.userId,
      },
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

    // Log project creation
    console.log(`New project created by admin ${session.user.email}:`, {
      projectId: newProject.id,
      name: newProject.name,
      userId: newProject.userId,
      clientId: newProject.clientId,
    });

    return NextResponse.json({
      project: {
        ...newProject,
        tags: newProject.tags ? JSON.parse(newProject.tags) : [],
      },
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