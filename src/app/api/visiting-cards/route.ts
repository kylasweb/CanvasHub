import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cards = await db.virtualVisitingCard.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Error fetching visiting cards:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const card = await db.virtualVisitingCard.create({
      data: {
        userId: session.user.id,
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
        theme: data.theme || "MODERN",
        layout: data.layout || "STANDARD",
        visibility: data.visibility || "PUBLIC",
        status: data.status || "ACTIVE",
        slug: data.slug
      }
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error creating visiting card:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}