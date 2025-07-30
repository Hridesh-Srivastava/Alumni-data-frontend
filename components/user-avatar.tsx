"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface UserAvatarProps {
  user: any
  size?: "sm" | "md" | "lg"
  showUploadButton?: boolean
  onAvatarUpdate?: (newAvatarUrl: string) => void
  className?: string
}

export function UserAvatar({ 
  user, 
  size = "md", 
  showUploadButton = false, 
  onAvatarUpdate,
  className = "" 
}: UserAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)
      formData.append("userId", user._id)

      const response = await fetch("/api/auth/upload-avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload avatar")
      }

      toast.success("Avatar updated successfully")
      
      // Update localStorage with new user data and token
      if (data.user && data.token) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)
        
        // Update cookie
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`
      }
      
      // Call the callback to update the user state
      if (onAvatarUpdate) {
        onAvatarUpdate(data.avatarUrl)
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast.error("Failed to upload avatar. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return

    setIsUploading(true)

    try {
      const response = await fetch("/api/auth/remove-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove avatar")
      }

      toast.success("Avatar removed successfully")
      
      // Update localStorage with new user data and token
      if (data.user && data.token) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)
        
        // Update cookie
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`
      }
      
      // Call the callback to update the user state
      if (onAvatarUpdate) {
        onAvatarUpdate("")
      }
    } catch (error) {
      console.error("Avatar remove error:", error)
      toast.error("Failed to remove avatar. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // If user has an avatar (from OAuth or Cloudinary)
  if (user?.avatar) {
    return (
      <div className={`relative ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-muted`}>
          <Image
            src={user.avatar}
            alt={user.name || "User avatar"}
            width={size === "sm" ? 32 : size === "md" ? 48 : 80}
            height={size === "sm" ? 32 : size === "md" ? 48 : 80}
            className="w-full h-full object-cover"
          />
        </div>
        
        {showUploadButton && (
          <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity rounded-full group ${
            user?.isOAuthUser ? 'opacity-20 hover:opacity-100' : 'opacity-0 hover:opacity-100'
          }`}>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg"
                disabled={isUploading}
                asChild
                title="Change profile picture"
              >
                <label className="cursor-pointer m-0 p-0 flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
              </Button>
              
              {user?.avatar && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
                  disabled={isUploading}
                  onClick={handleRemoveAvatar}
                  title="Remove profile picture"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fallback to initials
  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center`}>
        <span className={`font-medium text-primary ${
          size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-xl"
        }`}>
          {getInitials(user?.name || "User")}
        </span>
      </div>
      
      {showUploadButton && (
        <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity rounded-full group ${
          user?.isOAuthUser ? 'opacity-20 hover:opacity-100' : 'opacity-0 hover:opacity-100'
        }`}>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg"
              disabled={isUploading}
              asChild
              title="Change profile picture"
            >
              <label className="cursor-pointer m-0 p-0 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
            </Button>
            
            {user?.avatar && (
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
                disabled={isUploading}
                onClick={handleRemoveAvatar}
                title="Remove profile picture"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 