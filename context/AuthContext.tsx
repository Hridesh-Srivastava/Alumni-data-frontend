"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import axios from "axios"

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

      const response = await axios.post(`${API_URL}/auth/login`, { email, password })

      // Extract user data and token
      const userData = response.data
      const authToken = userData.token

      // Remove token from user object to avoid duplication
      const { token: _, ...userWithoutToken } = userData

      setUser(userWithoutToken)
      setToken(authToken)

      localStorage.setItem("user", JSON.stringify(userWithoutToken))
      localStorage.setItem("token", authToken)

      toast.success("Logged in successfully")
      return
    } catch (error) {
      console.error("Login error:", error)

      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Invalid email or password")
      } else {
        toast.error("Login failed. Please try again.")
      }

      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password })

      // Extract user data and token
      const userData = response.data
      const authToken = userData.token

      // Remove token from user object to avoid duplication
      const { token: _, ...userWithoutToken } = userData

      setUser(userWithoutToken)
      setToken(authToken)

      localStorage.setItem("user", JSON.stringify(userWithoutToken))
      localStorage.setItem("token", authToken)

      // Only show one toast notification
      toast.success("Registration successful")
      return
    } catch (error) {
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

    toast.success("Logged out successfully")
  }

  const updateProfile = async (userData: any) => {
    try {
      if (!token) {
        throw new Error("Authentication required. Please log in again.")
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

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

  const updateSettings = async (settings: any) => {
    try {
      if (!token) {
        throw new Error("Authentication required. Please log in again.")
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

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
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

