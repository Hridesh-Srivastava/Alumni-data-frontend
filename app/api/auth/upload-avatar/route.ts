import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("avatar") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json(
        { message: "Avatar file and user ID are required" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Please upload a valid image file" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Image size should be less than 5MB" },
        { status: 400 }
      )
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create form data for backend
    const backendFormData = new FormData()
    backendFormData.append("avatar", new Blob([buffer], { type: file.type }), file.name)
    backendFormData.append("userId", userId)

    // Send to backend
    const response = await fetch(`${API_URL}/auth/upload-avatar`, {
      method: "POST",
      body: backendFormData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to upload avatar" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 