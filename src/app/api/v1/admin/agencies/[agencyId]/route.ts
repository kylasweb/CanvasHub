import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateAgencySchema = z.object({
  agencyName: z.string().min(1).max(100).optional(),
  contactEmail: z.string().email().optional(),
  subscriptionTier: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { agencyId } = await params
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

    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: {
        members: {
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
        clients: {
          select: {
            id: true,
            clientName: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            members: true,
            clients: true,
          },
        },
      },
    });

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      agency: {
        id: agency.id,
        agencyName: agency.agencyName,
        contactEmail: agency.contactEmail,
        subscriptionTier: agency.subscriptionTier,
        createdAt: agency.createdAt,
        updatedAt: agency.updatedAt,
        members: agency.members.map(member => ({
          id: member.id,
          userId: member.userId,
          userName: member.user.name,
          userEmail: member.user.email,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
        clients: agency.clients,
        stats: {
          totalMembers: agency._count.members,
          totalClients: agency._count.clients,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching agency:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { agencyId } = await params
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
    const validatedData = updateAgencySchema.parse(body);

    // Find the agency
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Check if email already exists (if email is being updated)
    if (validatedData.contactEmail && validatedData.contactEmail !== agency.contactEmail) {
      const existingAgency = await db.agency.findUnique({
        where: { contactEmail: validatedData.contactEmail },
      });

      if (existingAgency) {
        return NextResponse.json(
          { error: 'Agency with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update agency
    const updatedAgency = await db.agency.update({
      where: { id: agencyId },
      data: validatedData,
    });

    // Log agency update
    console.log(`Agency updated by admin ${session.user.email}:`, {
      agencyId: updatedAgency.id,
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({
      agency: updatedAgency,
      message: 'Agency updated successfully',
    });
  } catch (error) {
    console.error('Error updating agency:', error);

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
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const { agencyId } = await params
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

    // Find the agency
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true,
        agencyName: true,
        contactEmail: true,
        _count: {
          select: {
            members: true,
            clients: true,
          },
        },
      },
    });

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Check if agency has related data
    const hasRelatedData = agency._count.members > 0 || agency._count.clients > 0;

    if (hasRelatedData) {
      // Instead of deleting, we could mark as inactive or handle differently
      // For now, we'll delete but log the action
      console.log(`Agency with related data deleted by admin ${session.user.email}:`, {
        agencyId: agency.id,
        agencyName: agency.agencyName,
        membersCount: agency._count.members,
        clientsCount: agency._count.clients,
      });
    }

    // Delete the agency (this will cascade delete members and clients due to the schema relations)
    await db.agency.delete({
      where: { id: agencyId },
    });

    // Log agency deletion
    console.log(`Agency deleted by admin ${session.user.email}:`, {
      agencyId: agency.id,
      agencyName: agency.agencyName,
      contactEmail: agency.contactEmail,
    });

    return NextResponse.json({
      message: 'Agency deleted successfully',
      agencyId: agency.id,
    });
  } catch (error) {
    console.error('Error deleting agency:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}