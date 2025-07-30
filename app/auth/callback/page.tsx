"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

function AuthCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processing authentication...")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithOAuth } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token")
        const userParam = searchParams.get("user")
        const error = searchParams.get("error")

        if (error) {
          setStatus("error")
          setMessage("Authentication failed. Please try again.")
          toast.error("Authentication failed")
          setTimeout(() => {
            router.push("/login")
          }, 3000)
          return
        }

        if (!token || !userParam) {
          setStatus("error")
          setMessage("Invalid authentication response")
          toast.error("Invalid authentication response")
          setTimeout(() => {
            router.push("/login")
          }, 3000)
          return
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userParam))

        // Update AuthContext state directly using the new OAuth function
        loginWithOAuth(userData, token)

        setStatus("success")
        setMessage("Authentication successful! Redirecting to dashboard...")
        toast.success("Successfully authenticated with Google")

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage("Authentication failed. Please try again.")
        toast.error("Authentication failed")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === "error" && <XCircle className="h-6 w-6 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Success!"}
            {status === "error" && "Error"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-muted-foreground">Please wait while we complete your authentication...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            <CardDescription>Preparing authentication...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 