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
      const { page = 1, limit = 10, passingYear, program, academicUnit } = filter

      // Build URL with filters
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

      const { page = 1, limit = 10, passingYear, program, academicUnit } = filter

      // Get stored alumni
      const mockAlumni = getStoredAlumni()

      // Filter mock data based on criteria
      let filteredAlumni = [...mockAlumni]

      // Filter by academic unit
      if (academicUnit && academicUnit !== "all") {
        filteredAlumni = filteredAlumni.filter((a) => a.academicUnit === academicUnit)
      } else {
        // If "all" is selected, don't filter by academic unit - show all
        filteredAlumni = mockAlumni
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

    // Filter by academic unit
    let filteredAlumni = mockAlumni
    if (filter.academicUnit && filter.academicUnit !== "all") {
      filteredAlumni = mockAlumni.filter((a) => a.academicUnit === filter.academicUnit)
    }
    // If "all" is selected, don't filter by academic unit - show all

    return {
      data: filteredAlumni,
      pagination: {
        total: filteredAlumni.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(filteredAlumni.length / 10),
      },
    }
  }
}

// Function to fetch all available academic units
export const getAcademicUnits = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API - use the academic units endpoint
      const response = await api.get("/academic-units")
      // Extract just the names from the academic units
      return response.data.map((unit: any) => unit.name) || []
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock academic units")
      const mockAlumni = getStoredAlumni()
      
      // Get unique academic units from mock data
      const academicUnits = [...new Set(mockAlumni.map(alumni => alumni.academicUnit))]
      return academicUnits.sort()
    }
  } catch (error) {
    console.error("Error fetching academic units:", error)
    
    // Fallback to default units
    return ["School of Science and Technology"]
  }
}

// Function to fetch all available programs
export const getPrograms = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.get("/alumni/programs")
      return response.data.data || []
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock programs")
      const mockAlumni = getStoredAlumni()
      
      // Get unique programs from mock data
      const programs = [...new Set(mockAlumni.map(alumni => alumni.program))]
      return programs.sort()
    }
  } catch (error) {
    console.error("Error fetching programs:", error)
    
    // Fallback to default programs
    return ["BCA", "B.Tech", "MCA", "M.Tech", "BSc.", "MSc."]
  }
}

// Function to fetch all available passing years
export const getPassingYears = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.get("/alumni/passing-years")
      return response.data.data || []
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock passing years")
      const mockAlumni = getStoredAlumni()
      
      // Get unique passing years from mock data
      const passingYears = [...new Set(mockAlumni.map(alumni => alumni.passingYear))]
      return passingYears.sort((a, b) => {
        const yearA = parseInt(a.split('-')[0])
        const yearB = parseInt(b.split('-')[0])
        return yearB - yearA
      })
    }
  } catch (error) {
    console.error("Error fetching passing years:", error)
    
    // Fallback to generated years
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= 2015; year--) {
      years.push(`${year}-${(year + 1).toString().slice(-2)}`)
    }
    return years
  }
}

