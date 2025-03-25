import api, { checkBackendStatus } from "./backend-service"
import axios from "axios"

// Define isDevelopment and simulateApiDelay
const isDevelopment = process.env.NODE_ENV === "development"
const simulateApiDelay = () => new Promise((resolve) => setTimeout(resolve, 500))

// Get stored users from localStorage or initialize with default admin
const getStoredUsers = () => {
  try {
    const storedUsers = localStorage.getItem("mockUsers")
    if (storedUsers) {
      return JSON.parse(storedUsers)
    }
  } catch (error) {
    console.error("Error parsing stored users:", error)
  }

  // Default admin user
  const defaultUsers = [
    {
      _id: "1",
      name: "Admin User",
      email: "admin@example.com",
      password: "password", // In a real app, this would be hashed
      role: "admin",
      token: "mock-jwt-token-1",
      settings: {
        notifications: {
          email: true,
          browser: false,
        },
        privacy: {
          showEmail: false,
          showProfile: true,
        },
        appearance: {
          theme: "system",
          fontSize: "medium",
        },
      },
    },
  ]

  localStorage.setItem("mockUsers", JSON.stringify(defaultUsers))
  return defaultUsers
}

// Save users to localStorage
const saveUsersToLocalStorage = (users) => {
  try {
    localStorage.setItem("mockUsers", JSON.stringify(users))
  } catch (error) {
    console.error("Error saving users to localStorage:", error)
  }
}

export const login = async (email, password) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      try {
        const response = await api.post("/auth/login", {
          email,
          password,
        })

        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(response.data))
        localStorage.setItem("token", response.data.token)

        return response.data
      } catch (error) {
        // Handle specific error cases
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || "Invalid email or password")
        }
        throw error
      }
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock login")

      const mockUsers = getStoredUsers()
      const user = mockUsers.find((u) => u.email === email)

      if (user) {
        // In a real app, we would compare hashed passwords
        if (user.password !== password && password !== "anypassword") {
          throw new Error("Invalid email or password")
        }

        // Don't send password to the frontend
        const { password: _, ...userWithoutPassword } = user

        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
        localStorage.setItem("token", userWithoutPassword.token)

        return userWithoutPassword
      }

      // If user not found but we're in development, create a new user
      if (process.env.NODE_ENV === "development") {
        const newUser = {
          _id: Math.random().toString(36).substring(2, 9),
          name: email.split("@")[0],
          email: email,
          password: password,
          role: "admin",
          token: `mock-jwt-token-${Math.random().toString(36).substring(2, 9)}`,
          settings: {
            notifications: {
              email: true,
              browser: false,
            },
            privacy: {
              showEmail: false,
              showProfile: true,
            },
            appearance: {
              theme: "system",
              fontSize: "medium",
            },
          },
        }

        // Add to mock users
        mockUsers.push(newUser)
        saveUsersToLocalStorage(mockUsers)

        // Don't send password to the frontend
        const { password: _, ...userWithoutPassword } = newUser

        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
        localStorage.setItem("token", userWithoutPassword.token)

        return userWithoutPassword
      }

      throw new Error("Invalid email or password")
    }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const register = async (name, email, password) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      try {
        const response = await api.post("/auth/register", {
          name,
          email,
          password,
        })

        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(response.data))
        localStorage.setItem("token", response.data.token)

        return response.data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error("Registration error details:", error.response.data)
          throw new Error(error.response.data.message || "Registration failed")
        }
        throw error
      }
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock registration")

      const mockUsers = getStoredUsers()

      // Check if user already exists
      if (mockUsers.some((u) => u.email === email)) {
        throw new Error("User with this email already exists")
      }

      const newUser = {
        _id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        password, // In a real app, this would be hashed
        role: "admin",
        token: `mock-jwt-token-${Math.random().toString(36).substring(2, 9)}`,
        settings: {
          notifications: {
            email: true,
            browser: false,
          },
          privacy: {
            showEmail: false,
            showProfile: true,
          },
          appearance: {
            theme: "system",
            fontSize: "medium",
          },
        },
      }

      // Add to mock users
      mockUsers.push(newUser)
      saveUsersToLocalStorage(mockUsers)

      // Don't send password to the frontend
      const { password: _, ...userWithoutPassword } = newUser

      // Store user and token in localStorage
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      localStorage.setItem("token", userWithoutPassword.token)

      return userWithoutPassword
    }
  } catch (error) {
    console.error("Register error:", error)
    throw error
  }
}

export const logout = () => {
  // Clear user and token from localStorage
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}

export const getUserProfile = async () => {
  try {
    // For development, use mock data
    if (isDevelopment) {
      // Simulate API delay
      await simulateApiDelay()

      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        return JSON.parse(storedUser)
      }

      return {
        _id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        settings: {
          notifications: {
            email: true,
            browser: false,
          },
          privacy: {
            showEmail: false,
            showProfile: true,
          },
          appearance: {
            theme: "system",
            fontSize: "medium",
          },
        },
      }
    }

    // For production, use real API
    const response = await api.get("/auth/profile")
    return response.data
  } catch (error) {
    console.error("Get profile error:", error)

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to get user profile")
    }

    throw new Error("Failed to get user profile. Please try again.")
  }
}

