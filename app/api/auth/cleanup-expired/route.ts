import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// This endpoint can be called periodically to clean up expired data
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()

    // Clean up expired temp users
    const expiredTempUsers = await db.collection("temp_users").deleteMany({
      expiresAt: { $lt: now },
    })

    // Clean up expired OTPs
    const expiredOTPs = await db.collection("otps").deleteMany({
      expiresAt: { $lt: now },
    })

    console.log(
      `Cleanup completed: ${expiredTempUsers.deletedCount} temp users, ${expiredOTPs.deletedCount} OTPs removed`,
    )

    return NextResponse.json(
      {
        message: "Cleanup completed",
        tempUsersRemoved: expiredTempUsers.deletedCount,
        otpsRemoved: expiredOTPs.deletedCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ message: "Cleanup failed" }, { status: 500 })
  }
}
