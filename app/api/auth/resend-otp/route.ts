import { type NextRequest, NextResponse } from "next/server"
import { sendOTPEmail } from "@/lib/email"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, tempUserId } = await request.json()

    if (!email || !tempUserId) {
      return NextResponse.json({ message: "Email and tempUserId are required" }, { status: 400 })
    }

    const sanitizedEmail = email.toLowerCase().trim()

    // Connect to database
    const { db } = await connectToDatabase()

    // Get temp user data
    const tempUser = await db.collection("temp_users").findOne({
      _id: tempUserId,
      email: sanitizedEmail,
    })

    if (!tempUser) {
      return NextResponse.json({ message: "User session expired. Please register again." }, { status: 400 })
    }

    // Check if temp user hasn't expired
    if (tempUser.expiresAt && new Date() > new Date(tempUser.expiresAt)) {
      // Clean up expired temp user
      await db.collection("temp_users").deleteOne({ _id: tempUserId })
      await db.collection("otps").deleteMany({ tempUserId })

      return NextResponse.json({ message: "Registration session expired. Please register again." }, { status: 400 })
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Delete old OTPs for this email and tempUserId
    await db.collection("otps").deleteMany({
      email: sanitizedEmail,
      tempUserId,
    })

    // Store new OTP in database
    await db.collection("otps").insertOne({
      email: sanitizedEmail,
      otp,
      tempUserId,
      expiresAt: otpExpiry,
      createdAt: new Date(),
      verified: false,
    })

    // Send OTP email using the original user name
    try {
      await sendOTPEmail(sanitizedEmail, tempUser.name, otp)
      console.log(`New OTP sent to ${sanitizedEmail}: ${otp}`) // For development - remove in production
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      return NextResponse.json({ message: "Failed to send verification email. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ message: "New OTP sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json({ message: "Failed to resend OTP" }, { status: 500 })
  }
}
