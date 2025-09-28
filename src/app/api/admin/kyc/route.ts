import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { KYCStatus, KYCRiskLevel } from '@prisma/client'

// GET /api/admin/kyc - Get all KYC verifications (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const risk = searchParams.get('risk')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status as KYCStatus
    }

    if (type && type !== 'all') {
      where.verificationType = type
    }

    if (risk && risk !== 'all') {
      where.riskLevel = risk as KYCRiskLevel
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    const [kycs, total] = await Promise.all([
      db.kYCVerification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true
            }
          },
          kycDocuments: {
            select: {
              id: true,
              type: true,
              fileName: true,
              status: true,
              createdAt: true
            }
          },
          kycAnalytics: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.kYCVerification.count({ where })
    ])

    return NextResponse.json({
      data: kycs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching KYC verifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/kyc/[id]/approve - Approve KYC verification (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { kycId, riskLevel = 'LOW', notes } = body

    if (!kycId) {
      return NextResponse.json(
        { error: 'KYC ID is required' },
        { status: 400 }
      )
    }

    const kyc = await db.kYCVerification.update({
      where: { id: kycId },
      data: {
        status: KYCStatus.APPROVED,
        riskLevel: riskLevel as KYCRiskLevel,
        isVerified: true,
        approvedAt: new Date(),
        reviewedAt: new Date(),
        reviewerId: session.user.id,
        notes: notes || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update all documents to approved
    await db.kYCDocument.updateMany({
      where: { kycId },
      data: {
        status: 'APPROVED' as any,
        verifiedAt: new Date()
      }
    })

    // Log analytics
    await db.kYCAnalytics.create({
      data: {
        kycId,
        action: 'APPROVE',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: JSON.stringify({ 
          reviewerId: session.user.id,
          riskLevel,
          notes 
        })
      }
    })

    return NextResponse.json(kyc)
  } catch (error) {
    console.error('Error approving KYC verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}