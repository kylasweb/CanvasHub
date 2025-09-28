import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiDesignerService } from '@/features/ai-designer/services/ai-designer-service'
import { z } from 'zod'

const generateContentSchema = z.object({
  businessType: z.string().min(1, 'Business type is required'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  topic: z.string().min(1, 'Topic is required'),
  writingStyle: z.enum(['formal', 'casual', 'professional', 'friendly']).optional(),
  wordCount: z.number().min(10).max(2000).optional(),
  context: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = generateContentSchema.parse(body)

    const result = await aiDesignerService.generateContent(session.user.id, validatedData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Content generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}