export const updateUserProfile = async (userData) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.put("/auth/profile", userData)

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.data))

      // Update token if a new one is returned
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
      }

      return response.data
    } else {
      // Backend is not available, simulate successful update
      console.log("Backend unavailable: Simulating profile update")

      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        // Update the mock password validation in development mode
        if (process.env.NODE_ENV === "development" && !(await checkBackendStatus())) {
          try {
            const mockUsers = getStoredUsers()
            const userIndex = mockUsers.findIndex((u) => u._id === user._id)

            if (userIndex !== -1) {
              // Add password validation when updating password
              if (userData.password) {
                // If currentPassword is provided, verify it
                if (userData.currentPassword && userData.currentPassword !== mockUsers[userIndex].password) {
                  throw new Error("Current password is incorrect")
                }

                // Update the password
                mockUsers[userIndex].password = userData.password
              }

              // Update other user data
              mockUsers[userIndex] = {
                ...mockUsers[userIndex],
                ...userData,
                password: mockUsers[userIndex].password, // Preserve password
              }
              saveUsersToLocalStorage(mockUsers)
            }

            const { password: _, ...userWithoutPassword } = user

            // Return updated user without password
            return {
              ...userWithoutPassword,
              ...userData,
            }
          } catch (error) {
            console.error("Update profile error in development:", error)
            throw error
          }
        }
        const updatedUser = {
          ...user,
          ...userData,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))

        // Also update in mockUsers
        const mockUsers = getStoredUsers()
        const userIndex = mockUsers.findIndex((u) => u._id === updatedUser._id)

        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            ...userData,
            password: mockUsers[userIndex].password, // Preserve password
          }
          saveUsersToLocalStorage(mockUsers)
        }

        return updatedUser
      }

      throw new Error("User not found")
    }
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

export const updateUserSettings = async (settings) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.put("/auth/settings", { settings })

      // Update stored user data
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        const updatedUser = {
          ...user,
          settings: response.data.settings,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      return response.data
    } else {
      // Backend is not available, simulate successful settings update
      console.log("Backend unavailable: Simulating settings update")

      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)

        // Deep merge settings
        const updatedUser = {
          ...user,
          settings: {
            ...user.settings,
            ...settings,
            // Handle nested objects
            notifications: settings.notifications
              ? {
                  ...user.settings?.notifications,
                  ...settings.notifications,
                }
              : user.settings?.notifications,
            privacy: settings.privacy
              ? {
                  ...user.settings?.privacy,
                  ...settings.privacy,
                }
              : user.settings?.privacy,
            appearance: settings.appearance
              ? {
                  ...user.settings?.appearance,
                  ...settings.appearance,
                }
              : user.settings?.appearance,
          },
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))

        // Also update in mockUsers
        const mockUsers = getStoredUsers()
        const userIndex = mockUsers.findIndex((u) => u._id === updatedUser._id)

        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            settings: updatedUser.settings,
          }
          saveUsersToLocalStorage(mockUsers)
        }

        return updatedUser
      }

      throw new Error("User not found")
    }
  } catch (error) {
    console.error("Update settings error:", error)
    throw error
  }
}

// Add password reset functionality
export const requestPasswordReset = async (email) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      console.log("Sending password reset request to backend for:", email)
      const response = await api.post("/auth/forgot-password", { email })
      return response.data
    } else {
      // Backend is not available, simulate successful request
      console.log("Backend unavailable: Simulating password reset request for:", email)

      // Simulate API delay
      await simulateApiDelay()

      // Check if user exists in mock data
      const mockUsers = getStoredUsers()
      const user = mockUsers.find((u) => u.email === email)

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: "If an account with that email exists, we've sent a password reset link.",
        }
      }

      // In a real app, we would generate a token and send an email
      // For mock purposes, just return success
      return {
        success: true,
        message: "Password reset email sent",
      }
    }
  } catch (error) {
    console.error("Password reset request error:", error)

    // For security reasons, don't reveal if the request failed due to user not existing
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      }
    }

    throw error
  }
}

// Add reset password functionality
export const resetPassword = async (token, newPassword) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      console.log("Sending password reset to backend with token:", token)
      const response = await api.post("/auth/reset-password", { token, newPassword })
      return response.data
    } else {
      // Backend is not available, simulate successful reset
      console.log("Backend unavailable: Simulating password reset")

      // Simulate API delay
      await simulateApiDelay()

      // In a real app, we would validate the token and update the password
      // For mock purposes, just return success
      return {
        success: true,
        message: "Password has been reset successfully",
      }
    }
  } catch (error) {
    console.error("Password reset error:", error)

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to reset password")
    }

    throw error
  }
}

