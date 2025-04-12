import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Check if backend is available
export const checkBackendStatus = async () => {
  // If we're in development and NEXT_PUBLIC_BACKEND_AVAILABLE is set to false, return false
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_BACKEND_AVAILABLE === "false") {
    return false
  }

  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    console.log("Backend health check failed:", error)
    return false
  }
}

export default api