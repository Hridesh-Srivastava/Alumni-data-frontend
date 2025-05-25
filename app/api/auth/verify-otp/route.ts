import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, tempUserId } = await request.json()

    if (!email || !otp || !tempUserId) {
      return NextResponse.json({ message: "Email, OTP, and tempUserId are required" }, { status: 400 })
    }

    const sanitizedEmail = email.toLowerCase().trim()

    // Connect to database
    const { db } = await connectToDatabase()

    // Find and verify OTP
    const otpRecord = await db.collection("otps").findOne({
      email: sanitizedEmail,
      otp: otp.toString(),
      tempUserId,
      verified: false,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Mark OTP as verified
    await db.collection("otps").updateOne({ _id: otpRecord._id }, { $set: { verified: true, verifiedAt: new Date() } })

    // Get temp user data
    const tempUser = await db.collection("temp_users").findOne({
      _id: tempUserId,
      email: sanitizedEmail,
    })

    if (!tempUser) {
      return NextResponse.json({ message: "Temporary user data not found" }, { status: 400 })
    }

    // Create user in main Express backend using ORIGINAL password
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

    try {
      console.log("Creating user in backend with data:", {
        name: tempUser.name,
        email: tempUser.email,
        // password is hidden for security
      })

      const backendResponse = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tempUser.name,
          email: tempUser.email,
          password: tempUser.password, // Use original password, not hashed
        }),
      })

      const responseData = await backendResponse.json()
      console.log("Backend response status:", backendResponse.status)
      console.log("Backend response data:", responseData)

      if (!backendResponse.ok) {
        // If user already exists, that means someone registered with this email
        // while the OTP verification was pending
        if (responseData.message && responseData.message.includes("User already exists")) {
          // Clean up temporary data
          await db.collection("temp_users").deleteOne({ _id: tempUserId })
          await db.collection("otps").deleteMany({ email: sanitizedEmail })

          return NextResponse.json(
            { message: "This email is already registered. Please use the login page to access your account." },
            { status: 400 },
          )
        }

        throw new Error(responseData.message || "Failed to create user account")
      }

      const userData = responseData

      // Clean up temporary data after successful registration
      await db.collection("temp_users").deleteOne({ _id: tempUserId })
      await db.collection("otps").deleteMany({ email: sanitizedEmail })

      console.log("User successfully created and verified:", userData.email)

      return NextResponse.json(
        {
          message: "Email verified successfully",
          user: {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            settings: userData.settings,
          },
          token: userData.token,
        },
        { status: 200 },
      )
    } catch (backendError) {
      console.error("Backend registration error:", backendError)

      // Clean up temporary data even if backend fails
      await db.collection("temp_users").deleteOne({ _id: tempUserId })
      await db.collection("otps").deleteMany({ email: sanitizedEmail })

      return NextResponse.json(
        {
          message:
            backendError instanceof Error ? backendError.message : "Failed to create user account. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "OTP verification failed" },
      { status: 500 },
    )
  }
}
