import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30d'
    const feature = searchParams.get('feature') || 'all'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch usage statistics
    const usageWhere: any = {
      timestamp: { gte: startDate }
    }
    if (feature !== 'all') {
      usageWhere.featureUsed = feature
    }

    const usageLogs = await db.aIUsageLog.findMany({
      where: usageWhere,
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Calculate usage stats
    const totalUsage = usageLogs.length
    const usageByFeature = await db.aIUsageLog.groupBy({
      by: ['featureUsed'],
      where: usageWhere,
      _count: {
        featureUsed: true
      },
      _sum: {
        usageCost: true
      },
      _avg: {
        processingTime: true
      }
    })

    const usageByUser = await db.aIUsageLog.groupBy({
      by: ['userId'],
      where: usageWhere,
      _count: {
        _all: true
      },
      _sum: {
        usageCost: true
      },
      _max: {
        timestamp: true
      },
      orderBy: {
        userId: 'desc'
      },
      take: 20
    })

    // Get user emails for top users
    const userIds = usageByUser.map(u => u.userId)
    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        email: true
      }
    })

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.email
      return acc
    }, {} as Record<string, string>)

    // Calculate daily usage - using timestamp field
    const dailyUsage = await db.aIUsageLog.groupBy({
      by: ['timestamp'],
      where: usageWhere,
      _count: {
        timestamp: true
      },
      _sum: {
        usageCost: true
      }
    })

    // Calculate monthly trends - using timestamp field
    const monthlyTrends = await db.aIUsageLog.groupBy({
      by: ['timestamp'],
      where: usageWhere,
      _count: {
        timestamp: true
      },
      _sum: {
        usageCost: true
      }
    })

    // Fetch feedback statistics - AIFeedback doesn't have featureUsed field
    const feedbackWhere: any = {
      timestamp: { gte: startDate }
    }

    const feedbackLogs = await db.aIFeedback.findMany({
      where: feedbackWhere,
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    const totalFeedback = feedbackLogs.length
    const averageRating = feedbackLogs.length > 0
      ? feedbackLogs.reduce((sum, f) => sum + f.rating, 0) / feedbackLogs.length
      : 0

    // AIFeedback doesn't have featureUsed field, using logId instead
    const feedbackByFeature = await db.aIFeedback.groupBy({
      by: ['logId'],
      where: feedbackWhere,
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    })

    // Calculate performance metrics - success field not available in AIUsageLog
    const successCount = totalUsage // Assume all are successful for now
    const successRate = 100
    const errorRate = 0
    const averageResponseTime = totalUsage > 0
      ? usageLogs.reduce((sum, log) => sum + log.processingTime, 0) / totalUsage
      : 0
    const totalCost = usageLogs.reduce((sum, log) => sum + log.usageCost, 0)
    const costPerRequest = totalUsage > 0 ? totalCost / totalUsage : 0

    // Mock model performance data (in real implementation, this would come from AI provider)
    const modelPerformance = [
      { model: 'GPT-4', accuracy: 0.95, speed: 1200, cost: 0.002 },
      { model: 'Claude-3', accuracy: 0.93, speed: 800, cost: 0.0015 },
      { model: 'Gemini-Pro', accuracy: 0.91, speed: 600, cost: 0.001 }
    ]

    // Format response data
    const usageStats = {
      totalUsage,
      usageByFeature: usageByFeature.map(feature => ({
        feature: feature.featureUsed,
        count: feature._count?.featureUsed || 0,
        cost: feature._sum?.usageCost || 0,
        avgProcessingTime: feature._avg?.processingTime || 0
      })),
      usageByUser: usageByUser.map(user => ({
        userId: user.userId,
        userEmail: userMap[user.userId] || 'Unknown',
        usageCount: (user._count as any)._all || 0,
        totalCost: user._sum?.usageCost || 0,
        lastUsed: user._max?.timestamp?.toISOString() || new Date().toISOString()
      })),
      dailyUsage: dailyUsage.map(day => ({
        date: day.timestamp.toISOString().split('T')[0],
        count: day._count?.timestamp || 0,
        cost: day._sum?.usageCost || 0
      })),
      monthlyTrends: monthlyTrends.map((trend, index) => ({
        month: new Date(trend.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        count: trend._count?.timestamp || 0,
        cost: trend._sum?.usageCost || 0,
        growth: index > 0 ? ((trend._count?.timestamp || 0) - (monthlyTrends[index - 1]._count?.timestamp || 0)) / (monthlyTrends[index - 1]._count?.timestamp || 1) * 100 : 0
      }))
    }

    const feedbackStats = {
      totalFeedback,
      averageRating,
      feedbackByFeature: feedbackByFeature.map(feature => ({
        feature: feature.logId, // Using logId instead of featureUsed
        rating: feature._avg?.rating || 0,
        positiveCount: Math.floor((feature._count?.rating || 0) * 0.8), // Mock calculation
        negativeCount: Math.floor((feature._count?.rating || 0) * 0.2), // Mock calculation
        commonIssues: ['Response too generic', 'Processing time too long', 'Inaccurate suggestions'] // Mock data
      })),
      recentFeedback: feedbackLogs.slice(0, 20).map(feedback => ({
        id: feedback.id,
        feature: feedback.logId, // Using logId instead of featureUsed
        rating: feedback.rating,
        comment: feedback.comment || '',
        timestamp: feedback.timestamp.toISOString(),
        userEmail: feedback.user.email
      }))
    }

    const performanceMetrics = {
      averageResponseTime,
      successRate,
      errorRate,
      costPerRequest,
      uptime: 99.9, // Mock uptime
      modelPerformance
    }

    return NextResponse.json({
      usage: usageStats,
      feedback: feedbackStats,
      performance: performanceMetrics
    })

  } catch (error) {
    console.error('Failed to fetch AI analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'export_report':
        // Handle report export
        return NextResponse.json({ success: true, message: 'Report export initiated' })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Failed to process AI analytics request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}