import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const currentUser = firebaseAuth.getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin - you might want to implement proper role checking
    const user = await db.user.findUnique({
      where: { email: currentUser.email || "" }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cards = await db.virtualVisitingCard.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
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