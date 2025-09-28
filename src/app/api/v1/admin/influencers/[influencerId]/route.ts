import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateInfluencerSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  trackingLink: z.string().url().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
});

export async function GET(
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

    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 50, // Last 50 metrics
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 payouts
        },
        _count: {
          select: {
            metrics: true,
            payouts: true,
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

    const totalClicks = influencer.metrics.filter(m => m.eventType === 'CLICK').length;
    const totalSignups = influencer.metrics.filter(m => m.eventType === 'SIGNUP').length;
    const totalConversions = influencer.metrics.filter(m => m.eventType === 'CONVERSION').length;
    const totalPayouts = influencer.payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
    const pendingPayouts = influencer.payouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, payout) => sum + Number(payout.amount), 0);

    const formattedInfluencer = {
      id: influencer.id,
      userId: influencer.userId,
      status: influencer.status,
      trackingLink: influencer.trackingLink,
      commissionRate: Number(influencer.commissionRate),
      createdAt: influencer.createdAt,
      updatedAt: influencer.updatedAt,
      user: influencer.user,
      metrics: influencer.metrics,
      payouts: influencer.payouts,
      stats: {
        totalClicks,
        totalSignups,
        totalConversions,
        conversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0,
        totalPayouts,
        pendingPayouts,
        totalMetrics: influencer._count.metrics,
        totalPayoutsCount: influencer._count.payouts,
      },
    };

    return NextResponse.json({ influencer: formattedInfluencer });
  } catch (error) {
    console.error('Error fetching influencer:', error);
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
    const validatedData = updateInfluencerSchema.parse(body);

    // Find the influencer
    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    // Check if tracking link already exists (if tracking link is being updated)
    if (validatedData.trackingLink && validatedData.trackingLink !== influencer.trackingLink) {
      const existingInfluencer = await db.influencer.findUnique({
        where: { trackingLink: validatedData.trackingLink },
      });

      if (existingInfluencer) {
        return NextResponse.json(
          { error: 'Influencer with this tracking link already exists' },
          { status: 409 }
        );
      }
    }

    // Update influencer
    const updatedInfluencer = await db.influencer.update({
      where: { id: influencerId },
      data: validatedData,
    });

    // Log influencer update
    console.log(`Influencer updated by admin ${session.user.email}:`, {
      influencerId: updatedInfluencer.id,
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({
      influencer: {
        ...updatedInfluencer,
        commissionRate: Number(updatedInfluencer.commissionRate),
      },
      message: 'Influencer updated successfully',
    });
  } catch (error) {
    console.error('Error updating influencer:', error);

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

    // Find the influencer
    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
      select: {
        id: true,
        userId: true,
        status: true,
        _count: {
          select: {
            metrics: true,
            payouts: true,
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

    // Check if influencer has related data
    const hasRelatedData = influencer._count.metrics > 0 || influencer._count.payouts > 0;

    if (hasRelatedData) {
      // Instead of deleting, mark as suspended
      await db.influencer.update({
        where: { id: influencerId },
        data: { status: 'SUSPENDED' },
      });

      // Log influencer suspension
      console.log(`Influencer suspended by admin ${session.user.email}:`, {
        influencerId: influencer.id,
        userId: influencer.userId,
        reason: 'Has related data, suspended instead of deleted',
        metricsCount: influencer._count.metrics,
        payoutsCount: influencer._count.payouts,
      });

      return NextResponse.json({
        message: 'Influencer suspended due to existing related data',
        influencerId: influencer.id,
      });
    }

    // Delete the influencer
    await db.influencer.delete({
      where: { id: influencerId },
    });

    // Log influencer deletion
    console.log(`Influencer deleted by admin ${session.user.email}:`, {
      influencerId: influencer.id,
      userId: influencer.userId,
    });

    return NextResponse.json({
      message: 'Influencer deleted successfully',
      influencerId: influencer.id,
    });
  } catch (error) {
    console.error('Error deleting influencer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}