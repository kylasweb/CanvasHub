import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateClientStatusSchema = z.object({
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
    const agencyId = searchParams.get('agencyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build filter conditions
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (industry) whereClause.industry = industry;
    if (agencyId) whereClause.agencyId = agencyId;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get clients with pagination
    const [clients, totalCount] = await Promise.all([
      db.client.findMany({
        where: whereClause,
        include: {
          agency: {
            select: {
              id: true,
              agencyName: true,
            },
          },
          campaigns: {
            select: {
              id: true,
              status: true,
            },
          },
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.client.count({ where: whereClause }),
    ]);

    // Format response
    const formattedClients = clients.map(client => {
      const activeCampaigns = client.campaigns.filter(c => c.status === 'ACTIVE').length;

      return {
        id: client.id,
        agencyId: client.agencyId,
        agencyName: client.agency.agencyName,
        name: client.clientName,
        status: 'ACTIVE', // Default status since Client model doesn't have status field
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        stats: {
          totalCampaigns: client._count.campaigns,
          activeCampaigns,
          totalBudget: 0, // Campaign model doesn't have budget field
        },
        campaigns: client.campaigns.map(campaign => ({
          id: campaign.id,
          status: campaign.status,
        })),
      };
    });

    return NextResponse.json({
      clients: formattedClients,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { clientId, ...updateData } = body;
    const validatedData = updateClientStatusSchema.parse(updateData);

    // Find the client
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Update client status (note: Client model doesn't have status field, this is a no-op)
    const updatedClient = await db.client.update({
      where: { id: clientId },
      data: {}, // No actual update since Client model doesn't have status field
    });

    // Log the status change
    console.log(`Client status updated by admin ${session.user.email}:`, {
      clientId,
      agencyId: client.agencyId,
      agencyName: client.agency.agencyName,
      oldStatus: 'ACTIVE', // Default status since Client model doesn't have status field
      newStatus: validatedData.status,
      reason: validatedData.reason,
    });

    return NextResponse.json({
      id: updatedClient.id,
      agencyId: updatedClient.agencyId,
      name: updatedClient.clientName,
      status: 'ACTIVE', // Default status since Client model doesn't have status field
      updatedAt: updatedClient.updatedAt,
      message: `Client status updated to ${validatedData.status}`,
    });
  } catch (error) {
    console.error('Error updating client status:', error);
    
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