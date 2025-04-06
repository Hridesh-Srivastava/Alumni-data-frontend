import axios from "axios"

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
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
  }
)

// Function to check if backend is available
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
    
    // Try multiple endpoints with both localhost and 127.0.0.1
    const endpoints = [
      `${API_URL}/auth/health`,
      `${API_URL.replace("/api", "")}/health`,
      API_URL.replace("localhost", "127.0.0.1").replace("/api", "/health"),
      API_URL.replace("localhost", "127.0.0.1"),
      "http://127.0.0.1:5001/health",
      "http://127.0.0.1:5001/api/auth/health",
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 3000, // Shorter timeout for faster checks
        })
        if (response.status === 200) {
          return true
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }

    // All attempts failed
    return false
  } catch (error) {
    console.warn("Backend connectivity check failed:", error)
    return false
  }
}

// Export the api instance as default
export default api