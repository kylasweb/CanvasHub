import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const currentUser = firebaseAuth.getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { email: currentUser.email || "" }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const designs = await db.webDesign.findMany({
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