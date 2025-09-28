import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createAgencySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  industry: z.string().max(50).optional(),
  size: z.enum(['SOLO', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
  specialties: z.array(z.string()).max(10).optional(),
});

const joinAgencySchema = z.object({
  agencyId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).optional().default('MEMBER'),
  position: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a create or join request
    if (body.agencyId) {
      // Join agency request
      const validatedData = joinAgencySchema.parse(body);

      // Check if agency exists
      const agency = await db.agency.findUnique({
        where: { id: validatedData.agencyId },
      });

      if (!agency) {
        return NextResponse.json(
          { error: 'Agency not found' },
          { status: 404 }
        );
      }

      // Check if user is already a member
      const existingMembership = await db.agencyMember.findFirst({
        where: {
          userId: session.user.id,
          agencyId: validatedData.agencyId,
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this agency' },
          { status: 400 }
        );
      }

      // Create agency membership
      const membership = await db.agencyMember.create({
        data: {
          userId: session.user.id,
          agencyId: validatedData.agencyId,
          role: validatedData.role || 'MEMBER',
        },
        include: {
          agency: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        id: membership.id,
        agencyId: membership.agencyId,
        agencyName: membership.agency.agencyName,
        userId: membership.userId,
        userName: membership.user.name,
        userEmail: membership.user.email,
        role: membership.role,
        joinedAt: membership.joinedAt,
        message: 'Successfully joined agency',
      });
    } else {
      // Create agency request
      const validatedData = createAgencySchema.parse(body);

      // Check if user already owns an agency
      const existingOwnership = await db.agencyMember.findFirst({
        where: {
          userId: session.user.id,
          role: 'OWNER',
        },
      });

      if (existingOwnership) {
        return NextResponse.json(
          { error: 'User already owns an agency' },
          { status: 400 }
        );
      }

      // Create agency
      const agency = await db.agency.create({
        data: {
          agencyName: validatedData.name,
          contactEmail: session.user.email,
        },
      });

      // Create owner membership
      const membership = await db.agencyMember.create({
        data: {
          userId: session.user.id,
          agencyId: agency.id,
          role: 'OWNER',
        },
        include: {
          agency: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        id: agency.id,
        name: agency.agencyName,
        contactEmail: agency.contactEmail,
        subscriptionTier: agency.subscriptionTier,
        createdAt: agency.createdAt,
        membership: {
          id: membership.id,
          role: membership.role,
          joinedAt: membership.joinedAt,
        },
        message: 'Agency created successfully',
      });
    }
  } catch (error) {
    console.error('Error processing agency request:', error);

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

    // Get user's agency memberships
    const memberships = await db.agencyMember.findMany({
      where: { userId: session.user.id },
      include: {
        agency: {
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
            },
            clients: {
              include: {
                campaigns: {
                  take: 5,
                  orderBy: { createdAt: 'desc' },
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
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Format response
    const agencies = memberships.map(membership => ({
      id: membership.agency.id,
      name: membership.agency.agencyName,
      contactEmail: membership.agency.contactEmail,
      subscriptionTier: membership.agency.subscriptionTier,
      createdAt: membership.agency.createdAt,
      updatedAt: membership.agency.updatedAt,
      membership: {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
      stats: {
        totalMembers: membership.agency._count.members,
        totalClients: membership.agency._count.clients,
        totalCampaigns: membership.agency.clients.reduce((sum, client) => sum + client.campaigns.length, 0),
      },
      members: membership.agency.members.map(member => ({
        id: member.id,
        userId: member.userId,
        userName: member.user.name,
        userEmail: member.user.email,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      clients: membership.agency.clients.map(client => ({
        id: client.id,
        name: client.clientName,
        createdAt: client.createdAt,
        campaignsCount: client.campaigns.length,
      })),
    }));

    return NextResponse.json({
      agencies,
      totalAgencies: agencies.length,
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}