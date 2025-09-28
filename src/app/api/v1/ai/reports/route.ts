import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  let action: string = 'unknown'
  let data: any = {}

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestData = await request.json()
    action = requestData.action
    data = requestData.data

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    let result
    let cost = 0
    let processingTime = 0

    const startTime = Date.now()

    switch (action) {
      case 'generate_comprehensive_report':
        // Generate comprehensive AI usage report
        const { timeRange, includeCosts, includeRecommendations } = data

        // Fetch user's AI usage data
        const usageData = await db.aIUsageLog.findMany({
          where: {
            userId: session.user.id,
            timestamp: {
              gte: new Date(Date.now() - (timeRange || 30) * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        })

        const reportPrompt = `
          Generate a comprehensive AI usage report based on this data:
          
          Usage Data: ${JSON.stringify(usageData)}
          Time Range: ${timeRange || 30} days
          Include Costs: ${includeCosts || true}
          Include Recommendations: ${includeRecommendations || true}
          
          Generate a report that includes:
          1. Executive Summary
          2. Usage Overview (total requests, features used, success rate)
          3. Cost Analysis (if included)
          4. Performance Metrics
          5. Feature Breakdown
          6. Usage Patterns and Trends
          7. Optimization Opportunities
          8. Recommendations (if included)
          9. Cost Optimization Strategies
          10. Future Usage Predictions
          
          Return a JSON response with comprehensive report data.
        `

        const reportResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI analytics expert generating comprehensive usage reports and cost optimization recommendations.'
            },
            {
              role: 'user',
              content: reportPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 3000
        })

        result = {
          report: JSON.parse(reportResponse.choices[0].message.content || '{}'),
          rawData: usageData
        }
        break

      case 'cost_optimization_analysis':
        // Analyze cost optimization opportunities
        const { currentUsage, budget, goals } = data

        const optimizationPrompt = `
          Analyze AI usage for cost optimization opportunities:
          
          Current Usage: ${JSON.stringify(currentUsage)}
          Budget: ${budget || 'No budget specified'}
          Goals: ${JSON.stringify(goals || [])}
          
          Analyze for:
          1. Cost-saving opportunities
          2. Usage efficiency improvements
          3. Feature optimization
          4. Batch processing benefits
          5. Caching opportunities
          6. Alternative strategies
          7. ROI improvements
          8. Budget allocation recommendations
          
          Return a JSON response with:
          - optimization_opportunities: array of cost-saving opportunities
          - recommendations: specific actionable recommendations
          - projected_savings: estimated cost savings
          - implementation_plan: step-by-step implementation plan
          - roi_analysis: return on investment analysis
          - risk_assessment: potential risks and mitigations
        `

        const optimizationResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI cost optimization expert specializing in AI service usage and budget management.'
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
          optimization: JSON.parse(optimizationResponse.choices[0].message.content || '{}')
        }
        break

      case 'usage_forecasting':
        // Forecast future usage and costs
        const { historicalData, forecastPeriod, growthFactors } = data

        const forecastPrompt = `
          Generate AI usage and cost forecasts based on historical data:
          
          Historical Data: ${JSON.stringify(historicalData)}
          Forecast Period: ${forecastPeriod || 90} days
          Growth Factors: ${JSON.stringify(growthFactors || {})}
          
          Generate forecasts for:
          1. Usage volume predictions
          2. Cost projections
          3. Feature usage trends
          4. Seasonal patterns
          5. Growth scenarios (conservative, moderate, aggressive)
          6. Resource requirements
          7. Budget planning recommendations
          8. Risk factors and contingencies
          
          Return a JSON response with detailed forecast data.
        `

        const forecastResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI forecasting expert specializing in usage patterns and cost predictions.'
            },
            {
              role: 'user',
              content: forecastPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 2500
        })

        result = {
          forecast: JSON.parse(forecastResponse.choices[0].message.content || '{}')
        }
        break

      case 'benchmark_analysis':
        // Compare usage against benchmarks
        const { userUsage, industryBenchmarks, peerData } = data

        const benchmarkPrompt = `
          Perform benchmark analysis comparing AI usage:
          
          User Usage: ${JSON.stringify(userUsage)}
          Industry Benchmarks: ${JSON.stringify(industryBenchmarks || {})}
          Peer Data: ${JSON.stringify(peerData || {})}
          
          Analyze and compare:
          1. Usage efficiency vs industry standards
          2. Cost competitiveness
          3. Feature adoption rates
          4. Performance metrics
          5. Best practice alignment
          6. Competitive positioning
          7. Improvement opportunities
          8. Strategic recommendations
          
          Return a JSON response with comprehensive benchmark analysis.
        `

        const benchmarkResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI benchmarking expert comparing usage patterns against industry standards and peer performance.'
            },
            {
              role: 'user',
              content: benchmarkPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        result = {
          benchmark: JSON.parse(benchmarkResponse.choices[0].message.content || '{}')
        }
        break

      case 'roi_analysis':
        // Calculate return on investment for AI features
        const { featureUsage, businessMetrics, investmentData } = data

        const roiPrompt = `
          Calculate ROI for AI feature usage:
          
          Feature Usage: ${JSON.stringify(featureUsage)}
          Business Metrics: ${JSON.stringify(businessMetrics || {})}
          Investment Data: ${JSON.stringify(investmentData || {})}
          
          Calculate and analyze:
          1. Cost-benefit analysis per feature
          2. ROI calculations
          3. Value generation metrics
          4. Efficiency improvements
          5. Time savings
          6. Quality improvements
          7. Business impact assessment
          8. Strategic value analysis
          9. Investment recommendations
          10. Future potential assessment
          
          Return a JSON response with comprehensive ROI analysis.
        `

        const roiResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI ROI analysis expert calculating return on investment for AI features and business impact.'
            },
            {
              role: 'user',
              content: roiPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2500
        })

        result = {
          roi: JSON.parse(roiResponse.choices[0].message.content || '{}')
        }
        break

      case 'custom_report':
        // Generate custom report based on user specifications
        const { reportType, metrics, timeFrame, customFilters } = data

        const customPrompt = `
          Generate a custom AI usage report with these specifications:
          
          Report Type: ${reportType}
          Metrics: ${JSON.stringify(metrics || [])}
          Time Frame: ${timeFrame}
          Custom Filters: ${JSON.stringify(customFilters || {})}
          
          Generate a customized report focusing on the specified metrics and filters.
          Include relevant insights, trends, and recommendations based on the user's requirements.
          
          Return a JSON response with the custom report data.
        `

        const customResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI reporting expert generating customized reports based on user specifications and requirements.'
            },
            {
              role: 'user',
              content: customPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        })

        result = {
          customReport: JSON.parse(customResponse.choices[0].message.content || '{}')
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    processingTime = Date.now() - startTime
    cost = processingTime * 0.00002 // $0.00002 per millisecond for reporting features

    // Log AI usage
    await db.aIUsageLog.create({
      data: {
        userId: session.user.id,
        featureUsed: 'reporting_analytics',
        inputData: JSON.stringify({ action, data }),
        outputData: JSON.stringify(result),
        usageCost: cost,
        processingTime
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
    console.error('AI reports error:', error)

    // Log error
    if (session?.user?.id) {
      await db.aIUsageLog.create({
        data: {
          userId: session.user.id,
          featureUsed: 'reporting_analytics',
          inputData: JSON.stringify({ action, data }),
          outputData: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
          usageCost: 0,
          processingTime: 0
        }
      })
    }

    return NextResponse.json(
      { error: "Failed to process AI reports request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30'
    const reportType = searchParams.get('reportType') || 'summary'

    // Fetch usage data for the specified time range
    const usageData = await db.aIUsageLog.findMany({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Generate summary statistics
    const summary = {
      totalRequests: usageData.length,
      successfulRequests: usageData.length, // Assume all logged requests are successful
      failedRequests: 0, // No failure tracking in current schema
      totalCost: usageData.reduce((sum, u) => sum + u.usageCost, 0),
      averageProcessingTime: usageData.reduce((sum, u) => sum + u.processingTime, 0) / usageData.length || 0,
      featuresUsed: [...new Set(usageData.map(u => u.featureUsed))],
      topFeatures: Object.entries(
        usageData.reduce((acc, u) => {
          acc[u.featureUsed] = (acc[u.featureUsed] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).sort(([, a], [, b]) => b - a).slice(0, 5)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        usageData,
        timeRange: parseInt(timeRange),
        reportType
      }
    })

  } catch (error) {
    console.error('Failed to fetch report data:', error)
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    )
  }
}