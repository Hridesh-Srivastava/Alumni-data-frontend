import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

    const response = await fetch(`${API_URL}/auth/google`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to get Google OAuth URL" },
        { status: response.status }
      )
    }

    // Redirect to Google OAuth URL
    return NextResponse.redirect(data.authUrl)
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 