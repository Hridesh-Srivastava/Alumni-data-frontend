import { DashboardStats } from "@/components/dashboard-stats"
import { RecentAlumni } from "@/components/recent-alumni"
import { BackendStatus } from "@/components/backend-status"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome to the HSST Alumni Data Collection System</p>

      <BackendStatus />

      <div className="space-y-6">
        <DashboardStats />
        <RecentAlumni />
      </div>
    </div>
  )
}

