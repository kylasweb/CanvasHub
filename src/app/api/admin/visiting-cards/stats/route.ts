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

    const [totalCards, activeCards, totalViews, cardsByTheme, cardsByStatus, recentViews] = await Promise.all([
      db.virtualVisitingCard.count(),
      db.virtualVisitingCard.count({ where: { status: "ACTIVE" } }),
      db.virtualVisitingCard.aggregate({ _sum: { views: true } }),
      db.virtualVisitingCard.groupBy({
        by: ["theme"],
        _count: { theme: true }
      }),
      db.virtualVisitingCard.groupBy({
        by: ["status"],
        _count: { status: true }
      }),
      db.visitingCardAnalytics.findMany({
        where: {
          viewedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        include: {
          card: {
            select: {
              id: true,
              title: true,
              company: true
            }
          }
        },
        orderBy: {
          viewedAt: "desc"
        }
      })
    ])

    const cardsByThemeMap = cardsByTheme.reduce((acc, item) => {
      acc[item.theme] = item._count.theme
      return acc
    }, {} as Record<string, number>)

    const cardsByStatusMap = cardsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const popularTheme = Object.entries(cardsByThemeMap).reduce((a, b) => 
      cardsByThemeMap[a[0]] > cardsByThemeMap[b[0]] ? a : b
    )?.[0] || "MODERN"

    const recentViewsData = recentViews.reduce((acc, item) => {
      const existing = acc.find(v => v.cardId === item.cardId)
      if (existing) {
        existing.views += 1
        existing.lastViewed = item.viewedAt > existing.lastViewed ? item.viewedAt : existing.lastViewed
      } else {
        acc.push({
          cardId: item.cardId,
          cardTitle: item.card.title || item.card.company || "Untitled",
          views: 1,
          lastViewed: item.viewedAt
        })
      }
      return acc
    }, [] as Array<{
      cardId: string
      cardTitle: string
      views: number
      lastViewed: Date
    }>)

    const stats = {
      totalCards,
      activeCards,
      totalViews: totalViews._sum.views || 0,
      popularTheme,
      cardsByTheme: cardsByThemeMap,
      cardsByStatus: cardsByStatusMap,
      recentViews: recentViewsData
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching visiting card stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}