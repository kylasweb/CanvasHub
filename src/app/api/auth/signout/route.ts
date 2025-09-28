import { NextRequest, NextResponse } from "next/server"
import { firebaseAuth } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase is initialized
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      )
    }

    await firebaseAuth.signOut()
    
    // Clear any session cookies
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth-token', '', { expires: new Date(0) })
    
    return response
  } catch (error: any) {
    console.error("Sign out error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to sign out" },
      { status: 500 }
    )
  }
}