import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth, firestoreService } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Check if Firebase is initialized
    if (!firebaseAuth || !firestoreService) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      )
    }

    // Create Firebase user
    const userCredential = await firebaseAuth.signUp(email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    const userProfile = {
      email: user.email,
      name: name,
      role: 'user',
      tenantId: 'default-tenant',
      avatar: user.photoURL,
      settings: {
        language: 'en',
        timezone: 'UTC',
        notifications: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await firestoreService.create('users', userProfile, user.uid)

    // Create a session token
    const sessionToken = `session_${user.uid}_${Date.now()}`

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: name,
        emailVerified: user.emailVerified,
        role: 'user'
      }
    })

    // Set session cookie
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error("Sign up error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to sign up" },
      { status: 400 }
    )
  }
}