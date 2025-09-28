import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiDesignerService } from '@/features/ai-designer/services/ai-designer-service'
import { z } from 'zod'

const generateColorsSchema = z.object({
  brandColors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).optional(),
  industryType: z.string().optional(),
  stylePreference: z.enum(['vibrant', 'minimal', 'corporate', 'modern', 'earthy', 'pastel']).optional(),
  baseColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = generateColorsSchema.parse(body)

    const result = await aiDesignerService.generateColorPalette(session.user.id, validatedData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Color generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate color palette' },
      { status: 500 }
    )
  }
}