"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/services/auth-service"

export default function ResetPasswordPage({ params }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [token, setToken] = useState("")

  // Use useEffect to handle the params.token
  useEffect(() => {
    if (params && params.token) {
      setToken(params.token)
    }
  }, [params])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password) {
      setError("Please enter a new password")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      console.log("Resetting password with token:", token)
      await resetPassword(token, password)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset error:", error)

      if (error instanceof Error) {
        setError(error.message)
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
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            {isSubmitted ? "Your password has been reset successfully" : "Enter your new password"}
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
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="space-y-4">
            <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your password has been reset successfully.
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Sign In with New Password
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

