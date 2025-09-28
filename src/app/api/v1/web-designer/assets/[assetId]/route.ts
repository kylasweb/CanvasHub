import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await params;

    // Get asset details
    const asset = await db.webDesignerAsset.findUnique({
      where: {
        id: assetId,
        userId: session.user.id, // Ensure user owns the asset
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: asset.id,
      fileName: asset.fileName,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      fileUrl: asset.fileUrl,
      mimeType: asset.mimeType,
      projectId: asset.projectId,
      metadata: asset.metadata,
      createdAt: asset.createdAt,
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await params;

    // Get asset details
    const asset = await db.webDesignerAsset.findUnique({
      where: {
        id: assetId,
        userId: session.user.id, // Ensure user owns the asset
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', asset.fileUrl);
      await unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file from filesystem:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete asset from database
    await db.webDesignerAsset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}