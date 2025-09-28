import { NextRequest, NextResponse } from "next/server"
import { aiDesignerService } from "@/features/ai-designer/services/ai-designer-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...layoutRequest } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!layoutRequest.contentData || !layoutRequest.pageType) {
      return NextResponse.json(
        { error: "Content data and page type are required" },
        { status: 400 }
      )
    }

    const result = await aiDesignerService.suggestLayout(userId, layoutRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Advanced layout suggestion error:", error)
    return NextResponse.json(
      { error: "Failed to generate advanced layout suggestions" },
      { status: 500 }
    )
  }
}