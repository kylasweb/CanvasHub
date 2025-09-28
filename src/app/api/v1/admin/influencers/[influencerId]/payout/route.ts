import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createPayoutSchema = z.object({
  amount: z.number().positive(),
  payoutMethod: z.enum(['Bank Transfer', 'PayPal', 'Stripe', 'Wise']),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
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

    const { influencerId } = await params;
    const body = await request.json();
    const validatedData = createPayoutSchema.parse(body);

    // Find the influencer
    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    // Check if influencer is active
    if (influencer.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot create payout for inactive influencer' },
        { status: 400 }
      );
    }

    // Calculate total pending payouts to prevent duplicate payments
    const existingPendingPayouts = await db.influencerPayout.findMany({
      where: {
        influencerId,
        status: 'PENDING',
      },
    });

    const totalPending = existingPendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    // Create the payout
    const payout = await db.influencerPayout.create({
      data: {
        influencerId,
        amount: validatedData.amount,
        status: 'PENDING',
        payoutMethod: validatedData.payoutMethod,
      },
    });

    // Log the payout creation
    await db.influencerMetric.create({
      data: {
        influencerId,
        eventType: 'CLICK', // Using CLICK as a generic event type for admin actions
        sourceIp: 'admin',
        eventData: JSON.stringify({
          action: 'payout_created',
          payoutId: payout.id,
          amount: validatedData.amount,
          payoutMethod: validatedData.payoutMethod,
          adminId: session.user.id,
          adminEmail: session.user.email,
          notes: validatedData.notes,
        }),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      id: payout.id,
      influencerId: payout.influencerId,
      influencerName: influencer.user.name,
      influencerEmail: influencer.user.email,
      amount: payout.amount,
      status: payout.status,
      payoutMethod: payout.payoutMethod,
      createdAt: payout.createdAt,
      message: 'Payout created successfully',
    });
  } catch (error) {
    console.error('Error creating payout:', error);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
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

    const { influencerId } = await params;
    const body = await request.json();

    // Find pending payouts for this influencer
    const pendingPayouts = await db.influencerPayout.findMany({
      where: {
        influencerId,
        status: 'PENDING',
      },
    });

    if (pendingPayouts.length === 0) {
      return NextResponse.json(
        { error: 'No pending payouts found for this influencer' },
        { status: 404 }
      );
    }

    // Process all pending payouts
    const transactionId = `TXN${Date.now()}`;
    const processedAt = new Date();

    const processedPayouts = await Promise.all(
      pendingPayouts.map(payout =>
        db.influencerPayout.update({
          where: { id: payout.id },
          data: {
            status: 'PROCESSED',
            transactionId,
            processedAt,
          },
        })
      )
    );

    // Get influencer details for logging
    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the payout processing
    await db.influencerMetric.create({
      data: {
        influencerId,
        eventType: 'CLICK', // Using CLICK as a generic event type for admin actions
        sourceIp: 'admin',
        eventData: JSON.stringify({
          action: 'payouts_processed',
          transactionId,
          payoutCount: processedPayouts.length,
          totalAmount: processedPayouts.reduce((sum, p) => sum + Number(p.amount), 0),
          adminId: session.user.id,
          adminEmail: session.user.email,
        }),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      transactionId,
      processedCount: processedPayouts.length,
      totalAmount: processedPayouts.reduce((sum, p) => sum + Number(p.amount), 0),
      processedAt,
      influencerName: influencer?.user.name,
      influencerEmail: influencer?.user.email,
      message: `${processedPayouts.length} payout(s) processed successfully`,
    });
  } catch (error) {
    console.error('Error processing payouts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}