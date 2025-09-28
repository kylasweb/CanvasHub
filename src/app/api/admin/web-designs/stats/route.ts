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

    const [totalDesigns, publishedDesigns, totalViews, designsByType, designsByStatus, recentActivity] = await Promise.all([
      db.webDesign.count(),
      db.webDesign.count({ where: { status: "PUBLISHED" } }),
      db.webDesign.aggregate({ _sum: { views: true } }),
      db.webDesign.groupBy({
        by: ["type"],
        _count: { type: true }
      }),
      db.webDesign.groupBy({
        by: ["status"],
        _count: { status: true }
      }),
      db.webDesign.findMany({
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: 10
      })
    ])

    const designsByTypeMap = designsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {} as Record<string, number>)

    const designsByStatusMap = designsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const popularType = Object.entries(designsByTypeMap).reduce((a, b) => 
      designsByTypeMap[a[0]] > designsByTypeMap[b[0]] ? a : b
    )?.[0] || "LANDING_PAGE"

    const recentActivityData = recentActivity.map(item => ({
      designId: item.id,
      designTitle: item.title,
      userName: item.user.name || "Unknown",
      action: item.status === "PUBLISHED" ? "Published" : "Updated",
      timestamp: item.updatedAt
    }))

    const stats = {
      totalDesigns,
      publishedDesigns,
      totalViews: totalViews._sum.views || 0,
      popularType,
      designsByType: designsByTypeMap,
      designsByStatus: designsByStatusMap,
      recentActivity: recentActivityData
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching web design stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}