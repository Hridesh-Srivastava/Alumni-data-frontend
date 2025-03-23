import api, { checkBackendStatus } from "./backend-service"
import axios from "axios"

// Get stored alumni from localStorage or initialize with default data
const getStoredAlumni = () => {
  try {
    const storedAlumni = localStorage.getItem("mockAlumni")
    if (storedAlumni) {
      return JSON.parse(storedAlumni)
    }
  } catch (error) {
    console.error("Error parsing stored alumni:", error)
  }

  // Default alumni data
  const defaultAlumni = [
    {
      _id: "1",
      name: "Ashish Rautela",
      academicUnit: "Himalayan School of Science/Engineering and Technology",
      program: "BCA",
      passingYear: "2021-22",
      registrationNumber: "DD2017304002",
      contactDetails: {
        email: "ashish@example.com",
        phone: "9876543210",
      },
      createdAt: new Date("2023-01-15").toISOString(),
    },
    {
      _id: "2",
      name: "Khushi",
      academicUnit: "Himalayan School of Science/Engineering and Technology",
      program: "BCA",
      passingYear: "2021-22",
      registrationNumber: "DD2017304003",
      contactDetails: {
        email: "khushi@example.com",
        phone: "9876543211",
      },
      createdAt: new Date("2023-02-20").toISOString(),
    },
    {
      _id: "3",
      name: "Manish Semwal",
      academicUnit: "Himalayan School of Science/Engineering and Technology",
      program: "BCA",
      passingYear: "2022-23",
      registrationNumber: "DD2018304001",
      contactDetails: {
        email: "manish@example.com",
        phone: "9876543212",
      },
      createdAt: new Date("2023-03-10").toISOString(),
    },
  ]

  localStorage.setItem("mockAlumni", JSON.stringify(defaultAlumni))
  return defaultAlumni
}

// Save alumni to localStorage
const saveAlumniToLocalStorage = (alumni: any[]) => {
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

export const getAlumni = async (filter: AlumniFilter) => {
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
      filteredAlumni.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

export const getAlumniById = async (id: string) => {
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

export const createAlumni = async (alumniData: any) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      try {
        const response = await api.post("/alumni", alumniData)

        // Also store in localStorage for development convenience
        addAlumniToLocalStorage(response.data)

        return response.data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || "Failed to create alumni")
        }
        throw error
      }
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Creating alumni in localStorage only")

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
  } catch (error) {
    console.error("Error creating alumni:", error)
    throw error
  }
}

// Helper function to add alumni to localStorage
function addAlumniToLocalStorage(alumniData: any) {
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

export const updateAlumni = async (id: string, alumniData: any) => {
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

export const deleteAlumni = async (id: string) => {
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

export const searchAlumni = async (query: string, academicUnit: string | null) => {
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
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.registrationNumber.toLowerCase().includes(query.toLowerCase()) ||
            a.program.toLowerCase().includes(query.toLowerCase()),
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
      const response = await api.get("/alumni/stats")
      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Generating stats from localStorage")

      const mockAlumni = getStoredAlumni()

      // Calculate real stats based on mock data
      const totalAlumni = mockAlumni.length

      // Count by academic unit
      const byAcademicUnit: Record<string, number> = {}
      mockAlumni.forEach((alumni) => {
        byAcademicUnit[alumni.academicUnit] = (byAcademicUnit[alumni.academicUnit] || 0) + 1
      })

      // Count by passing year
      const byPassingYear: Record<string, number> = {}
      mockAlumni.forEach((alumni) => {
        byPassingYear[alumni.passingYear] = (byPassingYear[alumni.passingYear] || 0) + 1
      })

      // Mock employment and higher education rates
      const employmentRate = 85
      const higherEducationRate = 42

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

    // Generate mock stats as fallback
    const mockAlumni = getStoredAlumni()

    return {
      totalAlumni: mockAlumni.length,
      byAcademicUnit: {
        "Himalayan School of Science/Engineering and Technology": mockAlumni.filter(
          (a) => a.academicUnit === "Himalayan School of Science/Engineering and Technology",
        ).length,
        "Himalayan Institute of Medical Sciences (Medical)": mockAlumni.filter(
          (a) => a.academicUnit === "Himalayan Institute of Medical Sciences (Medical)",
        ).length,
      },
      byPassingYear: {
        "2021-22": mockAlumni.filter((a) => a.passingYear === "2021-22").length,
        "2022-23": mockAlumni.filter((a) => a.passingYear === "2022-23").length,
      },
      employmentRate: 85,
      higherEducationRate: 42,
    }
  }
}

