import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const currentUser = firebaseAuth.getCurrentUser()

    if (!currentUser || !currentUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: currentUser.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const feature = searchParams.get('feature') // optional filter by feature

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Build where clause
    const whereClause: any = {
      userId: user.id,
      createdAt: {
        gte: startDate
      }
    }

    if (feature && feature !== 'all') {
      whereClause.featureUsed = feature
    }

    // Fetch AI usage logs
    const usageLogs = await db.aIUsageLog.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Calculate analytics
    const analytics = {
      totalRequests: usageLogs.length,
      totalCost: usageLogs.reduce((sum, log) => sum + (log.usageCost || 0), 0),
      averageProcessingTime: usageLogs.length > 0
        ? usageLogs.reduce((sum, log) => sum + (log.processingTime || 0), 0) / usageLogs.length
        : 0,
      totalProcessingTime: usageLogs.reduce((sum, log) => sum + (log.processingTime || 0), 0),

      // Feature breakdown
      featureBreakdown: usageLogs.reduce((acc, log) => {
        const feature = log.featureUsed
        if (!acc[feature]) {
          acc[feature] = {
            count: 0,
            cost: 0,
            avgProcessingTime: 0,
            totalProcessingTime: 0
          }
        }
        acc[feature].count++
        acc[feature].cost += log.usageCost || 0
        acc[feature].totalProcessingTime += log.processingTime || 0
        return acc
      }, {} as Record<string, any>),

      // Daily usage trends
      dailyUsage: usageLogs.reduce((acc, log) => {
        const date = log.timestamp.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = {
            requests: 0,
            cost: 0,
            processingTime: 0
          }
        }
        acc[date].requests++
        acc[date].cost += log.usageCost || 0
        acc[date].processingTime += log.processingTime || 0
        return acc
      }, {} as Record<string, any>),

      // Most recent activities
      recentActivities: usageLogs.slice(0, 10).map(log => ({
        id: log.id,
        feature: log.featureUsed,
        cost: log.usageCost,
        processingTime: log.processingTime,
        timestamp: log.timestamp,
      }))
    }

    // Calculate average processing time per feature
    Object.keys(analytics.featureBreakdown).forEach(feature => {
      const breakdown = analytics.featureBreakdown[feature]
      breakdown.avgProcessingTime = breakdown.count > 0
        ? breakdown.totalProcessingTime / breakdown.count
        : 0
    })

    return NextResponse.json({
      success: true,
      analytics,
      period,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error("Error fetching AI analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI analytics" },
      { status: 500 }
    )
  }
}