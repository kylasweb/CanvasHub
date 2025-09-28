import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateAgencySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  industry: z.string().max(50).optional(),
  size: z.enum(['SOLO', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
  specialties: z.array(z.string()).max(10).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
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

    // Check if user is a member of this agency
    const membership = await db.agencyMember.findFirst({
      where: {
        userId: session.user.id,
        agencyId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied. Not a member of this agency.' },
        { status: 403 }
      );
    }

    // Get agency details
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: {
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        clients: {
          include: {
            campaigns: {
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy: { createdAt: 'desc' },
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

    // Calculate agency statistics
    const totalCampaigns = agency.clients.reduce((sum, client) => sum + client.campaigns.length, 0);
    const activeCampaigns = agency.clients.reduce((sum, client) =>
      sum + client.campaigns.filter(c => c.status === 'ACTIVE').length, 0
    );

    return NextResponse.json({
      id: agency.id,
      name: agency.agencyName,
      contactEmail: agency.contactEmail,
      subscriptionTier: agency.subscriptionTier,
      createdAt: agency.createdAt,
      updatedAt: agency.updatedAt,
      stats: {
        totalMembers: agency._count.members,
        totalClients: agency._count.clients,
        totalCampaigns,
        activeCampaigns,
      },
      members: agency.members.map(member => ({
        id: member.id,
        userId: member.userId,
        userName: member.user.name,
        userEmail: member.user.email,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      clients: agency.clients.map(client => ({
        id: client.id,
        name: client.clientName,
        createdAt: client.createdAt,
        campaigns: client.campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.campaignName,
          status: campaign.status,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          createdAt: campaign.createdAt,
        })),
      })),
      userMembership: {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
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

    const body = await request.json();
    const validatedData = updateAgencySchema.parse(body);

    // Check if user is an admin or owner of this agency
    const membership = await db.agencyMember.findFirst({
      where: {
        userId: session.user.id,
        agencyId,
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Access denied. Insufficient permissions.' },
        { status: 403 }
      );
    }

    // Update agency
    const updatedAgency = await db.agency.update({
      where: { id: agencyId },
      data: validatedData,
    });

    return NextResponse.json({
      id: updatedAgency.id,
      name: updatedAgency.agencyName,
      contactEmail: updatedAgency.contactEmail,
      subscriptionTier: updatedAgency.subscriptionTier,
      updatedAt: updatedAgency.updatedAt,
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

    // Check if user is the owner of this agency
    const membership = await db.agencyMember.findFirst({
      where: {
        userId: session.user.id,
        agencyId,
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Access denied. Only agency owners can delete agencies.' },
        { status: 403 }
      );
    }

    // Delete agency (this will cascade delete members, clients, and campaigns)
    await db.agency.delete({
      where: { id: agencyId },
    });

    return NextResponse.json({
      message: 'Agency deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting agency:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}