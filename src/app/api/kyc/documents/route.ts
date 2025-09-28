import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { KYCDocumentType, DocumentStatus } from '@prisma/client'
import { writeFile } from 'fs/promises'
import path from 'path'
import { mkdir } from 'fs/promises'

// POST /api/kyc/documents - Upload KYC document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as KYCDocumentType

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      )
    }

    // Check if user has KYC verification
    const kyc = await db.kYCVerification.findUnique({
      where: { userId: session.user.id }
    })

    if (!kyc) {
      return NextResponse.json(
        { error: 'KYC verification not found' },
        { status: 404 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `${session.user.id}_${timestamp}_${documentType}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create document record
    const document = await db.kYCDocument.create({
      data: {
        kycId: kyc.id,
        type: documentType,
        fileName: file.name,
        filePath: `/uploads/kyc/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        status: DocumentStatus.PENDING
      }
    })

    // Log analytics
    await db.kYCAnalytics.create({
      data: {
        kycId: kyc.id,
        action: 'DOCUMENT_UPLOAD',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: JSON.stringify({ 
          documentType, 
          fileName: file.name,
          fileSize: file.size 
        })
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading KYC document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/kyc/documents - Get user's KYC documents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const kyc = await db.kYCVerification.findUnique({
      where: { userId: session.user.id },
      include: {
        kycDocuments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!kyc) {
      return NextResponse.json(
        { error: 'KYC verification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(kyc.kycDocuments)
  } catch (error) {
    console.error('Error fetching KYC documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}