import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'EDITOR']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  emailVerified: z.boolean().optional(),
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
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const emailVerified = searchParams.get('emailVerified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build filter conditions
    const whereClause: any = {};
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (emailVerified === 'true') whereClause.emailVerified = true;
    if (emailVerified === 'false') whereClause.emailVerified = false;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          // Count relations
          _count: {
            select: {
              projects: true,
              clientProfiles: true,
              invoices: true,
              subscriptions: true,
              activityLogs: true,
              visitingCards: true,
              webDesigns: true,
              agencyMembers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where: whereClause }),
    ]);

    // Format response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      stats: {
        totalProjects: user._count.projects,
        totalClientProfiles: user._count.clientProfiles,
        totalInvoices: user._count.invoices,
        hasSubscription: user._count.subscriptions > 0,
        totalActivityLogs: user._count.activityLogs,
        totalVisitingCards: user._count.visitingCards,
        totalWebDesigns: user._count.webDesigns,
        totalAgencyMemberships: user._count.agencyMembers,
      },
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
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
    const validatedData = updateUserSchema.parse(body);

    // Check if email already exists (if email is being updated)
    if (validatedData.email) {
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Create new user
    const newUser = await db.user.create({
      data: {
        email: validatedData.email || '',
        name: validatedData.name,
        phone: validatedData.phone,
        role: validatedData.role || 'USER',
        status: validatedData.status || 'ACTIVE',
        emailVerified: validatedData.emailVerified || false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log user creation
    console.log(`New user created by admin ${session.user.email}:`, {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });

    return NextResponse.json({
      user: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
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