// Function to fetch a single alumni by ID
export const getAlumniById = async (id, token) => {
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

// Function to create a new alumni
export const createAlumni = async (alumniData) => {
  try {
    // Always set academicUnit to SST
    alumniData.academicUnit = "School of Science and Technology"

    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      try {
        // Log the data being sent to help debug
        console.log("Sending alumni data to backend:", alumniData)

        // Make sure all required fields are present
        const requiredFields = ["name", "program", "passingYear", "registrationNumber"]
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

        // Handle file uploads if present
        if (alumniData.basicInfoImage || alumniData.qualificationImage || alumniData.employmentImage || alumniData.higherEducationImage) {
          const formData = new FormData()

          // Add all regular fields to formData
          Object.keys(alumniData).forEach((key) => {
            if (key !== "basicInfoImage" && key !== "qualificationImage" && key !== "employmentImage" && key !== "higherEducationImage") {
              if (typeof alumniData[key] === "object" && alumniData[key] !== null) {
                formData.append(key, JSON.stringify(alumniData[key]))
              } else if (alumniData[key] !== null && alumniData[key] !== undefined) {
                formData.append(key, alumniData[key])
              }
            }
          })

          // Add files if they exist
          if (alumniData.basicInfoImage) {
            formData.append("basicInfoImage", alumniData.basicInfoImage)
          }

          if (alumniData.qualificationImage) {
            formData.append("qualificationImage", alumniData.qualificationImage)
          }

          if (alumniData.employmentImage) {
            formData.append("employmentImage", alumniData.employmentImage)
          }

          if (alumniData.higherEducationImage) {
            formData.append("higherEducationImage", alumniData.higherEducationImage)
          }

          // Log FormData contents for debugging
          console.log("FormData created with the following keys:")
          for (const pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1])
          }

          // Use direct axios call with FormData
          const response = await axios({
            method: "post",
            url: `${API_URL}/alumni`,
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000, // 30 seconds timeout for file uploads
          })

          console.log("Alumni created successfully with files:", response.data)

          // Also store in localStorage for development convenience
          addAlumniToLocalStorage(response.data)

          return response.data
        } else {
          // No files, use regular JSON request
          const response = await api.post("/alumni", alumniData)

          console.log("Alumni created successfully:", response.data)

          // Also store in localStorage for development convenience
          addAlumniToLocalStorage(response.data)

          return response.data
        }
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
    academicUnit: "School of Science and Technology", // Always set to SST
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
      academicUnit: "School of Science and Technology", // Always set to SST
      createdAt: alumniData.createdAt || new Date().toISOString(),
    })
    saveAlumniToLocalStorage(mockAlumni)
  } catch (error) {
    console.error("Error adding alumni to localStorage:", error)
  }
}

