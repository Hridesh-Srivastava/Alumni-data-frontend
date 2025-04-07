import axios from "axios"

const isBackendAvailable = process.env.NEXT_PUBLIC_BACKEND_AVAILABLE === "true"

// Function to register a new user
export const registerUser = async (userData: any) => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
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

// Function to log out the user
export const logoutUser = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

// Function to get the user profile
export const getUserProfile = async () => {
  if (isBackendAvailable) {
    // Backend is available, use real API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
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

