import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { context, currentStep, projectType, userGoals } = await request.json();

    if (!context || !currentStep) {
      return NextResponse.json(
        { error: 'Context and current step are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `You are an intelligent project assistant that provides next step recommendations. Based on the following information, provide 3-5 actionable next steps:

Current Context: ${context}
Current Step: ${currentStep}
Project Type: ${projectType || 'general'}
User Goals: ${userGoals || 'complete project successfully'}

Please provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "id": "unique_id",
      "title": "Clear action title",
      "description": "Detailed description of what to do next",
      "priority": "high|medium|low",
      "estimatedTime": "time estimate (e.g., '30 minutes', '2 hours')",
      "category": "development|design|testing|deployment|planning",
      "dependencies": ["list of prerequisite steps if any"],
      "resources": ["helpful resources or tools"]
    }
  ]
}

Focus on practical, actionable steps that will help the user make progress. Prioritize based on impact and dependencies.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert project management assistant that provides clear, actionable next step recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    let recommendations;
    try {
      recommendations = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      recommendations = {
        recommendations: [
          {
            id: 'fallback_1',
            title: 'Review Current Progress',
            description: responseContent,
            priority: 'medium',
            estimatedTime: '30 minutes',
            category: 'planning',
            dependencies: [],
            resources: []
          }
        ]
      };
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}