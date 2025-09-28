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

    if (!analyticsRequest.timeRange || !analyticsRequest.metrics) {
      return NextResponse.json(
        { error: "Time range and metrics are required" },
        { status: 400 }
      )
    }

    // Convert date strings to Date objects
    analyticsRequest.timeRange.start = new Date(analyticsRequest.timeRange.start)
    analyticsRequest.timeRange.end = new Date(analyticsRequest.timeRange.end)

    const result = await advancedAnalyticsService.generateAdvancedAnalytics(userId, analyticsRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Advanced analytics error:", error)
    return NextResponse.json(
      { error: "Failed to generate advanced analytics" },
      { status: 500 }
    )
  }
}