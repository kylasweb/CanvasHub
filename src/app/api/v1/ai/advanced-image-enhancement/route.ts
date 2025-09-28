import { NextRequest, NextResponse } from "next/server"
import { aiDesignerService } from "@/features/ai-designer/services/ai-designer-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...enhancementRequest } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!enhancementRequest.imageUrl || !enhancementRequest.enhancementType) {
      return NextResponse.json(
        { error: "Image URL and enhancement type are required" },
        { status: 400 }
      )
    }

    const result = await aiDesignerService.enhanceImage(userId, enhancementRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Advanced image enhancement error:", error)
    return NextResponse.json(
      { error: "Failed to enhance image with advanced processing" },
      { status: 500 }
    )
  }
}