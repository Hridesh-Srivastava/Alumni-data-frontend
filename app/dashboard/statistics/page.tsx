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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchStats = async () => {
      try {
        if (token) {
          console.log("Fetching stats with token...")
          const data = await getStats(token)
          console.log("Stats data received:", data)
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

  // Format year to YYYY-YY pattern and aggregate counts
  const processPassingYearData = (data: Record<string, number> | undefined) => {
    if (!data) return []

    const yearMap = new Map<string, number>()

    Object.entries(data).forEach(([year, count]) => {
      const formattedYear = formatYear(year)
      const currentCount = yearMap.get(formattedYear) || 0
      yearMap.set(formattedYear, currentCount + count)
    })

    return Array.from(yearMap.entries())
      .map(([year, value]) => ({ year, value }))
      .sort((a, b) => a.year.localeCompare(b.year))
  }

  const formatYear = (year: string) => {
    if (year.includes("/")) return year.replace("/", "-")
    if (/^\d{4}$/.test(year)) return `${year}-${(parseInt(year)+1).toString().slice(-2)}`
    return year
  }

  const formatAcademicUnitName = (name: string) => {
    // Don't truncate - let Recharts handle it responsively
    return name
  }

  const academicUnitData = stats?.byAcademicUnit
    ? Object.entries(stats.byAcademicUnit).map(([name, value]) => ({
        name: name, // Full name for display
        shortName: name.length > 15 ? `${name.substring(0, 12)}...` : name, // Short name for labels
        value
      }))
    : []

  console.log("Academic Unit Data for charts:", academicUnitData)
  console.log("Raw stats.byAcademicUnit:", stats?.byAcademicUnit)

  const passingYearData = processPassingYearData(stats?.byPassingYear)
  console.log("Passing Year Data for charts:", passingYearData)
  console.log("Raw stats.byPassingYear:", stats?.byPassingYear)
  const employmentData = stats
    ? [
        { name: "Employed", value: stats?.employmentRate || 0 },
        { name: "Unemployed", value: 100 - (stats?.employmentRate || 0) }
      ]
    : []

  const educationData = stats
    ? [
        { name: "Pursuing", value: stats?.higherEducationRate || 0 },
        { name: "Not Pursuing", value: 100 - (stats?.higherEducationRate || 0) }
      ]
    : []

  // Extended color palette for bars
  const BAR_COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4',
    '#45B7D1', '#FFA07A', '#98D8C8', '#F06292',
    '#6A5ACD', '#20B2AA', '#FF6347', '#4682B4',
    '#32CD32', '#9370DB', '#3CB371', '#FF4500'
  ]

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

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
            <CardContent className="h-[400px]">
              {academicUnitData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm mt-2">Create some alumni records to see statistics</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={academicUnitData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {academicUnitData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, _, props) => [
                        `${value} alumni`,
                        props.payload.name
                      ]}
                    />
                    <Legend 
                      layout={isMobile ? "vertical" : "horizontal"} 
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: '10px' }}
                      formatter={(value, entry) => {
                        const name = entry.payload.name
                        return name.length > 25 ? `${name.substring(0, 22)}...` : name
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Passing Year Chart - With Different Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Passing Year</CardTitle>
              <CardDescription>Number graduating each year</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {passingYearData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm mt-2">Create some alumni records to see statistics</p>
                </div>
              ) : (
                <div className="absolute inset-0 overflow-x-auto pb-4">
                  <div 
                    className="h-full" 
                    style={{ 
                      minWidth: `${Math.max(passingYearData.length * 40, 600)}px`,
                      paddingRight: '20px'
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={passingYearData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: isMobile ? 100 : 70,
                        }}
                        barCategoryGap={10}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year"
                          angle={isMobile ? -90 : -45}
                          textAnchor="end"
                          height={isMobile ? 100 : 70}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          name="Alumni Count"
                          barSize={30}
                          radius={[4, 4, 0, 0]}
                        >
                          {passingYearData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={BAR_COLORS[index % BAR_COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Status</CardTitle>
              <CardDescription>Current employment status of alumni</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {!stats || stats.totalAlumni === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm mt-2">Create some alumni records to see statistics</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name }) => name}
                    >
                      {employmentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Legend 
                      layout={isMobile ? "vertical" : "horizontal"} 
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Higher Education Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Higher Education</CardTitle>
              <CardDescription>Alumni pursuing higher education</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {!stats || stats.totalAlumni === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm mt-2">Create some alumni records to see statistics</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={educationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name }) => name}
                    >
                      {educationData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[(index + 2) % BAR_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Legend 
                      layout={isMobile ? "vertical" : "horizontal"} 
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}