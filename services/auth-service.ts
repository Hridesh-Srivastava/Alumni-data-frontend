import axios from "axios"

const isBackendAvailable = process.env.NEXT_PUBLIC_BACKEND_AVAILABLE === "true"

// Function to register a new user
export const registerUser = async (userData: any) => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      })
      return response.data
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    }
  } else {
    // No backend, use mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          message: "User registered successfully (mock)",
          user: {
            id: "mockUserId",
            email: userData.email,
            username: userData.username,
          },
        }
        resolve(mockResponse)
      }, 500)
    })
  }
}

// Function to log in an existing user
export const loginUser = async (credentials: any) => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    try {
      // Ensure email is lowercase for consistency
      const loginData = {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      }

      const response = await axios.post(`${API_URL}/auth/login`, loginData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      })

      // Store the token in localStorage
      localStorage.setItem("token", response.data.token)

      // Store the user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data))

      return response.data
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    }
  } else {
    // No backend, use mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          message: "User logged in successfully (mock)",
          token: "mockToken",
          user: {
            id: "mockUserId",
            email: credentials.email,
            username: "mockUser",
            settings: {
              theme: "light",
              notificationsEnabled: true,
            },
          },
        }

        // Store mock data in localStorage
        localStorage.setItem("token", mockResponse.token)
        localStorage.setItem("user", JSON.stringify(mockResponse.user))

        resolve(mockResponse)
      }, 500)
    })
  }
}

// Function to request a password reset
export const requestPasswordReset = async (email: string) => {
  if (isBackendAvailable) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    try {
      console.log(`Sending password reset request to ${API_URL}/auth/forgot-password for email: ${email}`)

      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        { email: email.toLowerCase().trim() }, // Simplify the request payload
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000, // Increased timeout to 15 seconds
          withCredentials: false,
        },
      )

      console.log("Password reset response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Forgot password error details:", error)

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)
        console.error("Error response headers:", error.response.headers)
        throw error.response.data?.message || "Failed to request password reset"
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request)
        throw "No response from server. Please check your connection."
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message)
        throw error.message || "Failed to request password reset"
      }
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock password reset request for email: ${email}`)
        resolve({ message: "Password reset instructions sent to your email (mock)" })
      }, 500)
    })
  }
}

// Function to reset password with token
export const resetPassword = async (token: string, newPassword: string) => {
  if (isBackendAvailable) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    try {
      console.log(`Sending password reset with token to ${API_URL}/auth/reset-password`)

      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        { token, newPassword }, // Use token parameter name to match backend
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
          withCredentials: false,
        },
      )

      console.log("Reset password response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Reset password error details:", error)

      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)
        throw error.response.data?.message || "Failed to reset password"
      } else if (error.request) {
        console.error("No response received:", error.request)
        throw "No response from server. Please check your connection."
      } else {
        console.error("Error message:", error.message)
        throw error.message || "Failed to reset password"
      }
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock password reset with token: ${token}`)
        resolve({ message: "Password reset successful (mock)" })
      }, 500)
    })
  }
}

// Function to log out the user
export const logoutUser = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

// Function to get the user profile
export const getUserProfile = async () => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("Authentication required. Please log in again.")
    }

    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 seconds timeout
      })
      return response.data
    } catch (error: any) {
      console.error("Get profile error:", error)
      // If token is invalid, remove it
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      throw error
    }
  } else {
    // No backend, use mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUser = localStorage.getItem("user")
        const mockResponse = storedUser
          ? JSON.parse(storedUser)
          : {
              id: "mockUserId",
              email: "mock@example.com",
              username: "mockUser",
              settings: {
                theme: "light",
                notificationsEnabled: true,
              },
            }
        resolve(mockResponse)
      }, 500)
    })
  }
}

// Function to update the user profile
export const updateUserProfile = async (userData: any) => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("Authentication required. Please log in again.")
    }

    try {
      const response = await axios({
        method: "put",
        url: `${API_URL}/auth/profile`,
        data: userData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 seconds timeout
      })

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.data.user))

      return response.data
    } catch (error: any) {
      console.error("Update profile error:", error)
      throw error
    }
  } else {
    // No backend, use mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const updatedUser = { ...user, ...userData }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          resolve(updatedUser)
        } else {
          const mockResponse = {
            id: "mockUserId",
            email: "mock@example.com",
            username: "mockUser",
            ...userData,
            settings: {
              theme: "light",
              notificationsEnabled: true,
            },
          }
          localStorage.setItem("user", JSON.stringify(mockResponse))
          resolve(mockResponse)
        }
      }, 500)
    })
  }
}

// Function to update the user password
export const updatePassword = async (passwords: any) => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("Authentication required. Please log in again.")
    }

    try {
      const response = await axios({
        method: "put",
        url: `${API_URL}/auth/password`,
        data: passwords,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 seconds timeout
      })
      return response.data
    } catch (error: any) {
      console.error("Update password error:", error)
      throw error
    }
  } else {
    // No backend, use mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (passwords.newPassword === "success") {
          const mockResponse = { message: "Password updated successfully (mock)" }
          resolve(mockResponse)
        } else {
          reject("Mock error: Invalid new password")
        }
      }, 500)
    })
  }
}

// Function to update user settings
export const updateUserSettings = async (settings: any) => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("Authentication required. Please log in again.")
    }

    try {
      const response = await axios({
        method: "put",
        url: `${API_URL}/auth/settings`,
        data: { settings },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 seconds timeout
      })

      console.log("Settings update response:", response.data)

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
    } catch (error) {
      console.error("Settings update error:", error)

      // For development mode, still update local storage even if API fails
      if (process.env.NODE_ENV === "development") {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          // Deep merge settings
          const updatedUser = {
            ...user,
            settings: {
              ...user.settings,
              ...settings,
            },
          }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          return { settings: updatedUser.settings }
        }
      }

      throw error
    }
  } else {
    // No backend, use mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const updatedUser = {
            ...user,
            settings: { ...user.settings, ...settings },
          }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          resolve({ settings: updatedUser.settings })
        } else {
          const mockResponse = {
            settings: { ...settings },
          }
          resolve(mockResponse)
        }
      }, 500)
    })
  }
}
