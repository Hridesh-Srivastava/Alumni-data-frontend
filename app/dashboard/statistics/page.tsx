"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStats } from "@/services/alumni-service"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function StatisticsPage() {
  const { isAuthenticated, loading, token } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchStats = async () => {
      try {
        if (token) {
          const data = await getStats(token)
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast.error("Failed to load statistics")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [isAuthenticated, loading, router, token])

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Prepare data for charts
  const academicUnitData = stats
    ? Object.entries(stats.byAcademicUnit).map(([name, value]) => ({
        name: name.replace("Himalayan ", "").replace(" and Technology", ""),
        value,
      }))
    : []

  const passingYearData = stats
    ? Object.entries(stats.byPassingYear).map(([year, value]) => ({
        year,
        value,
      }))
    : []

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <DashboardLayout>
      <DashboardHeader title="Statistics" description="Visualize alumni data and trends" />

      {isLoading ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Academic Unit</CardTitle>
              <CardDescription>Distribution of alumni across different academic units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={academicUnitData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {academicUnitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} alumni`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alumni by Passing Year</CardTitle>
              <CardDescription>Number of alumni graduating each year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={passingYearData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} alumni`, "Count"]} />
                    <Bar dataKey="value" fill="#8884d8" name="Alumni Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Status</CardTitle>
              <CardDescription>Current employment status of alumni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Employed", value: stats?.employmentRate || 0 },
                        { name: "Unemployed", value: 100 - (stats?.employmentRate || 0) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Higher Education</CardTitle>
              <CardDescription>Alumni pursuing higher education</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Pursuing Higher Education", value: 42 },
                        { name: "Not Pursuing Higher Education", value: 58 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#FFBB28" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}

