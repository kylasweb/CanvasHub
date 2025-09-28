import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isFeatured = searchParams.get('featured');
    const isPremium = searchParams.get('premium');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build filter conditions
    const whereClause: any = { status: 'ACTIVE' };
    if (category) whereClause.category = category;
    if (isFeatured === 'true') whereClause.isFeatured = true;
    if (isPremium === 'true') whereClause.isPremium = true;
    if (isPremium === 'false') whereClause.isPremium = false;

    // Get templates with pagination
    const [templates, totalCount] = await Promise.all([
      db.webDesignerTemplate.findMany({
        where: whereClause,
        orderBy: [
          { isFeatured: 'desc' },
          { usageCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webDesignerTemplate.count({ where: whereClause }),
    ]);

    // Get template categories for filtering
    const categories = await db.webDesignerTemplate.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: {
        category: true,
      },
    });

    // Format response
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      templateName: template.templateName,
      category: template.category,
      previewImageUrl: template.previewImageUrl,
      isPremium: template.isPremium,
      isFeatured: template.isFeatured,
      usageCount: template.usageCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));

    return NextResponse.json({
      templates: formattedTemplates,
      categories: categories.map(cat => ({
        category: cat.category,
        count: cat._count.category,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}