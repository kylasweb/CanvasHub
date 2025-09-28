import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const design = await db.webDesign.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error fetching web design:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const existingDesign = await db.webDesign.findUnique({
      where: { id }
    })

    if (!existingDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    const design = await db.webDesign.update({
      where: { id },
      data: {
        status: data.status,
        isPublic: data.isPublic,
        allowIndexing: data.allowIndexing,
        customDomain: data.customDomain
      }
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error updating web design:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingDesign = await db.webDesign.findUnique({
      where: { id }
    })

    if (!existingDesign) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    await db.webDesign.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting web design:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
