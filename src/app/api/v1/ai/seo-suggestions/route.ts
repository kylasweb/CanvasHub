import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiDesignerService } from '@/features/ai-designer/services/ai-designer-service'
import { z } from 'zod'

const seoSuggestionsSchema = z.object({
  pageContent: z.string().min(10, 'Page content is required'),
  keywords: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  industry: z.string().optional(),
  competitorAnalysis: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = seoSuggestionsSchema.parse(body)

    const result = await aiDesignerService.getSEOSuggestions(session.user.id, validatedData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('SEO suggestions error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate SEO suggestions' },
      { status: 500 }
    )
  }
}