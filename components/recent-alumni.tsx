"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Eye, Edit } from "lucide-react"
import { getAlumni } from "@/services/alumni-service"
import { toast } from "sonner"

interface Alumni {
  _id: string
  name: string
  academicUnit: string
  program: string
  passingYear: string
  registrationNumber: string
  createdAt: string
}

export function RecentAlumni() {
  const { token } = useAuth()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        if (token) {
          const response = await getAlumni({ page: 1, limit: 5 }, token)
          setAlumni(response.data || [])
        }
      } catch (error) {
        console.error("Error fetching alumni:", error)
        toast.error("Failed to load recent alumni")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlumni()
  }, [token])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Alumni</CardTitle>
          <CardDescription>Latest alumni records added to the system</CardDescription>
        </div>
        <Link href="/dashboard/alumni">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {alumni.length === 0 ? (
              <p className="text-center text-muted-foreground">No alumni records found</p>
            ) : (
              alumni.map((alumnus) => (
                <div key={alumnus._id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {alumnus.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alumnus.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {alumnus.program} • {alumnus.passingYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/alumni/${alumnus._id}`}>
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/alumni/${alumnus._id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

