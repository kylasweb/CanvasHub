import { NextRequest, NextResponse } from 'next/server'
import { firebaseAuth } from '@/lib/firebase'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = firebaseAuth.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: currentUser.email || '' }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const visitingCard = await db.virtualVisitingCard.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!visitingCard) {
      return NextResponse.json({ error: 'Visiting card not found' }, { status: 404 })
    }

    return NextResponse.json(visitingCard)
  } catch (error) {
    console.error('Error fetching visiting card:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
