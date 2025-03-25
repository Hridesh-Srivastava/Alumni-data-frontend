import api, { checkBackendStatus } from "./backend-service"
import axios from "axios"

// Get stored alumni from localStorage or initialize with empty array
const getStoredAlumni = () => {
  try {
    const storedAlumni = localStorage.getItem("mockAlumni")
    if (storedAlumni) {
      return JSON.parse(storedAlumni)
    }
  } catch (error) {
    console.error("Error parsing stored alumni:", error)
  }

  // Return empty array instead of default mock data
  return []
}

// Save alumni to localStorage
const saveAlumniToLocalStorage = (alumni) => {
  try {
    localStorage.setItem("mockAlumni", JSON.stringify(alumni))
  } catch (error) {
    console.error("Error saving alumni to localStorage:", error)
  }
}

interface AlumniFilter {
  page?: number
  limit?: number
  academicUnit?: string
  passingYear?: string
  program?: string
}

export const getAlumni = async (filter: AlumniFilter = {}) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const { page = 1, limit = 10, academicUnit, passingYear, program } = filter

      let url = `/alumni?page=${page}&limit=${limit}`

      if (academicUnit && academicUnit !== "all") {
        url += `&academicUnit=${encodeURIComponent(academicUnit)}`
      }

      if (passingYear && passingYear !== "all") {
        url += `&passingYear=${encodeURIComponent(passingYear)}`
      }

      if (program) {
        url += `&program=${encodeURIComponent(program)}`
      }

      const response = await api.get(url)

      // Also update localStorage with the real data for offline access
      if (response.data && response.data.data) {
        saveAlumniToLocalStorage(response.data.data)
      }

      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock alumni data")

      const { page = 1, limit = 10, academicUnit, passingYear, program } = filter

      // Get stored alumni
      const mockAlumni = getStoredAlumni()

      // Filter mock data based on criteria
      let filteredAlumni = [...mockAlumni]

      if (academicUnit && academicUnit !== "all") {
        filteredAlumni = filteredAlumni.filter((a) => a.academicUnit === academicUnit)
      }

      if (passingYear && passingYear !== "all") {
        filteredAlumni = filteredAlumni.filter((a) => a.passingYear === passingYear)
      }

      if (program) {
        filteredAlumni = filteredAlumni.filter((a) => a.program.toLowerCase().includes(program.toLowerCase()))
      }

      // Sort by creation date (newest first)
      filteredAlumni.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

      // Paginate results
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const paginatedAlumni = filteredAlumni.slice(startIndex, endIndex)

      return {
        data: paginatedAlumni,
        pagination: {
          total: filteredAlumni.length,
          page,
          limit,
          totalPages: Math.ceil(filteredAlumni.length / limit),
        },
      }
    }
  } catch (error) {
    console.error("Error fetching alumni:", error)

    // Fallback to localStorage
    const mockAlumni = getStoredAlumni()

    return {
      data: mockAlumni,
      pagination: {
        total: mockAlumni.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(mockAlumni.length / 10),
      },
    }
  }
}

export const getAlumniById = async (id) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.get(`/alumni/${id}`)
      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock alumni data")

      const mockAlumni = getStoredAlumni()
      const alumni = mockAlumni.find((a) => a._id === id)

      if (!alumni) {
        throw new Error("Alumni not found")
      }

      return alumni
    }
  } catch (error) {
    console.error("Error fetching alumni details:", error)
    throw error
  }
}

export const createAlumni = async (alumniData) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      try {
        // Log the data being sent to help debug
        console.log("Sending alumni data to backend:", alumniData)

        // Make sure all required fields are present
        const requiredFields = ["name", "academicUnit", "program", "passingYear", "registrationNumber"]
        for (const field of requiredFields) {
          if (!alumniData[field]) {
            throw new Error(`Missing required field: ${field}`)
          }
        }

        // Ensure contactDetails is an object
        if (!alumniData.contactDetails) {
          alumniData.contactDetails = {}
        }

        // Get the API URL and token
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("Authentication required. Please log in again.")
        }

        // Use direct axios call to avoid potential issues with the api instance
        const response = await axios.post(`${API_URL}/alumni`, alumniData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Alumni created successfully:", response.data)

        // Also store in localStorage for development convenience
        addAlumniToLocalStorage(response.data)

        return response.data
      } catch (error) {
        console.error("Error creating alumni:", error)

        // Provide more detailed error information
        if (axios.isAxiosError(error) && error.response) {
          console.error("Server response:", error.response.data)
          throw new Error(error.response.data.message || "Failed to create alumni")
        }

        // Fallback to localStorage in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Falling back to localStorage for alumni creation")
          return createAlumniInLocalStorage(alumniData)
        }

        throw error
      }
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Creating alumni in localStorage only")
      return createAlumniInLocalStorage(alumniData)
    }
  } catch (error) {
    console.error("Error creating alumni:", error)
    throw error
  }
}

// Helper function to create alumni in localStorage
function createAlumniInLocalStorage(alumniData) {
  const mockAlumni = getStoredAlumni()

  // Check if registration number already exists
  if (mockAlumni.some((a) => a.registrationNumber === alumniData.registrationNumber)) {
    throw new Error("Alumni with this registration number already exists")
  }

  // Create new alumni with ID
  const newAlumni = {
    _id: Math.random().toString(36).substring(2, 9),
    ...alumniData,
    createdAt: new Date().toISOString(),
  }

  // Add to mock alumni
  mockAlumni.push(newAlumni)
  saveAlumniToLocalStorage(mockAlumni)

  return newAlumni
}

