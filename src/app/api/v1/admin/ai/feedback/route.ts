import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const feature = searchParams.get('feature')
    const rating = searchParams.get('rating')

    const skip = (page - 1) * limit

    const whereClause: any = {}
    if (feature) {
      whereClause.featureUsed = feature
    }
    if (rating) {
      whereClause.rating = parseInt(rating)
    }

    const [feedback, total] = await Promise.all([
      db.aIFeedback.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          aiLog: {
            select: {
              featureUsed: true,
              timestamp: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      db.aIFeedback.count({ where: whereClause }),
    ])

    return NextResponse.json({
      feedback: feedback.map(item => ({
        id: item.id,
        rating: item.rating,
        comment: item.comment,
        timestamp: item.timestamp,
        user: item.user.name || item.user.email,
        feature: item.aiLog.featureUsed,
        logTimestamp: item.aiLog.timestamp,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('AI feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI feedback' },
      { status: 500 }
    )
  }
}