import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  let projectId = '', action = '', data: any = null
  let processingTime = 0
  let cost = 0

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
      },
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
      case 'analyze_accessibility':
        // AI analyzes accessibility issues
        const { content, styles, html } = data

        const accessibilityPrompt = `
          Analyze this web design for accessibility issues according to WCAG 2.1 guidelines:
          
          Content: ${JSON.stringify(content || {})}
          Styles: ${JSON.stringify(styles || {})}
          HTML Structure: ${html || 'No HTML provided'}
          
          Analyze for:
          1. Color contrast issues
          2. Text readability and font sizes
          3. Alt text for images
          4. Form labels and inputs
          5. Keyboard navigation
          6. Screen reader compatibility
          7. ARIA labels and roles
          8. Focus management
          9. Link and button accessibility
          10. Multimedia accessibility
          
          Return a JSON response with:
          - issues: array of accessibility issues with severity levels
          - recommendations: array of improvement suggestions
          - score: overall accessibility score (0-100)
          - priority_fixes: critical issues that need immediate attention
        `

        const accessibilityResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI accessibility expert specializing in WCAG 2.1 compliance and inclusive design.'
            },
            {
              role: 'user',
              content: accessibilityPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        result = {
          analysis: JSON.parse(accessibilityResponse.choices[0].message.content || '{"issues": [], "recommendations": [], "score": 0, "priority_fixes": []}')
        }
        break

      case 'generate_alt_text':
        // AI generates alt text for images
        const { imageUrl, imageDescription, context } = data

        const altTextPrompt = `
          Generate comprehensive alt text for this image:
          
          Image URL: ${imageUrl || 'No URL provided'}
          Image Description: ${imageDescription || 'No description provided'}
          Context: ${context || 'General website content'}
          
          Generate alt text that:
          1. Is descriptive and concise (under 125 characters)
          2. Conveys the same meaning as the image
          3. Is appropriate for the context
          4. Follows WCAG guidelines
          5. Avoids redundant phrases like "Image of" or "Graphic of"
          
          Return a JSON response with:
          - alt_text: the generated alt text
          - description: detailed description for longdesc if needed
          - confidence: confidence level in the generated text
          - suggestions: alternative alt text options
        `

        const altTextResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI expert in generating accessibility-compliant alt text for images.'
            },
            {
              role: 'user',
              content: altTextPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 500
        })

        result = {
          altText: JSON.parse(altTextResponse.choices[0].message.content || '{"alt_text": "", "description": "", "confidence": 0, "suggestions": []}')
        }
        break

      case 'color_contrast_optimization':
        // AI optimizes color contrast for accessibility
        const { currentColors, targetContrastRatio } = data

        const colorPrompt = `
          Analyze and optimize these colors for accessibility:
          
          Current Colors: ${JSON.stringify(currentColors || {})}
          Target Contrast Ratio: ${targetContrastRatio || 4.5}
          
          Analyze each color pair and:
          1. Calculate current contrast ratios
          2. Identify color pairs that don't meet WCAG standards
          3. Suggest optimized color alternatives
          4. Provide hex codes for suggested colors
          5. Ensure visual harmony is maintained
          
          Return a JSON response with:
          - analysis: current contrast ratios for all color pairs
          - issues: color pairs that don't meet standards
          - suggestions: optimized color alternatives
          - optimized_colors: new color palette with improved accessibility
          - before_after: comparison of contrast ratios
        `

        const colorResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI color theory and accessibility expert specializing in WCAG color contrast requirements.'
            },
            {
              role: 'user',
              content: colorPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })

        result = {
          colorOptimization: JSON.parse(colorResponse.choices[0].message.content || '{"analysis": {}, "issues": [], "suggestions": [], "optimized_colors": {}, "before_after": {}}')
        }
        break

      case 'keyboard_navigation_analysis':
        // AI analyzes keyboard navigation
        const { navigationStructure, interactiveElements } = data

        const navigationPrompt = `
          Analyze this website structure for keyboard navigation accessibility:
          
          Navigation Structure: ${JSON.stringify(navigationStructure || {})}
          Interactive Elements: ${JSON.stringify(interactiveElements || [])}
          
          Analyze for:
          1. Logical tab order
          2. Focus visibility
          3. Skip links
          4. Keyboard traps
          5. Focus management
          6. Accessible form controls
          7. Modal dialog accessibility
          8. Dropdown and menu navigation
          
          Return a JSON response with:
          - issues: keyboard navigation problems
          - recommendations: improvement suggestions
          - tab_order: suggested logical tab order
          - focus_management: focus management improvements
          - accessibility_score: keyboard navigation score (0-100)
        `

        const navigationResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI accessibility expert specializing in keyboard navigation and focus management.'
            },
            {
              role: 'user',
              content: navigationPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1500
        })

        result = {
          navigationAnalysis: JSON.parse(navigationResponse.choices[0].message.content || '{"issues": [], "recommendations": [], "tab_order": [], "focus_management": {}, "accessibility_score": 0}')
        }
        break

      case 'screen_reader_optimization':
        // AI optimizes for screen readers
        const { domStructure, currentARIA } = data

        const screenReaderPrompt = `
          Analyze and optimize this website structure for screen reader compatibility:
          
          DOM Structure: ${JSON.stringify(domStructure || {})}
          Current ARIA Implementation: ${JSON.stringify(currentARIA || {})}
          
          Analyze for:
          1. Proper heading structure
          2. ARIA labels and roles
          3. Landmark regions
          4. Form accessibility
          5. Table accessibility
          6. List structure
          7. Language attributes
          8. Hidden content handling
          9. Dynamic content announcements
          10. Error handling and validation
          
          Return a JSON response with:
          - issues: screen reader compatibility problems
          - recommendations: ARIA and structural improvements
          - aria_suggestions: specific ARIA attribute suggestions
          - structural_improvements: HTML structure recommendations
          - announcements: screen reader announcement suggestions
          - accessibility_score: screen reader compatibility score (0-100)
        `

        const screenReaderResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI accessibility expert specializing in screen reader compatibility and ARIA implementation.'
            },
            {
              role: 'user',
              content: screenReaderPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        result = {
          screenReaderOptimization: JSON.parse(screenReaderResponse.choices[0].message.content || '{"issues": [], "recommendations": [], "aria_suggestions": {}, "structural_improvements": [], "announcements": [], "accessibility_score": 0}')
        }
        break

      case 'accessibility_report':
        // AI generates comprehensive accessibility report
        const { fullAnalysis, previousScores } = data

        const reportPrompt = `
          Generate a comprehensive accessibility report based on this analysis:
          
          Full Analysis: ${JSON.stringify(fullAnalysis || {})}
          Previous Scores: ${JSON.stringify(previousScores || {})}
          
          Generate a report that includes:
          1. Executive summary
          2. Overall accessibility score
          3. Detailed findings by category
          4. Critical issues requiring immediate attention
          5. Recommendations for improvement
          6. Implementation roadmap
          7. Compliance status with WCAG 2.1
          8. Next steps and timeline
          9. Resources and tools
          10. Monitoring and maintenance plan
          
          Return a JSON response with a comprehensive accessibility report.
        `

        const reportResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI accessibility consultant generating comprehensive accessibility reports and compliance documentation.'
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
          accessibilityReport: JSON.parse(reportResponse.choices[0].message.content || '{"executive_summary": "", "overall_score": 0, "findings": {}, "critical_issues": [], "recommendations": [], "roadmap": [], "compliance_status": "", "next_steps": [], "resources": [], "monitoring_plan": []}')
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    processingTime = Date.now() - startTime
    cost = processingTime * 0.000015 // $0.000015 per millisecond for accessibility features

    // Log AI usage
    await db.aIUsageLog.create({
      data: {
        userId: session.user.id,
        featureUsed: 'accessibility_optimization',
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
    console.error('AI accessibility error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log error
    if (session?.user?.id) {
      await db.aIUsageLog.create({
        data: {
          userId: session.user.id,
          featureUsed: 'accessibility_optimization',
          inputData: { projectId, action, data, error: errorMessage },
          outputData: { error: errorMessage },
          usageCost: 0,
          processingTime: 0,
        }
      })
    }

    return NextResponse.json(
      { error: "Failed to process AI accessibility request" },
      { status: 500 }
    )
  }
}