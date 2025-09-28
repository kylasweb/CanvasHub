import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
  try {
    const { influencerId } = await params
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
    const validatedData = updateStatusSchema.parse(body);

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

    // Update influencer status
    const updatedInfluencer = await db.influencer.update({
      where: { id: influencerId },
      data: {
        status: validatedData.status,
        // Generate tracking link when activating
        ...(validatedData.status === 'ACTIVE' && !influencer.trackingLink && {
          trackingLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/ref/${influencerId}`,
        }),
      },
      include: {
        user: true,
      },
    });

    // Log the status change
    await db.influencerMetric.create({
      data: {
        influencerId,
        eventType: 'CLICK', // Using CLICK as a generic event type for admin actions
        sourceIp: 'admin',
        eventData: JSON.stringify({
          action: 'status_update',
          oldStatus: influencer.status,
          newStatus: validatedData.status,
          adminId: session.user.id,
          adminEmail: session.user.email,
        }),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      id: updatedInfluencer.id,
      userId: updatedInfluencer.userId,
      userName: updatedInfluencer.user.name,
      userEmail: updatedInfluencer.user.email,
      status: updatedInfluencer.status,
      trackingLink: updatedInfluencer.trackingLink,
      commissionRate: updatedInfluencer.commissionRate,
      updatedAt: updatedInfluencer.updatedAt,
      message: `Influencer status updated to ${validatedData.status}`,
    });
  } catch (error) {
    console.error('Error updating influencer status:', error);

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