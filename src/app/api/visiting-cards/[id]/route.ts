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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const card = await db.virtualVisitingCard.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error fetching visiting card:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const existingCard = await db.virtualVisitingCard.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const card = await db.virtualVisitingCard.update({
      where: { id },
      data: {
        title: data.title,
        company: data.company,
        position: data.position,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        bio: data.bio,
        profileImage: data.profileImage,
        coverImage: data.coverImage,
        socialLinks: data.socialLinks,
        customFields: data.customFields,
        theme: data.theme,
        layout: data.layout,
        visibility: data.visibility,
        status: data.status,
        slug: data.slug
      }
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating visiting card:', error)
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingCard = await db.virtualVisitingCard.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    await db.virtualVisitingCard.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting visiting card:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
