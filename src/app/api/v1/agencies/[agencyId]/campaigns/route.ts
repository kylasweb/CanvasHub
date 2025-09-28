import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCampaignSchema = z.object({
  clientId: z.string(),
  campaignName: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional().default('DRAFT'),
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
    const validatedData = createCampaignSchema.parse(body);

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

    // Verify client belongs to this agency
    const client = await db.client.findUnique({
      where: {
        id: validatedData.clientId,
        agencyId,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or does not belong to this agency' },
        { status: 404 }
      );
    }

    // Create campaign
    const campaign = await db.campaign.create({
      data: {
        clientId: validatedData.clientId,
        campaignName: validatedData.campaignName,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        status: validatedData.status as any, // Type assertion to handle enum mismatch
      },
      include: {
        client: {
          select: {
            id: true,
            clientName: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: campaign.id,
      clientId: campaign.clientId,
      clientName: (campaign as any).client?.clientName || '',
      name: campaign.campaignName,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      createdAt: campaign.createdAt,
      message: 'Campaign created successfully',
    });
  } catch (error) {
    console.error('Error creating campaign:', error);

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
    const clientId = searchParams.get('clientId');
    const objective = searchParams.get('objective');

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
    const whereClause: any = {
      client: {
        agencyId,
      },
    };
    if (status) whereClause.status = status;
    if (clientId) whereClause.clientId = clientId;

    // Get campaigns
    const campaigns = await db.campaign.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            clientName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate campaign statistics
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;

    return NextResponse.json({
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        clientId: campaign.clientId,
        clientName: campaign.client.clientName,
        name: campaign.campaignName,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      })),
      stats: {
        totalCampaigns: campaigns.length,
        activeCampaigns,
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}