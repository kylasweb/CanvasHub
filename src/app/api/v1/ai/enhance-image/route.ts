import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image_url, enhancement_type } = body;

    if (!image_url || !enhancement_type) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url and enhancement_type' },
        { status: 400 }
      );
    }

    // Validate enhancement type
    const validEnhancementTypes = [
      'background_removal',
      'quality_enhancement',
      'color_correction',
      'noise_reduction',
      'sharpening',
      'contrast_adjustment',
      'brightness_adjustment'
    ];

    if (!validEnhancementTypes.includes(enhancement_type)) {
      return NextResponse.json(
        { error: 'Invalid enhancement_type' },
        { status: 400 }
      );
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Log the usage
    const startTime = Date.now();
    let processedImageUrl = '';
    let usageCost = 0.0;

    try {
      // Create enhancement prompt based on type
      const enhancementPrompts = {
        background_removal: 'Remove the background from this image while preserving the main subject',
        quality_enhancement: 'Enhance the overall quality and resolution of this image',
        color_correction: 'Correct and improve the color balance and saturation of this image',
        noise_reduction: 'Reduce noise and artifacts while maintaining image details',
        sharpening: 'Sharpen the image to improve clarity and detail',
        contrast_adjustment: 'Adjust the contrast to make the image more visually appealing',
        brightness_adjustment: 'Adjust the brightness to optimal levels'
      };

      const prompt = enhancementPrompts[enhancement_type as keyof typeof enhancementPrompts];

      // Generate enhanced image
      const response = await zai.images.generations.create({
        prompt: `${prompt}. Image URL: ${image_url}`,
        size: '1024x1024'
      });

      // Convert base64 to URL (in a real implementation, you'd upload to a storage service)
      processedImageUrl = `data:image/png;base64,${response.data[0].base64}`;
      
      // Calculate cost (example calculation)
      usageCost = 0.02; // $0.02 per image enhancement

    } catch (error) {
      console.error('Image enhancement error:', error);
      return NextResponse.json(
        { error: 'Failed to enhance image' },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;

    // Log the AI usage
    const aiUsageLog = await db.aIUsageLog.create({
      data: {
        userId: session.user.id,
        featureUsed: 'image_enhancement',
        inputData: JSON.stringify({
          image_url,
          enhancement_type
        }),
        outputData: JSON.stringify({
          processed_image_url: processedImageUrl,
          enhancement_type
        }),
        usageCost,
        processingTime
      }
    });

    return NextResponse.json({
      success: true,
      processed_image_url: processedImageUrl,
      enhancement_type,
      usage_log_id: aiUsageLog.id,
      cost: usageCost
    });

  } catch (error) {
    console.error('Image enhancement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}