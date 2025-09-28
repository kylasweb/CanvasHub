import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingDesign = await db.webDesign.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    const publishedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/designs/${id}`

    const design = await db.webDesign.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedUrl,
        publishedAt: new Date()
      }
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error publishing web design:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
