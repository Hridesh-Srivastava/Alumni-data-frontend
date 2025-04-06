"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// CSS classes for different font sizes
const fontSizeClasses = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
}

export default function SettingsPage() {
  const { user, updateSettings } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [browserNotifications, setBrowserNotifications] = useState(false)

  // Privacy settings
  const [showEmail, setShowEmail] = useState(false)
  const [showProfile, setShowProfile] = useState(true)

  // Appearance settings
  const [theme, setTheme] = useState("system")
  const [fontSize, setFontSize] = useState("medium")

  // Load user settings when component mounts
  useEffect(() => {
    if (user?.settings) {
      // Notifications
      if (user.settings.notifications) {
        setEmailNotifications(user.settings.notifications.email || false)
        setBrowserNotifications(user.settings.notifications.browser || false)
      }

      // Privacy
      if (user.settings.privacy) {
        setShowEmail(user.settings.privacy.showEmail || false)
        setShowProfile(user.settings.privacy.showProfile || true)
      }

      // Appearance
      if (user.settings.appearance) {
        setTheme(user.settings.appearance.theme || "system")
        setFontSize(user.settings.appearance.fontSize || "medium")
      }
    }
  }, [user])

  // Apply font size to the document
  useEffect(() => {
    const applyFontSize = () => {
      const root = document.documentElement

      // Remove all font size classes
      Object.values(fontSizeClasses).forEach((cls) => {
        root.classList.remove(cls)
      })

      // Add the selected font size class
      if (fontSizeClasses[fontSize as keyof typeof fontSizeClasses]) {
        root.classList.add(fontSizeClasses[fontSize as keyof typeof fontSizeClasses])
      }
    }

    applyFontSize()
  }, [fontSize])

  const handleSaveNotifications = async () => {
    setIsLoading(true)

    try {
      await updateSettings({
        notifications: {
          email: emailNotifications,
          browser: browserNotifications,
        },
      })

      toast.success("Notification settings saved")
    } catch (error) {
      toast.error("Failed to save notification settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    setIsLoading(true)

    try {
      await updateSettings({
        privacy: {
          showEmail,
          showProfile,
        },
      })

      toast.success("Privacy settings saved")
    } catch (error) {
      toast.error("Failed to save privacy settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAppearance = async () => {
    setIsLoading(true)

    try {
      await updateSettings({
        appearance: {
          theme,
          fontSize,
        },
      })

      toast.success("Appearance settings saved")

      // Apply theme immediately
      if (theme !== "system") {
        document.documentElement.classList.toggle("dark", theme === "dark")
      } else {
        // Use system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        document.documentElement.classList.toggle("dark", prefersDark)
      }
    } catch (error) {
      toast.error("Failed to save appearance settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your application settings</p>

      <Tabs defaultValue="privacy">
        <TabsList className="mb-6">
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        

        <TabsContent value="privacy" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
            <p className="text-muted-foreground mb-6">Manage your privacy preferences</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
                </div>
                <Switch id="show-email" checked={showEmail} onCheckedChange={setShowEmail} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-profile">Show Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                </div>
                <Switch id="show-profile" checked={showProfile} onCheckedChange={setShowProfile} />
              </div>
            </div>

            <Button onClick={handleSavePrivacy} className="mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
            <p className="text-muted-foreground mb-6">Customize the look and feel of the application</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <RadioGroup value={theme} onValueChange={setTheme} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Font Size</Label>
                <RadioGroup value={fontSize} onValueChange={setFontSize} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="font-small" />
                    <Label htmlFor="font-small" className="text-sm">
                      Small
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="font-medium" />
                    <Label htmlFor="font-medium" className="text-base">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="font-large" />
                    <Label htmlFor="font-large" className="text-lg">
                      Large
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button onClick={handleSaveAppearance} className="mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

