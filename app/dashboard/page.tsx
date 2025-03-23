import { DashboardStats } from "@/components/dashboard-stats"
import { RecentAlumni } from "@/components/recent-alumni"
import { BackendStatus } from "@/components/backend-status"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline">
            Contact
          </Link>
        </nav>
      </div>
      <p className="text-muted-foreground mb-6">Welcome to the HSST Alumni Data Collection System</p>

      <BackendStatus />

      <div className="space-y-6">
        <DashboardStats />
        <RecentAlumni />
      </div>
    </div>
  )
}

