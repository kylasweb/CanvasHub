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

    const designs = await db.webDesign.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ designs })
  } catch (error) {
    console.error("Error fetching web designs:", error)
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
    
    const design = await db.webDesign.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.type || "LANDING_PAGE",
        status: data.status || "DRAFT",
        content: data.content || "{}",
        styles: data.styles || "{}",
        assets: data.assets,
        templateId: data.templateId,
        tags: data.tags,
        seoSettings: data.seoSettings,
        isPublic: data.isPublic || false,
        allowIndexing: data.allowIndexing !== false,
        customDomain: data.customDomain
      }
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error("Error creating web design:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}