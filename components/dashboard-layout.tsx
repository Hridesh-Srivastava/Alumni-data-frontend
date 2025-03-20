"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  GraduationCap,
  BarChart3,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Alumni Records", href: "/dashboard/alumni", icon: Users },
    { name: "Statistics", href: "/dashboard/statistics", icon: BarChart3 },
    { name: "Academic Units", href: "/dashboard/academic-units", icon: GraduationCap },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`)

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/dashboard" className="flex items-center">
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">HSST Alumni</span>
            </Link>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-center text-sm font-medium text-primary-foreground leading-8">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b bg-background shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-primary text-center text-sm font-medium text-primary-foreground leading-8">
                      {user?.name?.charAt(0) || "A"}
                    </div>
                    <span className="ml-2 hidden md:inline-block">{user?.name || "Admin"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

