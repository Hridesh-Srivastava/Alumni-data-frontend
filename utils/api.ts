import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

// Create a reusable axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Alumni API functions
export const getAlumni = async (params = {}) => {
  try {
    const response = await api.get("/alumni", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching alumni:", error)
    throw error
  }
}

export const getAlumniById = async (id) => {
  try {
    const response = await api.get(`/alumni/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching alumni by ID:", error)
    throw error
  }
}

export const createAlumni = async (data) => {
  try {
    const response = await api.post("/alumni", data)
    return response.data
  } catch (error) {
    console.error("Error creating alumni:", error)
    throw error
  }
}

export const updateAlumni = async (id, data) => {
  try {
    const response = await api.put(`/alumni/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating alumni:", error)
    throw error
  }
}

export const deleteAlumni = async (id) => {
  try {
    const response = await api.delete(`/alumni/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting alumni:", error)
    throw error
  }
}

export default api