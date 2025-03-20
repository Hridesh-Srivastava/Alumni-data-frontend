"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { AlumniForm } from "@/components/alumni-form"
import { getAlumniById } from "@/services/alumni-service"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditAlumniPage() {
  const { isAuthenticated, loading, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [alumni, setAlumni] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchAlumni = async () => {
      try {
        if (token && params.id) {
          const data = await getAlumniById(params.id as string, token)
          setAlumni(data)
        }
      } catch (error) {
        toast.error("Failed to fetch alumni details")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchAlumni()
    }
  }, [isAuthenticated, loading, router, params.id, token])

  if (loading || !isAuthenticated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Edit Alumni"
        description="Update alumni record information"
        action={
          <Link href="/dashboard/alumni">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Alumni
            </Button>
          </Link>
        }
      />
      {alumni && <AlumniForm initialData={alumni} isEditing />}
    </DashboardLayout>
  )
}

