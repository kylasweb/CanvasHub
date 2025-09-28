import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const billingCycle = searchParams.get('billingCycle');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (billingCycle && billingCycle !== 'all') {
      where.billingCycle = billingCycle;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get plans with counts
    const [plans, total] = await Promise.all([
      db.saaSPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
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
              amount: true
            }
          }
        }
      }),
      db.saaSPlan.count({ where })
    ]);

    // Calculate metrics for each plan
    const plansWithMetrics = plans.map(plan => {
      const activeSubscriptions = plan.subscriptions.filter(s => s.status === 'ACTIVE');
      const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      
      return {
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
      };
    });

    return NextResponse.json({
      success: true,
      data: plansWithMetrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching SAAS plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SAAS plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the plan
    const plan = await db.saaSPlan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        currency: currency || 'USD',
        billingCycle,
        features: JSON.stringify(features || []),
        limits: JSON.stringify(limits || {}),
        status: status || 'DRAFT',
        sortOrder: sortOrder || 0,
        isPopular: isPopular || false,
        trialDays: trialDays || 0,
        setupFee: setupFee || 0,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error creating SAAS plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SAAS plan' },
      { status: 500 }
    );
  }
}