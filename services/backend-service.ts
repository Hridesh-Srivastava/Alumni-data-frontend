import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: false, // Changed to false to avoid CORS preflight issues
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

// Check if backend is running - simplified to avoid CORS issues
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    // Use axios instead of fetch for consistent error handling
    const response = await axios.get(`${API_URL.replace("/api", "")}`, {
      timeout: 5000,
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
      },
    })
    return response.status === 200
  } catch (error) {
    console.warn("Backend connectivity check failed:", error)
    return false
  }
}

// Export the API instance
export default api