// Function to update an existing alumni
export const updateAlumni = async (id, alumniData, token) => {
  try {
    // Always set academicUnit to SST
    alumniData.academicUnit = "School of Science and Technology"

    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      // Handle file uploads if present
      if (alumniData.basicInfoImage || alumniData.qualificationImage || alumniData.employmentImage || alumniData.higherEducationImage) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api"

        if (!token) {
          token = localStorage.getItem("token")
        }

        if (!token) {
          throw new Error("Authentication required. Please log in again.")
        }

        const formData = new FormData()

        // Add all regular fields to formData
        Object.keys(alumniData).forEach((key) => {
          if (key !== "basicInfoImage" && key !== "qualificationImage" && key !== "employmentImage" && key !== "higherEducationImage") {
            if (typeof alumniData[key] === "object" && alumniData[key] !== null) {
              formData.append(key, JSON.stringify(alumniData[key]))
            } else if (alumniData[key] !== null && alumniData[key] !== undefined) {
              formData.append(key, alumniData[key])
            }
          }
        })

        // Add files if they exist
        if (alumniData.basicInfoImage) {
          formData.append("basicInfoImage", alumniData.basicInfoImage)
        }

        if (alumniData.qualificationImage) {
          formData.append("qualificationImage", alumniData.qualificationImage)
        }

        if (alumniData.employmentImage) {
          formData.append("employmentImage", alumniData.employmentImage)
        }

        if (alumniData.higherEducationImage) {
          formData.append("higherEducationImage", alumniData.higherEducationImage)
        }

        // Use direct axios call with FormData
        const response = await axios({
          method: "put",
          url: `${API_URL}/alumni/${id}`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, // 30 seconds timeout for file uploads
        })

        // Also update in localStorage for development convenience
        const mockAlumni = getStoredAlumni()
        const index = mockAlumni.findIndex((a) => a._id === id)

        if (index !== -1) {
          mockAlumni[index] = {
            ...mockAlumni[index],
            ...response.data,
            academicUnit: "School of Science and Technology", // Always set to SST
            updatedAt: new Date().toISOString(),
          }
          saveAlumniToLocalStorage(mockAlumni)
        }

        return response.data
      } else {
        // No files, use regular JSON request
        const response = await api.put(`/alumni/${id}`, alumniData)

        // Also update in localStorage for development convenience
        const mockAlumni = getStoredAlumni()
        const index = mockAlumni.findIndex((a) => a._id === id)

        if (index !== -1) {
          mockAlumni[index] = {
            ...mockAlumni[index],
            ...response.data,
            academicUnit: "School of Science and Technology", // Always set to SST
            updatedAt: new Date().toISOString(),
          }
          saveAlumniToLocalStorage(mockAlumni)
        }

        return response.data
      }
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
        academicUnit: "School of Science and Technology", // Always set to SST
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

// Function to delete an alumni
export const deleteAlumni = async (id, token) => {
  try {
    console.log("Starting delete operation for alumni ID:", id)
    console.log("Token provided:", token ? `${token.slice(0, 15)}...` : "No token")

    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()
    console.log("Backend available:", isBackendAvailable)

    if (isBackendAvailable) {
      // Backend is available, use real API
      // Make sure we have a token
      if (!token) {
        console.log("No token provided, checking localStorage")
        token = localStorage.getItem("token")
        console.log("Token from localStorage:", token ? `${token.slice(0, 15)}...` : "No token in localStorage")
      }

      if (!token) {
        console.error("No authentication token available")
        throw new Error("Authentication required. Please log in again.")
      }

      // Use direct axios call with proper authorization
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hsst-alumni-backend.vercel.app/api"
      console.log("Using API URL:", API_URL)

      // Ensure token is properly formatted
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`
      console.log("Authorization header:", authHeader.slice(0, 20) + "...")

      // Log the full request details for debugging
      console.log("Making DELETE request to:", `${API_URL}/alumni/${id}`)
      console.log("With headers:", {
        "Content-Type": "application/json",
        Authorization: authHeader.slice(0, 20) + "...",
      })

      const response = await axios({
        method: "delete",
        url: `${API_URL}/alumni/${id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        timeout: 15000, // Increased timeout
      })

      console.log("Delete response:", response.data)

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

// Fix for the stats API endpoint issue
export const getStats = async (token) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      console.log("Fetching stats from backend API")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hsst-alumni-backend.vercel.app/api"

      // Important fix: Use the correct endpoint for stats
      // The issue was that the route handler for /stats is defined before /search
      // So we need to use a different URL pattern to avoid the conflict
      const statsUrl = `${API_URL}/alumni/stats`

      console.log("Stats URL:", statsUrl)

      // Use direct axios call with proper authorization
      const response = await axios({
        method: "get",
        url: statsUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        timeout: 10000,
      })

      console.log("Stats received from backend:", response.data)
      return response.data
    } else {
      // Backend is not available, generate stats from localStorage
      console.log("Backend unavailable: Generating stats from localStorage")

      const mockAlumni = getStoredAlumni()

      // Filter for SST engineering department
      const filteredAlumni = mockAlumni.filter((a) => a.academicUnit === "School of Science and Technology")

      // Calculate real stats based on mock data
      const totalAlumni = filteredAlumni.length

      // Count by passing year
      const byPassingYear = {}
      filteredAlumni.forEach((alumni) => {
        if (alumni.passingYear) {
          byPassingYear[alumni.passingYear] = (byPassingYear[alumni.passingYear] || 0) + 1
        }
      })

      // Count employment status
      let employedCount = 0
      filteredAlumni.forEach((alumni) => {
        if (alumni.employment && alumni.employment.type === "Employed") {
          employedCount++
        }
      })
      const employmentRate = totalAlumni > 0 ? Math.round((employedCount / totalAlumni) * 100) : 0

      // Count higher education
      let higherEducationCount = 0
      filteredAlumni.forEach((alumni) => {
        if (alumni.higherEducation && alumni.higherEducation.institutionName) {
          higherEducationCount++
        }
      })
      const higherEducationRate = totalAlumni > 0 ? Math.round((higherEducationCount / totalAlumni) * 100) : 0

      return {
        totalAlumni,
        byAcademicUnit: {
          "School of Science and Technology": totalAlumni,
        },
        byPassingYear,
        employmentRate,
        higherEducationRate,
      }
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)

    // Generate basic stats as fallback
    const mockAlumni = getStoredAlumni()

    // Filter for SST engineering department
    const filteredAlumni = mockAlumni.filter((a) => a.academicUnit === "School of Science and Technology")

    return {
      totalAlumni: filteredAlumni.length,
      byAcademicUnit: {
        "School of Science and Technology": filteredAlumni.length,
      },
      byPassingYear: {},
      employmentRate: 0,
      higherEducationRate: 0,
    }
  }
}
