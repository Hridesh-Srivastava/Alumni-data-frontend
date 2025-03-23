import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Include credentials for CORS
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

// Check if backend is running
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    // Use a simple HEAD request to check if the server is running
    const response = await fetch(`${API_URL}`, {
      method: "HEAD",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include credentials for CORS
      signal: AbortSignal.timeout(5000), // Increased timeout
    })
    return response.ok
  } catch (error) {
    console.warn("Backend connectivity check failed:", error)
    return false
  }
}

// Export the API instance
export default api

