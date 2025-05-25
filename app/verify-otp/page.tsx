"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [tempUserId, setTempUserId] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email and tempUserId from URL params
    const emailParam = searchParams.get("email")
    const userIdParam = searchParams.get("userId")

    if (!emailParam || !userIdParam) {
      toast.error("Invalid verification link")
      router.push("/register")
      return
    }

    setEmail(emailParam)
    setTempUserId(userIdParam)

    // Start 2-minute timer for resend
    setResendTimer(120)
  }, [searchParams, router])

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
    setError("")
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          tempUserId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed")
      }

      // Store user data and token
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Set cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`

      toast.success("Email verified successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("OTP verification error:", error)
      setError(error.message || "OTP verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    setIsResending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          tempUserId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP")
      }

      toast.success("OTP sent successfully! Please check your email.")
      setResendTimer(120) // Reset 2-minute timer
      setOtp("") // Clear current OTP
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      setError(error.message || "Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        href="/register"
        className="absolute left-4 top-4 inline-flex items-center text-sm font-medium text-primary hover:underline md:left-8 md:top-8"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Register
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleOTPChange}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                disabled={isVerifying}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code sent to your email</p>
            </div>

            <Button type="submit" className="w-full" disabled={isVerifying || otp.length !== 6}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>

            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">Resend available in {formatTime(resendTimer)}</p>
            ) : (
              <Button variant="outline" onClick={handleResendOTP} disabled={isResending} className="w-full">
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">Check your spam folder if you don't see the email</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
