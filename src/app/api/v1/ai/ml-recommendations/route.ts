import { NextRequest, NextResponse } from "next/server"
import { aiDesignerService } from "@/features/ai-designer/services/ai-designer-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...recommendationRequest } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!recommendationRequest.currentPage || !recommendationRequest.businessGoals) {
      return NextResponse.json(
        { error: "Current page and business goals are required" },
        { status: 400 }
      )
    }

    const result = await aiDesignerService.getPersonalizedSuggestions(userId, recommendationRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("ML-powered recommendation error:", error)
    return NextResponse.json(
      { error: "Failed to generate ML-powered personalized recommendations" },
      { status: 500 }
    )
  }
}