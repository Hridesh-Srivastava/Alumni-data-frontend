"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  updateUserProfile,
  updateUserSettings,
} from "@/services/auth-service"
import { checkBackendStatus } from "@/services/utils-service"

interface User {
  _id: string
  name: string
  email: string
  role: string
  token?: string
  settings?: {
    notifications?: {
      email?: boolean
      browser?: boolean
    }
    privacy?: {
      showEmail?: boolean
      showProfile?: boolean
    }
    appearance?: {
      theme?: string
      fontSize?: string
    }
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (userData: any) => Promise<void>
  updateSettings: (settings: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  updateSettings: async () => {},
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Check if backend is available before attempting login
      const backendAvailable = await checkBackendStatus()

      const response = await loginApi(email, password)
      setUser(response)
      setToken(response.token)

      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      toast.success(`${backendAvailable ? "" : "[Development Mode] "}Logged in successfully`)
      return response
    } catch (error) {
      console.error("Login error:", error)

      if (error instanceof Error) {
        toast.error("Login failed", {
          description: error.message,
        })
      } else {
        toast.error("Login failed", {
          description: "An unexpected error occurred",
        })
      }

      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await registerApi(name, email, password)

      setUser(response)
      setToken(response.token)

      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      toast.success("Registration successful")
      return response
    } catch (error) {
      console.error("Register error:", error)

      if (error instanceof Error) {
        toast.error("Registration failed", {
          description: error.message,
        })
      } else {
        toast.error("Registration failed", {
          description: "An unexpected error occurred",
        })
      }

      throw error
    }
  }

  const logout = () => {
    try {
      // Call logout API (this is now handled in auth-service.ts)
      logoutApi()

      // Clear state
      setUser(null)
      setToken(null)

      toast.success("Logged out successfully")

      // Force page reload to clear any in-memory state
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)

      // Even if there's an error, we should still clear the local state
      setUser(null)
      setToken(null)

      // Force page reload to clear any in-memory state
      window.location.href = "/"
    }
  }

  const updateProfile = async (userData: any) => {
    try {
      // If updating password, send both new password and current password
      if (userData.password && !userData.currentPassword) {
        throw new Error("Current password is required to change password")
      }

      const response = await updateUserProfile(userData)
      setUser(response)

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response))

      // Update token if a new one is returned
      if (response.token) {
        setToken(response.token)
        localStorage.setItem("token", response.token)
      }

      const backendAvailable = await checkBackendStatus()
      toast.success(`${backendAvailable ? "" : "[Development Mode] "}Profile updated successfully`)
      return response
    } catch (error) {
      console.error("Update profile error:", error)

      if (error instanceof Error) {
        toast.error("Failed to update profile", {
          description: error.message,
        })
      } else {
        toast.error("Failed to update profile", {
          description: "An unexpected error occurred",
        })
      }

      throw error
    }
  }

  const updateSettings = async (settings: any) => {
    try {
      const response = await updateUserSettings(settings)

      // Update user with new settings
      if (user) {
        const updatedUser = {
          ...user,
          settings: response.settings,
        }

        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      toast.success("Settings updated successfully")
      return response
    } catch (error) {
      console.error("Update settings error:", error)

      if (error instanceof Error) {
        toast.error("Failed to update settings", {
          description: error.message,
        })
      } else {
        toast.error("Failed to update settings", {
          description: "An unexpected error occurred",
        })
      }

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

