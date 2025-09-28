import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createClientSchema = z.object({
  clientName: z.string().min(1).max(100),
});

export async function POST(
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
    const validatedData = createClientSchema.parse(body);

    // Check if user is a member of this agency
    const membership = await db.agencyMember.findUnique({
      where: {
        agencyId_userId: {
          userId: session.user.id,
          agencyId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied. Not a member of this agency.' },
        { status: 403 }
      );
    }

    // Create client
    const client = await db.client.create({
      data: {
        agencyId,
        clientName: validatedData.clientName,
      },
    });

    return NextResponse.json({
      id: client.id,
      agencyId: client.agencyId,
      name: client.clientName,
      createdAt: client.createdAt,
      message: 'Client created successfully',
    });
  } catch (error) {
    console.error('Error creating client:', error);

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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');

    // Check if user is a member of this agency
    const membership = await db.agencyMember.findUnique({
      where: {
        agencyId_userId: {
          userId: session.user.id,
          agencyId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied. Not a member of this agency.' },
        { status: 403 }
      );
    }

    // Build filter conditions
    const whereClause: any = { agencyId };

    // Get clients with campaigns
    const clients = await db.client.findMany({
      where: whereClause,
      include: {
        campaigns: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formattedClients = clients.map(client => ({
      id: client.id,
      agencyId: client.agencyId,
      name: client.clientName,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      stats: {
        totalCampaigns: client._count.campaigns,
        activeCampaigns: client.campaigns.filter(c => c.status === 'ACTIVE').length,
      },
      recentCampaigns: client.campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.campaignName,
        status: campaign.status,
      })),
    }));

    return NextResponse.json({
      clients: formattedClients,
      totalClients: formattedClients.length,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}