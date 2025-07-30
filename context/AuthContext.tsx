"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  name: string
  email: string
  role: string
  avatar?: string
  isOAuthUser?: boolean
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
  updateAvatar: (newAvatarUrl: string) => Promise<void>
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
  updateAvatar: async () => {},
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
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken && storedUser !== "undefined" && storedToken !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser)
        
        if (parsedUser && typeof parsedUser === "object" && parsedUser._id) {
          setUser(parsedUser)
          setToken(storedToken)
        } else {
          throw new Error("Invalid user data structure")
        }
      } catch (error) {
        console.error("Error parsing stored user:", error)
        // Clear invalid data
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

      if (process.env.NODE_ENV === 'development') {
        console.log("Attempting login with:", { email, url: `${API_URL}/auth/login` })
      }

      // Ensure email is lowercase and trimmed
      const loginData = {
        email: email.toLowerCase().trim(),
        password: password,
      }

      const response = await axios.post(`${API_URL}/auth/login`, loginData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      })

      if (process.env.NODE_ENV === 'development') {
        console.log("Login response:", response.data)
      }

      // Extract user data and token
      const userData = response.data
      const authToken = userData.token

      // Store the token in localStorage
      localStorage.setItem("token", authToken)

      // Also set the token in cookies for middleware
      document.cookie = `token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`

      // Store the user data in localStorage (without duplicating the token)
      const { token: _, ...userWithoutToken } = userData
      localStorage.setItem("user", JSON.stringify(userWithoutToken))

      // Update state
      setUser(userWithoutToken)
      setToken(authToken)

      toast.success("Logged in successfully")
      return
    } catch (error: any) {
      console.error("Login error:", error)

      // Log detailed error information for debugging
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        })

        if (error.response?.data?.message) {
          toast.error(error.response.data.message)
        } else {
          toast.error("Login failed. Please check your credentials and try again.")
        }
      } else {
        toast.error("Login failed. Please try again.")
      }

      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

      if (process.env.NODE_ENV === 'development') {
        console.log("Attempting registration with:", { name, email, url: `${API_URL}/auth/register` })
      }

      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email: email.toLowerCase().trim(),
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 seconds timeout
        },
      )

      if (process.env.NODE_ENV === 'development') {
        console.log("Registration response:", response.data)
      }

      // Extract user data and token
      const userData = response.data
      const authToken = userData.token

      // Store the token in localStorage
      localStorage.setItem("token", authToken)

      // Also set the token in cookies for middleware
      document.cookie = `token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`

      // Store the user data in localStorage (without duplicating the token)
      const { token: _, ...userWithoutToken } = userData
      localStorage.setItem("user", JSON.stringify(userWithoutToken))

      // Update state
      setUser(userWithoutToken)
      setToken(authToken)

      // Only show one toast notification
      toast.success("Registration successful")
      return
    } catch (error: any) {
      console.error("Register error:", error)

      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Registration failed")
      } else {
        toast.error("Registration failed. Please try again.")
      }

      throw error
    }
  }

  const logout = () => {
    // Clear state
    setUser(null)
    setToken(null)

    // Clear localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    toast.success("Logged out successfully")

    // Redirect to login page
    router.push("/login")
  }

  const updateProfile = async (userData: any) => {
    try {
      if (!token) {
        throw new Error("Authentication required. Please log in again.")
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

      const response = await axios.put(`${API_URL}/auth/profile`, userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      // Extract updated user data and possibly new token
      const updatedUserData = response.data
      const newToken = updatedUserData.token || token

      // Remove token from user object to avoid duplication
      const { token: _, ...userWithoutToken } = updatedUserData

      setUser(userWithoutToken)
      setToken(newToken)

      localStorage.setItem("user", JSON.stringify(userWithoutToken))
      localStorage.setItem("token", newToken)

      // Update cookie token if it changed
      if (newToken !== token) {
        document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
      }

      toast.success("Profile updated successfully")
      return
    } catch (error) {
      console.error("Update profile error:", error)

      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to update profile")
      } else {
        toast.error("Failed to update profile")
      }

      throw error
    }
  }

  const updateAvatar = async (newAvatarUrl: string) => {
    try {
      if (!user) {
        throw new Error("User not found")
      }

      // Update local user state immediately for better UX
      const updatedUser = { ...user, avatar: newAvatarUrl }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Update avatar error:", error)
      toast.error("Failed to update avatar")
    }
  }

  const updateSettings = async (settings: any) => {
    try {
      if (!token) {
        throw new Error("Authentication required. Please log in again.")
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

      // Fix: Properly structure the settings object
      const response = await axios.put(
        `${API_URL}/auth/settings`,
        { settings },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update user with new settings
      if (user) {
        const updatedUser = {
          ...user,
          settings: response.data.settings,
        }

        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      toast.success("Settings updated successfully")
      return response.data
    } catch (error) {
      console.error("Update settings error:", error)

      // Even if API call fails, update local state for better UX
      if (process.env.NODE_ENV === "development" && user) {
        // Deep merge settings
        const updatedUser = {
          ...user,
          settings: {
            ...user.settings,
            ...settings,
          },
        }

        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))

        // Show warning instead of error
        toast.warning("Settings saved locally (backend unavailable)")
        return { settings: updatedUser.settings }
      }

      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to update settings")
      } else {
        toast.error("Failed to update settings")
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
        updateAvatar,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
