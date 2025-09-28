import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templates = await db.webTemplate.findMany({
      orderBy: [
        { isFeatured: "desc" },
        { usageCount: "desc" }
      ]
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching web templates:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}