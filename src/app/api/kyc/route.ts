import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { KYCStatus, KYCVerificationType, KYCRiskLevel } from '@prisma/client'

// GET /api/kyc - Get user's KYC verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const kyc = await db.kYCVerification.findUnique({
      where: { userId: session.user.id },
      include: {
        kycDocuments: true,
        kycAnalytics: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })

    if (!kyc) {
      return NextResponse.json({
        status: 'NOT_FOUND',
        message: 'No KYC verification found'
      }, { status: 404 })
    }

    return NextResponse.json(kyc)
  } catch (error) {
    console.error('Error fetching KYC verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/kyc - Create or update KYC verification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      verificationType = 'STANDARD',
      personalInfo,
      addressInfo,
      action
    } = body

    // Check if KYC already exists
    const existingKYC = await db.kYCVerification.findUnique({
      where: { userId: session.user.id }
    })

    let kyc

    if (existingKYC) {
      // Update existing KYC
      const updateData: any = {
        verificationType: verificationType as KYCVerificationType,
        updatedAt: new Date()
      }

      if (personalInfo) {
        updateData.personalInfo = JSON.stringify(personalInfo)
      }

      if (addressInfo) {
        updateData.addressInfo = JSON.stringify(addressInfo)
      }

      if (action === 'SUBMIT') {
        updateData.status = KYCStatus.SUBMITTED
        updateData.submittedAt = new Date()
      }

      kyc = await db.kYCVerification.update({
        where: { userId: session.user.id },
        data: updateData
      })

      // Log analytics
      await db.kYCAnalytics.create({
        data: {
          kycId: kyc.id,
          action: action || 'UPDATE',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: JSON.stringify({ verificationType, action })
        }
      })
    } else {
      // Create new KYC
      kyc = await db.kYCVerification.create({
        data: {
          userId: session.user.id,
          verificationType: verificationType as KYCVerificationType,
          status: action === 'SUBMIT' ? KYCStatus.SUBMITTED : KYCStatus.PENDING,
          personalInfo: personalInfo ? JSON.stringify(personalInfo) : null,
          addressInfo: addressInfo ? JSON.stringify(addressInfo) : null,
          riskLevel: KYCRiskLevel.LOW
        }
      })

      // Log analytics
      await db.kYCAnalytics.create({
        data: {
          kycId: kyc.id,
          action: 'CREATE',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: JSON.stringify({ verificationType, action })
        }
      })
    }

    return NextResponse.json(kyc)
  } catch (error) {
    console.error('Error creating/updating KYC verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}