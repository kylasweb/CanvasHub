import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    // Check for session token in cookies
    const sessionToken = request.cookies.get('auth-token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Check if Firebase is initialized
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      )
    }

    // Get current Firebase user
    const currentUser = firebaseAuth.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Simple role assignment based on email (in a real app, this would come from a database)
    const userRole = currentUser.email?.includes('admin') ? 'admin' : 'user'

    return NextResponse.json({
      user: {
        id: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName,
        emailVerified: currentUser.emailVerified,
        avatar: currentUser.photoURL,
        role: userRole
      }
    })
  } catch (error: any) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    )
  }
}