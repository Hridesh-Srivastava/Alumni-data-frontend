import axios from "axios"

// Try using 127.0.0.1 instead of localhost to avoid potential DNS issues
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

console.log("Using API URL:", API_URL)

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401) {
        console.log("Unauthorized access detected, redirecting to login")
        // Clear auth data
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }

      // Log the error for debugging
      console.error("API Error:", error.response?.data || error.message)
    }
    return Promise.reject(error)
  },
)

// Check if backend is running - try multiple approaches
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    // Try multiple endpoints with both localhost and 127.0.0.1
    const endpoints = [
      `${API_URL}/auth/health`,
      `${API_URL.replace("/api", "")}/health`,
      API_URL.replace("localhost", "127.0.0.1").replace("/api", "/health"),
      API_URL.replace("localhost", "127.0.0.1"),
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to connect to: ${endpoint}`)
        const response = await axios.get(endpoint, {
          timeout: 3000,
        })
        if (response.status === 200) {
          console.log(`Successfully connected to: ${endpoint}`)
          return true
        }
      } catch (err) {
        console.log(`Failed to connect to: ${endpoint}`)
        // Continue to next endpoint
      }
    }

    // All attempts failed
    console.warn("All backend connectivity checks failed")
    return false
  } catch (error) {
    console.warn("Backend connectivity check failed:", error)
    return false
  }
}

// Export the API instance
export default api

