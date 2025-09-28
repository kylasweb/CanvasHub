import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get all SAAS plans with their subscriptions
    const plans = await db.saaSPlan.findMany({
      include: {
        subscriptions: {
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    });

    // Calculate metrics
    const totalSubscribers = plans.reduce((sum, plan) => {
      const activeSubs = plan.subscriptions.filter(s => s.status === 'ACTIVE');
      return sum + activeSubs.length;
    }, 0);

    const monthlyRevenue = plans.reduce((sum, plan) => {
      const activeSubs = plan.subscriptions.filter(s => s.status === 'ACTIVE');
      return sum + activeSubs.reduce((subSum, sub) => subSum + sub.amount, 0);
    }, 0);

    const totalSubscriptions = plans.reduce((sum, plan) => sum + plan.subscriptions.length, 0);
    const cancelledSubscriptions = plans.reduce((sum, plan) => {
      const cancelledSubs = plan.subscriptions.filter(s => s.status === 'CANCELLED');
      return sum + cancelledSubs.length;
    }, 0);

    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;
    const arpu = totalSubscribers > 0 ? monthlyRevenue / totalSubscribers : 0;

    // Get plan performance data
    const planPerformance = plans.map(plan => {
      const activeSubs = plan.subscriptions.filter(s => s.status === 'ACTIVE');
      const cancelledSubs = plan.subscriptions.filter(s => s.status === 'CANCELLED');
      const planRevenue = activeSubs.reduce((sum, sub) => sum + sub.amount, 0);
      const planChurnRate = plan.subscriptions.length > 0 ? (cancelledSubs.length / plan.subscriptions.length) * 100 : 0;
      
      return {
        planName: plan.name,
        subscribers: activeSubs.length,
        revenue: planRevenue,
        churnRate: planChurnRate,
        growth: 0 // This would require historical data comparison
      };
    });

    // Get revenue trend (simplified - would need more complex queries for real data)
    const revenueTrend: Array<{
      month: string;
      revenue: number;
      subscriptions: number;
      churn: number;
    }> = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      revenueTrend.unshift({
        month: monthName,
        revenue: Math.floor(monthlyRevenue * (0.8 + Math.random() * 0.4)), // Simulated data
        subscriptions: Math.floor(totalSubscribers * (0.8 + Math.random() * 0.4)), // Simulated data
        churn: churnRate * (0.8 + Math.random() * 0.4) // Simulated data
      });
    }

    // Get feature usage data (simplified)
    const features = await db.saaSFeature.findMany({
      include: {
        saasUsage: {
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    });

    const featureUsage = features.map(feature => {
      const totalUsage = feature.saasUsage.reduce((sum, usage) => sum + usage.value, 0);
      const usageCount = feature.saasUsage.length;
      const averageUsage = usageCount > 0 ? totalUsage / usageCount : 0;
      
      return {
        name: feature.name,
        category: feature.category,
        usage: Math.min(100, Math.floor(averageUsage * 10)), // Convert to percentage
        satisfaction: 70 + Math.floor(Math.random() * 25) // Simulated satisfaction
      };
    }).filter(f => f.usage > 0).sort((a, b) => b.usage - a.usage).slice(0, 10);

    // Get cohort data (simplified)
    const cohortData: Array<{
      cohort: string;
      month1: number;
      month3: number;
      month6: number | null;
      month12: number | null;
    }> = [];
    const cohorts = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
    
    for (let i = 0; i < cohorts.length; i++) {
      const cohort = {
        cohort: cohorts[i],
        month1: 100,
        month3: Math.max(70, 100 - i * 3 - Math.floor(Math.random() * 5)),
        month6: i < 4 ? Math.max(60, 100 - i * 5 - Math.floor(Math.random() * 8)) : null,
        month12: i < 2 ? Math.max(50, 100 - i * 8 - Math.floor(Math.random() * 10)) : null
      };
      cohortData.push(cohort);
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          monthlyRevenue,
          totalSubscribers,
          customerLifetimeValue: arpu * 12, // Simplified calculation
          churnRate,
          averageRevenuePerUser: arpu,
          conversionRate: 2.5 + Math.random() * 3 // Simulated conversion rate
        },
        revenueTrend,
        planPerformance,
        featureUsage,
        cohortData
      }
    });
  } catch (error) {
    console.error('Error fetching SAAS analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SAAS analytics' },
      { status: 500 }
    );
  }
}