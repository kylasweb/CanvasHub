import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const feedbackSchema = z.object({
  featureUsed: z.string().min(1, 'Feature is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
  suggestionId: z.string().optional(),
  aiUsageId: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

    // Create feedback entry
    const feedback = await db.aIFeedback.create({
      data: {
        userId: session.user.id,
        logId: validatedData.aiUsageId || '',
        rating: validatedData.rating,
        comment: validatedData.comment || '',
      }
    })

    // Update user preferences based on feedback
    await updateUserPreferencesFromFeedback(session.user.id, validatedData)

    // Trigger improvement analysis for low ratings
    if (validatedData.rating <= 2) {
      await analyzeFeedbackForImprovements(feedback.id)
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: 'Feedback submitted successfully'
    })

  } catch (error) {
    console.error('AI feedback submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature')
    const rating = searchParams.get('rating')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = { userId: session.user.id }
    if (feature) {
      whereClause.featureUsed = feature
    }
    if (rating) {
      whereClause.rating = parseInt(rating)
    }

    const feedback = await db.aIFeedback.findMany({
      where: whereClause,
      include: {
        aiLog: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      feedback: feedback.map(item => ({
        id: item.id,
        featureUsed: item.aiLog?.featureUsed,
        rating: item.rating,
        comment: item.comment,
        timestamp: item.timestamp,
      }))
    })

  } catch (error) {
    console.error('AI feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// Helper functions (would be moved to a service in production)
async function updateUserPreferencesFromFeedback(userId: string, feedback: any) {
  try {
    // Update user AI preferences based on feedback patterns
    const userPreferences = await db.userAIPreference.findUnique({
      where: { userId }
    })

    const featureUsed = feedback.featureUsed || 'unknown'

    if (!userPreferences) {
      // Create preferences if they don't exist
      await db.userAIPreference.create({
        data: {
          userId,
          preferredWritingStyle: featureUsed === 'content_generation' ?
            (feedback.rating >= 4 ? 'professional' : 'casual') : undefined,
          preferredColorScheme: featureUsed === 'color_palette_generation' ?
            (feedback.rating >= 4 ? 'modern' : 'minimal') : undefined,
          avoidedSuggestions: feedback.rating <= 2 ? JSON.stringify([featureUsed]) : undefined,
          learningData: {
            acceptedSuggestions: feedback.rating >= 4 ? 1 : 0,
            rejectedSuggestions: feedback.rating <= 2 ? 1 : 0,
            commonContexts: [],
            preferredFeatures: feedback.rating >= 4 ? [featureUsed] : []
          }
        }
      })
    } else {
      // Update existing preferences
      const learningData = userPreferences.learningData as any || {}
      const currentAvoided = userPreferences.avoidedSuggestions ? JSON.parse(userPreferences.avoidedSuggestions) : []

      await db.userAIPreference.update({
        where: { userId },
        data: {
          avoidedSuggestions: feedback.rating <= 2 ?
            JSON.stringify([...currentAvoided, featureUsed]) :
            userPreferences.avoidedSuggestions,
          learningData: {
            acceptedSuggestions: (learningData.acceptedSuggestions || 0) + (feedback.rating >= 4 ? 1 : 0),
            rejectedSuggestions: (learningData.rejectedSuggestions || 0) + (feedback.rating <= 2 ? 1 : 0),
            commonContexts: learningData.commonContexts || [],
            preferredFeatures: feedback.rating >= 4 ?
              [...(learningData.preferredFeatures || []), featureUsed] :
              learningData.preferredFeatures || []
          }
        }
      })
    }
  } catch (error) {
    console.error('Failed to update user preferences from feedback:', error)
  }
}

async function analyzeFeedbackForImprovements(feedbackId: string) {
  try {
    // Get the feedback details
    const feedback = await db.aIFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        user: true,
        aiLog: true
      }
    })

    if (!feedback) return

    // Analyze feedback for improvement opportunities
    const improvementSuggestions = await generateImprovementSuggestions(feedback)

    // Store improvement suggestions
    // TODO: Create AIImprovement model in schema
    /*
    for (const suggestion of improvementSuggestions) {
      await db.aIImprovement.create({
        data: {
          feedbackId: feedback.id,
          featureUsed: feedback.featureUsed,
          issueType: suggestion.issueType,
          suggestion: suggestion.suggestion,
          priority: suggestion.priority,
          estimatedImpact: suggestion.estimatedImpact,
          implementationComplexity: suggestion.implementationComplexity,
          status: 'pending',
          createdAt: new Date()
        }
      })
    }
    */

    // Notify administrators about critical issues
    if (feedback.rating === 1) {
      await notifyAdministrators(feedback)
    }

  } catch (error) {
    console.error('Failed to analyze feedback for improvements:', error)
  }
}

async function generateImprovementSuggestions(feedback: any): Promise<any[]> {
  const suggestions: Array<{
    issueType: string;
    suggestion: string;
    priority: string;
    estimatedImpact: string;
    implementationComplexity: string;
  }> = []

  // Analyze comment for specific issues
  const comment = feedback.comment?.toLowerCase() || ''

  if (comment.includes('slow') || comment.includes('timeout')) {
    suggestions.push({
      issueType: 'performance',
      suggestion: 'Optimize AI model response time and implement caching',
      priority: 'high',
      estimatedImpact: 'high',
      implementationComplexity: 'medium'
    })
  }

  if (comment.includes('irrelevant') || comment.includes('not helpful')) {
    suggestions.push({
      issueType: 'accuracy',
      suggestion: 'Improve prompt engineering and model selection for better relevance',
      priority: 'high',
      estimatedImpact: 'high',
      implementationComplexity: 'high'
    })
  }

  if (comment.includes('generic') || comment.includes('basic')) {
    suggestions.push({
      issueType: 'personalization',
      suggestion: 'Enhance context awareness and user preference integration',
      priority: 'medium',
      estimatedImpact: 'medium',
      implementationComplexity: 'medium'
    })
  }

  if (comment.includes('error') || comment.includes('failed')) {
    suggestions.push({
      issueType: 'reliability',
      suggestion: 'Improve error handling and fallback mechanisms',
      priority: 'high',
      estimatedImpact: 'high',
      implementationComplexity: 'low'
    })
  }

  // Default suggestion for low ratings without specific comments
  if (suggestions.length === 0 && feedback.rating <= 2) {
    suggestions.push({
      issueType: 'general',
      suggestion: 'Review and improve AI model performance and user experience',
      priority: 'medium',
      estimatedImpact: 'medium',
      implementationComplexity: 'medium'
    })
  }

  return suggestions
}

async function notifyAdministrators(feedback: any) {
  try {
    // In a real implementation, this would send emails, notifications, etc.
    console.log('Critical feedback received - notifying administrators:', {
      feedbackId: feedback.id,
      feature: feedback.featureUsed,
      rating: feedback.rating,
      comment: feedback.comment,
      user: feedback.user.email
    })

    // Store notification for administrators
    await db.notification.create({
      data: {
        type: 'warning',
        title: `Critical AI Feedback for ${feedback.featureUsed}`,
        message: `User ${feedback.user.email} rated ${feedback.featureUsed} with ${feedback.rating}/5 stars`,
        priority: 'high',
        channel: 'in_app',
        targetAudience: 'admin',
        status: 'draft',
        createdById: feedback.user.id
      }
    })

  } catch (error) {
    console.error('Failed to notify administrators:', error)
  }
}