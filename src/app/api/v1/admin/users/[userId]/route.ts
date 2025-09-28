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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
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

    const user = await db.user.findUnique({
      where: { id: userId },
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
        // Include related data
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formattedUser = {
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
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
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

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email already exists (if email is being updated)
    if (validatedData.email && validatedData.email !== user.email) {
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

    // Prevent admin from demoting themselves
    if (user.id === session.user.id && validatedData.role && validatedData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    // Log user update
    console.log(`User updated by admin ${session.user.email}:`, {
      userId: updatedUser.id,
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);

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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
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

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        _count: {
          select: {
            projects: true,
            clientProfiles: true,
            invoices: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user has related data that might need special handling
    const hasRelatedData =
      user._count.projects > 0 ||
      user._count.clientProfiles > 0 ||
      user._count.invoices > 0 ||
      user._count.subscriptions > 0;

    if (hasRelatedData) {
      // Instead of deleting, mark as inactive
      await db.user.update({
        where: { id: userId },
        data: { status: 'INACTIVE' },
      });

      // Log user deactivation
      console.log(`User deactivated by admin ${session.user.email}:`, {
        userId: user.id,
        email: user.email,
        reason: 'Has related data, deactivated instead of deleted',
      });

      return NextResponse.json({
        message: 'User deactivated due to existing related data',
        userId: user.id,
      });
    }

    // Delete the user
    await db.user.delete({
      where: { id: userId },
    });

    // Log user deletion
    console.log(`User deleted by admin ${session.user.email}:`, {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      message: 'User deleted successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}