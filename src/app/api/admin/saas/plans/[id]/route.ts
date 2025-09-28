import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plan = await db.saaSPlan.findUnique({
      where: { id },
      include: {
        planFeatures: {
          include: {
            feature: true
          }
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            amount: true,
            userId: true
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Calculate metrics
    const activeSubscriptions = plan.subscriptions.filter(s => s.status === 'ACTIVE');
    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        subscribers: activeSubscriptions.length,
        revenue: monthlyRevenue,
        features: plan.planFeatures.map(pf => ({
          id: pf.feature.id,
          name: pf.feature.name,
          description: pf.feature.description,
          value: pf.value,
          isUnlimited: pf.isUnlimited,
          unit: pf.feature.unit
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching SAAS plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SAAS plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      billingCycle,
      features,
      limits,
      status,
      sortOrder,
      isPopular,
      trialDays,
      setupFee,
      metadata
    } = body;

    // Check if plan exists
    const existingPlan = await db.saaSPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Update the plan
    const updatedPlan = await db.saaSPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(billingCycle && { billingCycle }),
        ...(features && { features: JSON.stringify(features) }),
        ...(limits && { limits: JSON.stringify(limits) }),
        ...(status && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isPopular !== undefined && { isPopular }),
        ...(trialDays !== undefined && { trialDays }),
        ...(setupFee !== undefined && { setupFee: parseFloat(setupFee) }),
        ...(metadata !== undefined && { metadata: metadata ? JSON.stringify(metadata) : null })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating SAAS plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SAAS plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if plan exists
    const existingPlan = await db.saaSPlan.findUnique({
      where: { id },
      include: {
        subscriptions: true
      }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = existingPlan.subscriptions.filter(s => s.status === 'ACTIVE');
    if (activeSubscriptions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete plan with active subscriptions' },
        { status: 400 }
      );
    }

    // Delete the plan
    await db.saaSPlan.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SAAS plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SAAS plan' },
      { status: 500 }
    );
  }
}