import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  let projectId = '', action = '', data: any = null

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
      ; ({ projectId, action, data } = body)

    if (!projectId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify project exists and user has access
    const project = await db.webDesignerProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    let result
    let cost = 0
    let processingTime = 0

    const startTime = Date.now()

    switch (action) {
      case 'generate_variations':
        // AI generates A/B test variations
        const { element, currentDesign, targetAudience, goals } = data

        const variationsPrompt = `
          Generate A/B test variations for this design element:
          
          Element: ${element}
          Current Design: ${JSON.stringify(currentDesign)}
          Target Audience: ${targetAudience || 'General audience'}
          Goals: ${JSON.stringify(goals || ['increase_conversion', 'improve_user_experience'])}
          
          Generate variations that:
          1. Test different visual approaches
          2. Optimize for conversion goals
          3. Consider target audience preferences
          4. Maintain brand consistency
          5. Include clear hypotheses
          6. Provide implementation details
          7. Suggest success metrics
          8. Recommend test duration
          
          Return a JSON response with:
          - variations: array of design variations
          - hypotheses: testing hypotheses for each variation
          - implementation_details: how to implement each variation
          - success_metrics: recommended metrics to track
          - test_recommendations: testing strategy recommendations
          - estimated_duration: recommended test duration
        `

        const variationsResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI A/B testing expert specializing in design optimization and conversion rate improvement.'
            },
            {
              role: 'user',
              content: variationsPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2500
        })

        result = {
          variations: JSON.parse(variationsResponse.choices[0].message.content || '{"variations": [], "hypotheses": [], "implementation_details": {}, "success_metrics": [], "test_recommendations": [], "estimated_duration": ""}')
        }
        break

      case 'analyze_results':
        // AI analyzes A/B test results
        const { testData, metrics, userBehavior, conversionData } = data

        const analysisPrompt = `
          Analyze these A/B test results:
          
          Test Data: ${JSON.stringify(testData)}
          Metrics: ${JSON.stringify(metrics)}
          User Behavior: ${JSON.stringify(userBehavior)}
          Conversion Data: ${JSON.stringify(conversionData)}
          
          Analyze for:
          1. Statistical significance
          2. Conversion rate differences
          3. User behavior patterns
          4. Performance by segment
          5. Confidence intervals
          6. Winner determination
          7. Insights and learnings
          8. Recommendations for implementation
          9. Future testing suggestions
          10. Business impact assessment
          
          Return a JSON response with comprehensive analysis.
        `

        const analysisResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI analytics expert specializing in A/B testing analysis and statistical interpretation.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        result = {
          analysis: JSON.parse(analysisResponse.choices[0].message.content || '{}')
        }
        break

      case 'predict_outcomes':
        // AI predicts test outcomes before running
        const { variations, historicalData, marketConditions } = data

        const predictionPrompt = `
          Predict outcomes for these A/B test variations:
          
          Variations: ${JSON.stringify(variations)}
          Historical Data: ${JSON.stringify(historicalData || {})}
          Market Conditions: ${JSON.stringify(marketConditions || {})}
          
          Predict:
          1. Expected conversion rates
          2. User engagement metrics
          3. Performance by user segment
          4. Statistical confidence levels
          5. Risk assessment
          6. Business impact projections
          7. Recommended sample sizes
          8. Duration estimates
          9. Success probability
          10. Implementation recommendations
          
          Return a JSON response with outcome predictions.
        `

        const predictionResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI prediction expert specializing in A/B testing outcomes and performance forecasting.'
            },
            {
              role: 'user',
              content: predictionPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        })

        result = {
          predictions: JSON.parse(predictionResponse.choices[0].message.content || '{}')
        }
        break

      case 'optimize_test_design':
        // AI optimizes test design for maximum insights
        const { testGoals, constraints, availableResources } = data

        const optimizationPrompt = `
          Optimize A/B test design for maximum insights:
          
          Test Goals: ${JSON.stringify(testGoals)}
          Constraints: ${JSON.stringify(constraints || {})}
          Available Resources: ${JSON.stringify(availableResources || {})}
          
          Optimize for:
          1. Statistical power
          2. Sample size efficiency
          3. Test duration optimization
          4. Resource allocation
          5. Risk minimization
          6. Insight maximization
          7. Business impact
          8. Implementation feasibility
          9. Data quality
          10. Actionability of results
          
          Return a JSON response with optimized test design.
        `

        const optimizationResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI experimental design expert specializing in A/B testing optimization and statistical efficiency.'
            },
            {
              role: 'user',
              content: optimizationPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        result = {
          optimizedDesign: JSON.parse(optimizationResponse.choices[0].message.content || '{}')
        }
        break

      case 'generate_insights':
        // AI generates insights from test results
        const { results, context, businessObjectives } = data

        const insightsPrompt = `
          Generate actionable insights from A/B test results:
          
          Results: ${JSON.stringify(results)}
          Context: ${JSON.stringify(context || {})}
          Business Objectives: ${JSON.stringify(businessObjectives || [])}
          
          Generate insights on:
          1. User behavior patterns
          2. Design preferences
          3. Conversion drivers
          4. User experience factors
          5. Business impact
          6. Strategic implications
          7. Implementation recommendations
          8. Future testing opportunities
          9. Best practices
          10. Lessons learned
          
          Return a JSON response with actionable insights and recommendations.
        `

        const insightsResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI insights expert specializing in extracting actionable learnings from A/B test results.'
            },
            {
              role: 'user',
              content: insightsPrompt
            }
          ],
          temperature: 0.5,
          max_tokens: 2000
        })

        result = {
          insights: JSON.parse(insightsResponse.choices[0].message.content || '{}')
        }
        break

      case 'segment_analysis':
        // AI analyzes test results by user segments
        const { testResults, userSegments, segmentData } = data

        const segmentPrompt = `
          Analyze A/B test results by user segments:
          
          Test Results: ${JSON.stringify(testResults)}
          User Segments: ${JSON.stringify(userSegments)}
          Segment Data: ${JSON.stringify(segmentData)}
          
          Analyze:
          1. Performance by segment
          2. Segment-specific preferences
          3. Demographic insights
          4. Behavioral patterns
          5. Device-specific performance
          6. Geographic variations
          7. Time-based patterns
          8. Custom segment insights
          9. Personalization opportunities
          10. Segment-specific recommendations
          
          Return a JSON response with detailed segment analysis.
        `

        const segmentResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI segmentation expert specializing in analyzing A/B test results across different user segments.'
            },
            {
              role: 'user',
              content: segmentPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        })

        result = {
          segmentAnalysis: JSON.parse(segmentResponse.choices[0].message.content || '{}')
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    processingTime = Date.now() - startTime
    cost = processingTime * 0.000025 // $0.000025 per millisecond for A/B testing features

    // Log AI usage
    await db.aIUsageLog.create({
      data: {
        userId: session.user.id,
        featureUsed: 'ab_testing',
        inputData: { projectId, action, data },
        outputData: result,
        usageCost: cost,
        processingTime,
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        processingTime,
        cost,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI A/B testing error:', error)

    // Log error
    if (session?.user?.id) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await db.aIUsageLog.create({
        data: {
          userId: session.user.id,
          featureUsed: 'ab_testing',
          inputData: { projectId, action, data, error: errorMessage },
          outputData: { error: errorMessage },
          usageCost: 0,
          processingTime: 0,
        }
      })
    }

    return NextResponse.json(
      { error: "Failed to process AI A/B testing request" },
      { status: 500 }
    )
  }
}