"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: false,
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
    },
    appearance: {
      theme: "light",
      compactMode: false,
    },
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  const handleSwitchChange = (section: string, setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [setting]: !prev[section as keyof typeof prev][setting as keyof (typeof prev)[keyof typeof prev]],
      },
    }))
  }

  const handleRadioChange = (section: string, setting: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [setting]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
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
      <DashboardHeader title="Settings" description="Manage your application settings" />
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">Receive notifications via email</span>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={() => handleSwitchChange("notifications", "email")}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="browser-notifications" className="flex flex-col space-y-1">
                  <span>Browser Notifications</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive notifications in your browser
                  </span>
                </Label>
                <Switch
                  id="browser-notifications"
                  checked={settings.notifications.browser}
                  onCheckedChange={() => handleSwitchChange("notifications", "browser")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="public"
                      name="profileVisibility"
                      value="public"
                      checked={settings.privacy.profileVisibility === "public"}
                      onChange={() => handleRadioChange("privacy", "profileVisibility", "public")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="public" className="text-sm font-normal">
                      Public - Anyone can view your profile
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      name="profileVisibility"
                      value="private"
                      checked={settings.privacy.profileVisibility === "private"}
                      onChange={() => handleRadioChange("privacy", "profileVisibility", "private")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="private" className="text-sm font-normal">
                      Private - Only you can view your profile
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="data-sharing" className="flex flex-col space-y-1">
                  <span>Data Sharing</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Allow sharing of anonymized data for system improvements
                  </span>
                </Label>
                <Switch
                  id="data-sharing"
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={() => handleSwitchChange("privacy", "dataSharing")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="light"
                      name="theme"
                      value="light"
                      checked={settings.appearance.theme === "light"}
                      onChange={() => handleRadioChange("appearance", "theme", "light")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="light" className="text-sm font-normal">
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="dark"
                      name="theme"
                      value="dark"
                      checked={settings.appearance.theme === "dark"}
                      onChange={() => handleRadioChange("appearance", "theme", "dark")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="dark" className="text-sm font-normal">
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="system"
                      name="theme"
                      value="system"
                      checked={settings.appearance.theme === "system"}
                      onChange={() => handleRadioChange("appearance", "theme", "system")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="system" className="text-sm font-normal">
                      System
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="compact-mode" className="flex flex-col space-y-1">
                  <span>Compact Mode</span>
                  <span className="text-sm font-normal text-muted-foreground">Use a more compact layout</span>
                </Label>
                <Switch
                  id="compact-mode"
                  checked={settings.appearance.compactMode}
                  onCheckedChange={() => handleSwitchChange("appearance", "compactMode")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

