import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { OnboardingStep } from '@prisma/client'

// GET /api/onboarding - Get user's onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const onboarding = await db.userOnboarding.findUnique({
      where: { userId: session.user.id }
    })

    if (!onboarding) {
      return NextResponse.json({
        step: OnboardingStep.PROFILE_SETUP,
        completed: false,
        progress: 0
      })
    }

    // Calculate progress based on completed steps
    const steps: Array<"PROFILE_SETUP" | "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "KYC_VERIFICATION" | "PREFERENCES_SETUP"> = [
      "PROFILE_SETUP",
      "EMAIL_VERIFICATION", 
      "PHONE_VERIFICATION",
      "KYC_VERIFICATION",
      "PREFERENCES_SETUP"
    ]

    const currentStepIndex = steps.indexOf(onboarding.step as any)
    const progress = ((currentStepIndex + 1) / steps.length) * 100

    return NextResponse.json({
      ...onboarding,
      progress,
      completed: onboarding.step === "COMPLETE"
    })
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/onboarding - Update user's onboarding progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step, completed, skippedSteps, preferences } = body

    const onboarding = await db.userOnboarding.upsert({
      where: { userId: session.user.id },
      update: {
        step: step as OnboardingStep,
        completedAt: completed ? new Date() : null,
        skippedSteps: skippedSteps ? JSON.stringify(skippedSteps) : null,
        preferences: preferences ? JSON.stringify(preferences) : null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        step: step as OnboardingStep,
        completedAt: completed ? new Date() : null,
        skippedSteps: skippedSteps ? JSON.stringify(skippedSteps) : null,
        preferences: preferences ? JSON.stringify(preferences) : null
      }
    })

    return NextResponse.json(onboarding)
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}