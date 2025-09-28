import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"
import { db } from "@/lib/db"
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const currentUser = firebaseAuth.getCurrentUser()

    if (!currentUser || !currentUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: currentUser.email },
      include: {
        aiPreferences: true,
        webDesigns: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        aiUsageLogs: {
          where: {
            featureUsed: {
              in: ['layout_suggestion', 'advanced_layout_suggestion', 'color_palette_generation']
            }
          },
          orderBy: { timestamp: 'desc' },
          take: 20
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry') || ''
    const projectType = searchParams.get('projectType') || 'website'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Initialize ZAI
    const zai = await ZAI.create()

    // Analyze user preferences and usage patterns
    const userPreferences = user.aiPreferences
    const usagePatterns = analyzeUsagePatterns(user.aiUsageLogs)
    const designHistory = analyzeDesignHistory(user.webDesigns)

    // Build recommendation prompt
    const systemPrompt = `You are an expert web design template recommendation system. 
    Analyze user preferences, usage patterns, and design history to provide personalized template recommendations.
    Consider industry, project type, and user behavior patterns.`

    const userPrompt = `Generate personalized template recommendations for a user with the following profile:

    User Profile:
    - Industry: ${userPreferences?.industryExpertise || 'Not specified'}
    - Project Type: ${projectType}

    Design Preferences:
    - Preferred Writing Style: ${userPreferences?.preferredWritingStyle || 'Not specified'}
    - Color Preferences: ${userPreferences?.preferredColorScheme || 'Not specified'}

    Usage Patterns:
    ${usagePatterns}

    Design History:
    ${designHistory}

    Please recommend ${limit} templates that would be most suitable for this user. 
    For each template, provide:
    1. Template name and category
    2. Match score (0-100)
    3. Key features that match user preferences
    4. Reasoning for the recommendation
    5. Expected improvement over previous designs

    Format the response as a JSON object with a "recommendations" array.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    let recommendations: Array<{
      name: string;
      category: string;
      matchScore: number;
      keyFeatures: string[];
      reasoning: string;
      expectedImprovement: string;
    }> = []

    try {
      const parsedResponse = JSON.parse(responseText)
      recommendations = parsedResponse.recommendations || []
    } catch (error) {
      // Fallback to basic recommendations if JSON parsing fails
      recommendations = generateFallbackRecommendations(industry, projectType, limit)
    }

    // Log the recommendation request
    await db.aIUsageLog.create({
      data: {
        userId: user.id,
        featureUsed: 'template_recommendation',
        inputData: { industry, projectType, limit },
        outputData: { recommendations },
        usageCost: 0.002,
        processingTime: 1000, // approximate
      },
    })

    return NextResponse.json({
      success: true,
      recommendations,
      userInsights: {
        preferences: userPreferences,
        usagePatterns,
        designHistory
      }
    })

  } catch (error) {
    console.error("Error generating template recommendations:", error)
    return NextResponse.json(
      { error: "Failed to generate template recommendations" },
      { status: 500 }
    )
  }
}

function analyzeUsagePatterns(usageLogs: any[]) {
  if (!usageLogs.length) return "No previous AI usage found"

  const featureCounts = usageLogs.reduce((acc, log) => {
    acc[log.featureUsed] = (acc[log.featureUsed] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostUsedFeature = Object.entries(featureCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'None'

  const avgProcessingTime = usageLogs.reduce((sum, log) => sum + (log.processingTime || 0), 0) / usageLogs.length

  return `
    - Most used AI feature: ${mostUsedFeature}
    - Total AI interactions: ${usageLogs.length}
    - Average processing time: ${Math.round(avgProcessingTime)}ms
    - Usage frequency: ${usageLogs.length > 10 ? 'High' : usageLogs.length > 5 ? 'Medium' : 'Low'}
  `
}

function analyzeDesignHistory(webDesigns: any[]) {
  if (!webDesigns.length) return "No previous designs found"

  const types = webDesigns.map(d => d.type)
  const mostCommonType = types.sort((a, b) =>
    types.filter(v => v === a).length - types.filter(v => v === b).length
  ).pop()

  const avgProjectsPerMonth = webDesigns.length / Math.max(1,
    Math.ceil((Date.now() - new Date(webDesigns[webDesigns.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
  )

  return `
    - Total designs created: ${webDesigns.length}
    - Most common design type: ${mostCommonType}
    - Design frequency: ${avgProjectsPerMonth.toFixed(1)} projects per month
    - Recent activity: ${webDesigns.length > 5 ? 'High' : webDesigns.length > 2 ? 'Medium' : 'Low'}
  `
}

function generateFallbackRecommendations(industry: string, projectType: string, limit: number) {
  const templates = [
    {
      name: "Modern Business",
      category: "Business",
      matchScore: 85,
      keyFeatures: ["Clean layout", "Professional design", "Mobile responsive"],
      reasoning: "Suitable for business websites with modern aesthetics",
      expectedImprovement: "Better user engagement and professional appearance"
    },
    {
      name: "Creative Portfolio",
      category: "Portfolio",
      matchScore: 78,
      keyFeatures: ["Gallery showcase", "Creative animations", "Custom layouts"],
      reasoning: "Perfect for showcasing creative work and portfolios",
      expectedImprovement: "Enhanced visual presentation and user experience"
    },
    {
      name: "E-commerce Pro",
      category: "E-commerce",
      matchScore: 82,
      keyFeatures: ["Product catalog", "Shopping cart", "Payment integration"],
      reasoning: "Complete e-commerce solution with modern design",
      expectedImprovement: "Increased conversion rates and sales"
    },
    {
      name: "Agency Portfolio",
      category: "Portfolio",
      matchScore: 75,
      keyFeatures: ["Project showcase", "Team profiles", "Client testimonials"],
      reasoning: "Ideal for agencies and service-based businesses",
      expectedImprovement: "Better client acquisition and trust building"
    },
    {
      name: "Tech Startup",
      category: "Business",
      matchScore: 80,
      keyFeatures: ["Innovative design", "Tech-focused layout", "Feature highlights"],
      reasoning: "Tailored for technology companies and startups",
      expectedImprovement: "Modern tech appeal and investor interest"
    }
  ]

  return templates.slice(0, limit)
}