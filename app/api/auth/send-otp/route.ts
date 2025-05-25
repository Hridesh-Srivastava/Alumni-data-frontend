import { type NextRequest, NextResponse } from "next/server"
import { sendOTPEmail } from "@/lib/email"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, name, tempUserId } = await request.json()

    if (!email || !name || !tempUserId) {
      return NextResponse.json({ message: "Email, name, and tempUserId are required" }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Connect to database
    const { db } = await connectToDatabase()

    // Store OTP in database
    await db.collection("otps").insertOne({
      email: email.toLowerCase().trim(),
      otp,
      tempUserId,
      expiresAt: otpExpiry,
      createdAt: new Date(),
      verified: false,
    })

    // Send OTP email
    await sendOTPEmail(email, name, otp)

    console.log(`OTP sent to ${email}: ${otp}`) // For development - remove in production

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 })
  }
}
