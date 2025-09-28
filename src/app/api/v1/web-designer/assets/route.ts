import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const projectId = data.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/pdf',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 });
    }

    // If projectId is provided, validate it exists and user owns it
    if (projectId) {
      const project = await db.webDesignerProject.findUnique({
        where: { 
          id: projectId,
          userId: session.user.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Determine file type category
    let fileType: any = 'OTHER';
    if (file.type.startsWith('image/')) fileType = 'IMAGE';
    else if (file.type.startsWith('video/')) fileType = 'VIDEO';
    else if (file.type.startsWith('font/')) fileType = 'FONT';
    else if (file.type === 'application/pdf') fileType = 'DOCUMENT';
    else if (file.type === 'text/plain') fileType = 'DOCUMENT';

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'web-designer');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file URL
    const fileUrl = `/uploads/web-designer/${fileName}`;

    // Save asset to database
    const asset = await db.webDesignerAsset.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        fileUrl,
        fileType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        metadata: JSON.stringify({
          originalName: file.name,
          extension: fileExtension,
          uploadDate: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      id: asset.id,
      fileName: asset.fileName,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      fileUrl: asset.fileUrl,
      mimeType: asset.mimeType,
      projectId: asset.projectId,
      createdAt: asset.createdAt,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type');
    const projectId = searchParams.get('projectId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions
    const whereClause: any = { userId: session.user.id };
    if (fileType) whereClause.fileType = fileType;
    if (projectId) whereClause.projectId = projectId;

    // Get assets with pagination
    const [assets, totalCount] = await Promise.all([
      db.webDesignerAsset.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webDesignerAsset.count({ where: whereClause }),
    ]);

    // Format response
    const formattedAssets = assets.map(asset => ({
      id: asset.id,
      fileName: asset.fileName,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      fileUrl: asset.fileUrl,
      mimeType: asset.mimeType,
      projectId: asset.projectId,
      metadata: asset.metadata,
      createdAt: asset.createdAt,
    }));

    return NextResponse.json({
      assets: formattedAssets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}