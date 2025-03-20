"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Building, Award } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getStats } from "@/services/alumni-service"
import { toast } from "sonner"

export function DashboardStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalAlumni: 0,
    byAcademicUnit: {
      "Himalayan School of Science/Engineering and Technology": 0,
      "Himalayan Institute of Medical Sciences (Medical)": 0,
      "Himalayan School of Management Studies": 0,
      Other: 0,
    },
    byPassingYear: {
      "2016-17": 0,
      "2017-18": 0,
      "2018-19": 0,
      "2019-20": 0,
    },
    employmentRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (token) {
          const data = await getStats(token)
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast.error("Failed to load dashboard statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token])

  const stats_cards = [
    {
      title: "Total Alumni",
      value: stats.totalAlumni,
      icon: <Users className="h-6 w-6 text-primary" />,
      description: "Registered in the database",
    },
    {
      title: "Engineering Graduates",
      value: stats.byAcademicUnit["Himalayan School of Science/Engineering and Technology"] || 0,
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      description: "From HSST",
    },
    {
      title: "Employment Rate",
      value: `${stats.employmentRate}%`,
      icon: <Building className="h-6 w-6 text-primary" />,
      description: "Employed after graduation",
    },
    {
      title: "Higher Education",
      value: "42%",
      icon: <Award className="h-6 w-6 text-primary" />,
      description: "Pursuing advanced degrees",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats_cards.map((card, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : card.value}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

