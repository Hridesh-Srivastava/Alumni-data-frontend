"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { AlumniTable } from "@/components/alumni-table"
import { AlumniFilter } from "@/components/alumni-filter"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function AlumniPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState({
    academicUnit: "",
    passingYear: "",
    program: "",
  })
  const [totalAlumni, setTotalAlumni] = useState(0) 

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  
  const handleTotalChange = (total: number) => {
    console.log("Total alumni count received:", total) 
    setTotalAlumni(total)
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Alumni Records"
        description="Manage and view all alumni records"
        action={
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalAlumni}</span> alumni
            </div>
            <Link href="/dashboard/alumni/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Alumni
              </Button>
            </Link>
          </div>
        }
      />
      <div className="space-y-4">
        <AlumniFilter onFilterChange={setFilter} />
        <AlumniTable filter={filter} onTotalChange={handleTotalChange} />
      </div>
    </DashboardLayout>
  )
}
