"use client"

import { useState, useEffect } from "react"
import { getStats } from "@/services/alumni-service"
import { Users, GraduationCap, BookOpen } from "lucide-react"
import { NetworkError } from "@/components/network-error"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    employmentRate: 0,
    higherEducationRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStats()
      setStats({
        totalAlumni: data.totalAlumni || 0,
        employmentRate: data.employmentRate || 0,
        higherEducationRate: data.higherEducationRate || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Failed to load statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-8 w-24 bg-muted rounded mb-4"></div>
            <div className="h-12 w-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <NetworkError message={error} onRetry={fetchStats} />
  }

  const statItems = [
    {
      title: "Total Alumni",
      value: stats.totalAlumni,
      description: "Registered in the database",
      icon: <Users className="h-8 w-8 text-primary" />,
    },
    {
      title: "Employment Rate",
      value: `${stats.employmentRate}%`,
      description: "Employed after graduation",
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
    },
    {
      title: "Higher Education",
      value: `${stats.higherEducationRate}%`,
      description: "Pursuing advanced degrees",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{item.title}</h3>
            {item.icon}
          </div>
          <div className="text-3xl font-bold">{item.value}</div>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>
      ))}
    </div>
  )
}

