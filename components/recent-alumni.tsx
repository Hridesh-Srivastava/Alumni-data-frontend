"use client"

import { useState, useEffect } from "react"
import { getAlumni } from "@/services/alumni-service"
import { Loader2, Eye, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NetworkError } from "@/components/network-error"
import Link from "next/link"

interface Alumni {
  _id: string
  name: string
  program: string
  passingYear: string
}

export function RecentAlumni() {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlumni = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAlumni({ page: 1, limit: 5 })
      setAlumni(response.data || [])
    } catch (error) {
      console.error("Error fetching alumni:", error)
      setError("Failed to load recent alumni")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlumni()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Alumni</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Alumni</h2>
        </div>
        <NetworkError message={error} onRetry={fetchAlumni} />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Alumni</h2>
        <Link href="/dashboard/alumni">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {alumni.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No alumni records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alumni.map((alumnus) => (
            <div key={alumnus._id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">{alumnus.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-medium">{alumnus.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {alumnus.program} • {alumnus.passingYear}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/alumni/${alumnus._id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/alumni/${alumnus._id}/edit`}>
                    <PenSquare className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

