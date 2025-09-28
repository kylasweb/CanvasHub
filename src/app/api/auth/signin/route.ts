import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if Firebase is initialized
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      )
    }

    const userCredential = await firebaseAuth.signIn(email, password)
    const user = userCredential.user

    // Create a session token (in a real app, you'd use JWT or similar)
    const sessionToken = `session_${user.uid}_${Date.now()}`
    
    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        emailVerified: user.emailVerified,
        role: user.email?.includes('admin') ? 'admin' : 'user' // Simple role assignment
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
    console.error("Sign in error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to sign in" },
      { status: 401 }
    )
  }
}