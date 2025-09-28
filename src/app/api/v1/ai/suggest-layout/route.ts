import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiDesignerService } from '@/features/ai-designer/services/ai-designer-service'
import { z } from 'zod'

const suggestLayoutSchema = z.object({
  contentData: z.record(z.string(), z.any()),
  pageType: z.string().min(1, 'Page type is required'),
  industryType: z.string().optional(),
  preferences: z.object({
    layoutStyle: z.enum(['modern', 'classic', 'minimal', 'creative']),
    colorScheme: z.array(z.string()).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = suggestLayoutSchema.parse(body)

    const result = await aiDesignerService.suggestLayout(session.user.id, validatedData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Layout suggestion error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to suggest layout' },
      { status: 500 }
    )
  }
}