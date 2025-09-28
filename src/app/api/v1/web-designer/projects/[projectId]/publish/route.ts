import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

const publishProjectSchema = z.object({
  customDomain: z.string().url().optional(),
  exportCode: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const validatedData = publishProjectSchema.parse(body);

    // Check if project exists and user owns it
    const project = await db.webDesignerProject.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        template: {
          select: {
            templateData: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate published URL
    const publishedUrl = validatedData.customDomain ||
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/published/${projectId}`;

    // Update project with published information
    const updatedProject = await db.webDesignerProject.update({
      where: { id: projectId },
      data: {
        status: 'PUBLISHED',
        publishedUrl,
        customDomain: validatedData.customDomain,
        publishedAt: new Date(),
      },
    });

    // If exportCode is true, generate and return the HTML/CSS/JS code
    if (validatedData.exportCode) {
      const exportedCode = await generateExportedCode(project, project.template?.templateData);

      return NextResponse.json({
        id: updatedProject.id,
        projectName: updatedProject.projectName,
        status: updatedProject.status,
        publishedUrl: updatedProject.publishedUrl,
        customDomain: updatedProject.customDomain,
        publishedAt: updatedProject.publishedAt,
        exportedCode,
        message: 'Project published and code exported successfully',
      });
    }

    return NextResponse.json({
      id: updatedProject.id,
      projectName: updatedProject.projectName,
      status: updatedProject.status,
      publishedUrl: updatedProject.publishedUrl,
      customDomain: updatedProject.customDomain,
      publishedAt: updatedProject.publishedAt,
      message: 'Project published successfully',
    });
  } catch (error) {
    console.error('Error publishing project:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateExportedCode(project: any, templateData: any) {
  // This is a simplified code generation function
  // In a real implementation, this would be much more sophisticated

  const siteData = project.siteData;
  const pages = siteData.pages || [];

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.projectName}</title>
    <style>
        /* Base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Component styles would be generated here based on the siteData */
    </style>
</head>
<body>
    <div class="container">
        <h1>${project.projectName}</h1>
        <!-- Page content would be generated here based on the siteData -->
    </div>
    
    <script>
        // JavaScript would be generated here based on the siteData
        console.log('Website loaded successfully');
    </script>
</body>
</html>`;

  return {
    html,
    css: `/* CSS would be generated here */`,
    js: `// JavaScript would be generated here`,
  };
}