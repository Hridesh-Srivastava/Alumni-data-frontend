"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import { login as loginApi, register as registerApi } from "@/services/auth-service"

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
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
      // Use the actual API instead of mock data
      const response = await loginApi(email, password)

      setUser(response)
      setToken(response.token)

      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      return response
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      // Use the actual API instead of mock data
      const response = await registerApi(name, email, password)

      setUser(response)
      setToken(response.token)

      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      return response
    } catch (error) {
      console.error("Register error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    toast.success("Logged out successfully")
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

