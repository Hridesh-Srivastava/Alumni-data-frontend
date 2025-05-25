"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle, CheckCircle, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/services/auth-service"

interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [token, setToken] = useState("")

  const passwordRules: PasswordRule[] = [
    {
      label: "At least 6 characters",
      test: (pwd) => pwd.length >= 6,
    },
    {
      label: "At least one uppercase letter",
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: "At least one number",
      test: (pwd) => /\d/.test(pwd),
    },
    {
      label: "At least one special character",
      test: (pwd) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    },
  ]

  const isPasswordValid = passwordRules.every((rule) => rule.test(password))

  useEffect(() => {
    // Extract token from URL directly instead of using params
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/")
      const tokenFromUrl = pathSegments[pathSegments.length - 1]

      if (tokenFromUrl) {
        console.log("Token from URL:", tokenFromUrl)
        setToken(tokenFromUrl)
      } else {
        console.error("No token found in URL")
        setError("Invalid or missing reset token")
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password) {
      setError("Please enter a new password")
      return
    }

    if (!isPasswordValid) {
      setError("Password does not meet all requirements")
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
      console.log("Password reset successful")
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset error:", error)

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
                  {password && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Password requirements:</p>
                      {passwordRules.map((rule, index) => {
                        const isValid = rule.test(password)
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            {isValid ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${isValid ? "text-green-600" : "text-red-600"}`}>
                              {rule.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
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
                  {confirmPassword && password !== confirmPassword && (
                    <div className="flex items-center space-x-2 mt-1">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Passwords do not match</span>
                    </div>
                  )}
                  {confirmPassword && password === confirmPassword && password && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Passwords match</span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !token || !isPasswordValid || password !== confirmPassword}
                >
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
