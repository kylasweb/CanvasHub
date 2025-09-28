import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { KYCStatus } from '@prisma/client'

// POST /api/admin/kyc/[id]/reject - Reject KYC verification (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { rejectionReason } = body

    if (!rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const kyc = await db.kYCVerification.update({
      where: { id },
      data: {
        status: KYCStatus.REJECTED,
        rejectedAt: new Date(),
        reviewedAt: new Date(),
        rejectionReason,
        reviewerId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'KYC verification rejected successfully',
      kyc,
    })
  } catch (error) {
    console.error('Error rejecting KYC:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/kyc/[id]/review - Start KYC review (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const kyc = await db.kYCVerification.update({
      where: { id },
      data: {
        status: KYCStatus.UNDER_REVIEW,
        reviewedAt: new Date(),
        reviewerId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        kycDocuments: true,
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'KYC review started successfully',
      kyc,
    })
  } catch (error) {
    console.error('Error starting KYC review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