// Helper function to add alumni to localStorage
function addAlumniToLocalStorage(alumniData) {
  try {
    const mockAlumni = getStoredAlumni()
    mockAlumni.push({
      ...alumniData,
      createdAt: alumniData.createdAt || new Date().toISOString(),
    })
    saveAlumniToLocalStorage(mockAlumni)
  } catch (error) {
    console.error("Error adding alumni to localStorage:", error)
  }
}

export const updateAlumni = async (id, alumniData) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.put(`/alumni/${id}`, alumniData)

      // Also update in localStorage for development convenience
      const mockAlumni = getStoredAlumni()
      const index = mockAlumni.findIndex((a) => a._id === id)

      if (index !== -1) {
        mockAlumni[index] = {
          ...mockAlumni[index],
          ...response.data,
          updatedAt: new Date().toISOString(),
        }
        saveAlumniToLocalStorage(mockAlumni)
      }

      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Updating alumni in localStorage only")

      const mockAlumni = getStoredAlumni()
      const index = mockAlumni.findIndex((a) => a._id === id)

      if (index === -1) {
        throw new Error("Alumni not found")
      }

      // Check if registration number already exists with another alumni
      if (
        alumniData.registrationNumber &&
        mockAlumni.some((a) => a.registrationNumber === alumniData.registrationNumber && a._id !== id)
      ) {
        throw new Error("Alumni with this registration number already exists")
      }

      // Update alumni
      const updatedAlumni = {
        ...mockAlumni[index],
        ...alumniData,
        updatedAt: new Date().toISOString(),
      }

      mockAlumni[index] = updatedAlumni
      saveAlumniToLocalStorage(mockAlumni)

      return updatedAlumni
    }
  } catch (error) {
    console.error("Error updating alumni:", error)
    throw error
  }
}

export const deleteAlumni = async (id) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.delete(`/alumni/${id}`)

      // Also delete from localStorage for development convenience
      const mockAlumni = getStoredAlumni()
      const filteredAlumni = mockAlumni.filter((a) => a._id !== id)
      saveAlumniToLocalStorage(filteredAlumni)

      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Deleting alumni from localStorage only")

      const mockAlumni = getStoredAlumni()
      const filteredAlumni = mockAlumni.filter((a) => a._id !== id)

      if (filteredAlumni.length === mockAlumni.length) {
        throw new Error("Alumni not found")
      }

      saveAlumniToLocalStorage(filteredAlumni)

      // Return mock response
      return {
        message: "Alumni removed successfully",
      }
    }
  } catch (error) {
    console.error("Error deleting alumni:", error)
    throw error
  }
}

export const searchAlumni = async (query, academicUnit) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      let url = `/alumni/search?query=${encodeURIComponent(query)}`

      if (academicUnit && academicUnit !== "all") {
        url += `&academicUnit=${encodeURIComponent(academicUnit)}`
      }

      const response = await api.get(url)
      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Searching alumni in localStorage")

      const mockAlumni = getStoredAlumni()
      let filteredAlumni = [...mockAlumni]

      // Filter by search query
      if (query) {
        filteredAlumni = filteredAlumni.filter(
          (a) =>
            a.name?.toLowerCase().includes(query.toLowerCase()) ||
            a.registrationNumber?.toLowerCase().includes(query.toLowerCase()) ||
            a.program?.toLowerCase().includes(query.toLowerCase()),
        )
      }

      // Filter by academic unit
      if (academicUnit && academicUnit !== "all") {
        filteredAlumni = filteredAlumni.filter((a) => a.academicUnit === academicUnit)
      }

      return filteredAlumni
    }
  } catch (error) {
    console.error("Error searching alumni:", error)
    throw error
  }
}

export const getStats = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      console.log("Fetching stats from backend API")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

      // Use direct axios call to avoid potential issues
      const response = await axios.get(`${API_URL}/alumni/stats`)
      console.log("Stats received from backend:", response.data)
      return response.data
    } else {
      // Backend is not available, generate stats from localStorage
      console.log("Backend unavailable: Generating stats from localStorage")

      const mockAlumni = getStoredAlumni()

      // Calculate real stats based on mock data
      const totalAlumni = mockAlumni.length

      // Count by academic unit
      const byAcademicUnit = {}
      mockAlumni.forEach((alumni) => {
        if (alumni.academicUnit) {
          byAcademicUnit[alumni.academicUnit] = (byAcademicUnit[alumni.academicUnit] || 0) + 1
        }
      })

      // Count by passing year
      const byPassingYear = {}
      mockAlumni.forEach((alumni) => {
        if (alumni.passingYear) {
          byPassingYear[alumni.passingYear] = (byPassingYear[alumni.passingYear] || 0) + 1
        }
      })

      // Count employment status
      let employedCount = 0
      mockAlumni.forEach((alumni) => {
        if (alumni.employment && alumni.employment.type === "Employed") {
          employedCount++
        }
      })
      const employmentRate = totalAlumni > 0 ? Math.round((employedCount / totalAlumni) * 100) : 0

      // Count higher education
      let higherEducationCount = 0
      mockAlumni.forEach((alumni) => {
        if (alumni.higherEducation && alumni.higherEducation.institutionName) {
          higherEducationCount++
        }
      })
      const higherEducationRate = totalAlumni > 0 ? Math.round((higherEducationCount / totalAlumni) * 100) : 0

      return {
        totalAlumni,
        byAcademicUnit,
        byPassingYear,
        employmentRate,
        higherEducationRate,
      }
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)

    // Generate basic stats as fallback
    const mockAlumni = getStoredAlumni()

    return {
      totalAlumni: mockAlumni.length,
      byAcademicUnit: {},
      byPassingYear: {},
      employmentRate: 0,
      higherEducationRate: 0,
    }
  }
}

