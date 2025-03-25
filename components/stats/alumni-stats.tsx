"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getStats } from "@/services/alumni-service"
import {
  PieChart,
  BarChart,
  Pie,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface StatsData {
  totalAlumni: number
  byAcademicUnit: Record<string, number>
  byPassingYear: Record<string, number>
  employmentRate: number
  higherEducationRate: number
}

export function AlumniStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh

  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log("Fetching alumni statistics...")

      // Clear any cached data
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
      const timestamp = new Date().getTime()

      // Add a timestamp to prevent caching
      const data = await getStats()
      console.log("Statistics received:", data)

      if (data) {
        setStats(data)
        setError(null)
      } else {
        setError("No statistics data received")
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError("Failed to load statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Refresh stats every 15 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 15000)

    return () => clearInterval(interval)
  }, [refreshKey])

  // Prepare data for charts
  const academicUnitData =
    stats && stats.byAcademicUnit
      ? Object.entries(stats.byAcademicUnit).map(([name, value]) => ({
          name: name.length > 30 ? name.substring(0, 30) + "..." : name,
          value,
          fullName: name,
        }))
      : []

  const passingYearData =
    stats && stats.byPassingYear
      ? Object.entries(stats.byPassingYear)
          .map(([year, count]) => ({
            year,
            count,
          }))
          .sort((a, b) => a.year.localeCompare(b.year))
      : []

  const employmentData = stats
    ? [
        { name: "Employed", value: stats.employmentRate },
        { name: "Unemployed", value: 100 - stats.employmentRate },
      ]
    : []

  const educationData = stats
    ? [
        { name: "Pursuing Higher Education", value: stats.higherEducationRate },
        { name: "Not", value: 100 - stats.higherEducationRate },
      ]
    : []

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  if (loading) {
    return <StatsLoading />
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchStats} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Alumni by Academic Unit</CardTitle>
          <CardDescription>Distribution of alumni across different academic units</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {academicUnitData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={academicUnitData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {academicUnitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alumni by Passing Year</CardTitle>
          <CardDescription>Number of alumni graduating each year</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {passingYearData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passingYearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment Status</CardTitle>
          <CardDescription>Current employment status of alumni</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {stats ? (
            <div className="flex h-full flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Employed: {stats.employmentRate}%</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Higher Education</CardTitle>
          <CardDescription>Alumni pursuing higher education</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {stats ? (
            <div className="flex h-full flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={educationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#FFBB28" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Pursuing: {stats.higherEducationRate}%</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Import Button for the error state
import { Button } from "@/components/ui/button"

