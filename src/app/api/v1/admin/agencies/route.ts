import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createAgencySchema = z.object({
  agencyName: z.string().min(1).max(100),
  contactEmail: z.string().email(),
  subscriptionTier: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).optional(),
});

const updateAgencyStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  reason: z.string().max(500).optional(),
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
    const industry = searchParams.get('industry');
    const size = searchParams.get('size');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build filter conditions
    const whereClause: any = {};
    if (status) whereClause.subscriptionTier = status;
    if (search) {
      whereClause.OR = [
        { agencyName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get agencies with pagination
    const [agencies, totalCount] = await Promise.all([
      db.agency.findMany({
        where: whereClause,
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
                select: {
                  id: true,
                  status: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              clients: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.agency.count({ where: whereClause }),
    ]);

    // Format response
    const formattedAgencies = agencies.map(agency => {
      const totalCampaigns = agency.clients.reduce((sum, client) => sum + client.campaigns.length, 0);
      const activeCampaigns = agency.clients.reduce((sum, client) => 
        sum + client.campaigns.filter(c => c.status === 'ACTIVE').length, 0
      );
      const totalBudget = 0; // Budget field not available in Campaign schema

      return {
        id: agency.id,
        agencyName: agency.agencyName,
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
        owner: agency.members.find(m => m.role === 'OWNER')?.user || null,
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
          clientName: client.clientName,
          campaignsCount: client.campaigns.length,
        })),
      };
    });

    return NextResponse.json({
      agencies: formattedAgencies,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
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
    const validatedData = createAgencySchema.parse(body);

    // Check if agency with this email already exists
    const existingAgency = await db.agency.findUnique({
      where: { contactEmail: validatedData.contactEmail },
    });

    if (existingAgency) {
      return NextResponse.json(
        { error: 'Agency with this email already exists' },
        { status: 409 }
      );
    }

    // Create new agency
    const newAgency = await db.agency.create({
      data: {
        agencyName: validatedData.agencyName,
        contactEmail: validatedData.contactEmail,
        subscriptionTier: validatedData.subscriptionTier || 'BASIC',
      },
    });

    // Log agency creation
    console.log(`New agency created by admin ${session.user.email}:`, {
      agencyId: newAgency.id,
      agencyName: newAgency.agencyName,
      contactEmail: newAgency.contactEmail,
    });

    return NextResponse.json({
      agency: newAgency,
      message: 'Agency created successfully',
    });
  } catch (error) {
    console.error('Error creating agency:', error);
    
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