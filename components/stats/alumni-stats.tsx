"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStats } from "@/services/alumni-service"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

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

  // Prepare data with responsive formatting
  const academicUnitData = stats?.byAcademicUnit
    ? Object.entries(stats.byAcademicUnit).map(([name, value]) => ({
        name: name.length > 15 ? `${name.substring(0, 12)}...` : name,
        fullName: name,
        value
      }))
    : []

  const passingYearData = stats?.byPassingYear
    ? Object.entries(stats.byPassingYear).map(([year, value]) => ({
        year,
        value
      }))
    : []

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <DashboardLayout>
      <DashboardHeader title="Statistics" description="Visualize alumni data and trends" />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Academic Unit Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Academic Unit</CardTitle>
              <CardDescription>Distribution across academic units</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={academicUnitData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {academicUnitData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} alumni`,
                      props.payload.fullName || name
                    ]}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Passing Year Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Passing Year</CardTitle>
              <CardDescription>Number graduating each year</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart 
  data={passingYearData}
  margin={{ top: 5, right: 30, left: 20, bottom: 40 }} // Increased bottom margin
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis 
    dataKey="year"
    angle={-45} // Rotate labels
    textAnchor="end"
    height={60} // Increase height for rotated labels
    tick={{ fontSize: 10 }} // Smaller font
    interval={0} // Show all ticks
  />
  <YAxis />
  <Tooltip formatter={(value) => [`${value} alumni`, ""]} />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Employment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Status</CardTitle>
              <CardDescription>Current employment status</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Employed", value: stats?.employmentRate || 0 },
                      { name: "Unemployed", value: 100 - (stats?.employmentRate || 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Higher Education Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Higher Education</CardTitle>
              <CardDescription>Alumni pursuing higher education</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Pursuing", value: stats?.higherEducationRate || 0 },
                      { name: "Not Pursuing", value: 100 - (stats?.higherEducationRate || 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#FFBB28" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}