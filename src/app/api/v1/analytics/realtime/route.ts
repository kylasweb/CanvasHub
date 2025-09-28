import { NextRequest, NextResponse } from "next/server"
import { advancedAnalyticsService } from "@/features/analytics/services/advanced-analytics-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...analyticsRequest } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!analyticsRequest.metrics || !analyticsRequest.timeWindow) {
      return NextResponse.json(
        { error: "Metrics and time window are required" },
        { status: 400 }
      )
    }

    const result = await advancedAnalyticsService.getRealTimeAnalytics(userId, analyticsRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Real-time analytics error:", error)
    return NextResponse.json(
      { error: "Failed to get real-time analytics" },
      { status: 500 }
    )
  }
}