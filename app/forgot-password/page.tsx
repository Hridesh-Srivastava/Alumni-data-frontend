"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { requestPasswordReset } from "@/services/auth-service"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Log the request for debugging
      console.log("Requesting password reset for email:", email)

      // Make sure email is trimmed and lowercase for consistency
      const formattedEmail = email.trim().toLowerCase()

      // Call the service function
      await requestPasswordReset(formattedEmail)

      console.log("Password reset request successful")
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset request failed:", error)

      if (error instanceof Error) {
        setError(error.message)
      } else if (typeof error === "string") {
        setError(error)
      } else {
        setError("An error occurred. Please try again later.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        href="/login"
        className="absolute left-4 top-4 inline-flex items-center text-sm font-medium text-primary hover:underline md:left-8 md:top-8"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Login
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you instructions to reset your password"}
          </CardDescription>
        </CardHeader>

        {!isSubmitted ? (
          <>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Remember your password? Sign in
              </Link>
            </CardFooter>
          </>
        ) : (
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <Mail className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                We've sent reset instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              Return to Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
