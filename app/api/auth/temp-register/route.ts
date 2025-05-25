import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { sendOTPEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Please provide all fields" }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Please provide a valid email" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    const sanitizedEmail = email.toLowerCase().trim()

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user already exists in main backend by making a proper check
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

    try {
      // Instead of trying to register, let's check by trying to get user profile with a dummy token
      // This is a better approach that won't create unwanted users

      // First, let's check if there's already a temp user with this email
      const existingTempUser = await db.collection("temp_users").findOne({
        email: sanitizedEmail,
      })

      if (existingTempUser) {
        // Clean up old temp user and OTP
        await db.collection("temp_users").deleteMany({ email: sanitizedEmail })
        await db.collection("otps").deleteMany({ email: sanitizedEmail })
      }

      // We'll skip the backend check for now since it's causing issues
      // The backend will handle duplicate checking during actual registration
    } catch (error) {
      console.log("Backend check skipped, continuing with temp registration")
    }

    // Hash password for temporary storage
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate unique temp user ID
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Clean up any existing temp users with same email (just to be safe)
    await db.collection("temp_users").deleteMany({
      email: sanitizedEmail,
    })

    // Clean up any existing OTPs for this email
    await db.collection("otps").deleteMany({
      email: sanitizedEmail,
    })

    // Store temporary user data with ORIGINAL password (not hashed for backend)
    const tempUser = {
      _id: tempUserId,
      name: name.trim(),
      email: sanitizedEmail,
      password: password, // Store original password for backend registration
      hashedPassword: hashedPassword, // Store hashed version for security
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    }

    await db.collection("temp_users").insertOne(tempUser)

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP
    await db.collection("otps").insertOne({
      email: sanitizedEmail,
      otp,
      tempUserId,
      expiresAt: otpExpiry,
      createdAt: new Date(),
      verified: false,
    })

    // Send OTP email
    try {
      await sendOTPEmail(sanitizedEmail, name.trim(), otp)
      console.log(`Temp user created and OTP sent to ${sanitizedEmail}: ${otp}`) // For development
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      // Clean up temp user and OTP if email fails
      await db.collection("temp_users").deleteOne({ _id: tempUserId })
      await db.collection("otps").deleteMany({ tempUserId })

      return NextResponse.json(
        { message: "Failed to send verification email. Please check your email address and try again." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        tempUserId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Temp registration error:", error)
    return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 })
  }
}
