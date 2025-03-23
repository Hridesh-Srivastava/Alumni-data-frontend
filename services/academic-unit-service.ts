import api, { checkBackendStatus } from "./backend-service"
import axios from "axios"

// Get stored academic units from localStorage or initialize with default data
const getStoredAcademicUnits = () => {
  try {
    const storedUnits = localStorage.getItem("mockAcademicUnits")
    if (storedUnits) {
      return JSON.parse(storedUnits)
    }
  } catch (error) {
    console.error("Error parsing stored academic units:", error)
  }

  // Default academic units
  const defaultUnits = [
    {
      _id: "1",
      name: "Himalayan School of Science/Engineering and Technology",
      shortName: "HSST",
      description: "School focused on engineering and technology education",
    },
    {
      _id: "2",
      name: "Himalayan Institute of Medical Sciences (Medical)",
      shortName: "HIMS (Medical)",
      description: "Medical education and healthcare training",
    },
    {
      _id: "3",
      name: "Himalayan School of Management Studies",
      shortName: "HSMS",
      description: "Business and management education",
    },
  ]

  localStorage.setItem("mockAcademicUnits", JSON.stringify(defaultUnits))
  return defaultUnits
}

// Save academic units to localStorage
const saveAcademicUnitsToLocalStorage = (units: any[]) => {
  try {
    localStorage.setItem("mockAcademicUnits", JSON.stringify(units))
  } catch (error) {
    console.error("Error saving academic units to localStorage:", error)
  }
}

export const getAcademicUnits = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.get("/academic-units")

      // Also store in localStorage for development convenience
      saveAcademicUnitsToLocalStorage(response.data)

      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock academic units")

      return getStoredAcademicUnits()
    }
  } catch (error) {
    console.error("Error fetching academic units:", error)

    // Return from localStorage as fallback
    return getStoredAcademicUnits()
  }
}

export const getAcademicUnitById = async (id: string) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.get(`/academic-units/${id}`)
      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Using mock academic unit")

      const mockUnits = getStoredAcademicUnits()
      const unit = mockUnits.find((u) => u._id === id)

      if (!unit) {
        throw new Error("Academic unit not found")
      }

      return unit
    }
  } catch (error) {
    console.error("Error fetching academic unit:", error)
    throw error
  }
}

export const createAcademicUnit = async (data: any) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      try {
        const response = await api.post("/academic-units", data)

        // Also store in localStorage for development convenience
        addAcademicUnitToLocalStorage(response.data)

        return response.data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || "Failed to create academic unit")
        }
        throw error
      }
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Creating academic unit in localStorage only")

      const mockUnits = getStoredAcademicUnits()

      // Check if unit with same name already exists
      if (mockUnits.some((u) => u.name === data.name)) {
        throw new Error("Academic unit with this name already exists")
      }

      // Create new unit with ID
      const newUnit = {
        _id: Math.random().toString(36).substring(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
      }

      // Add to mock units
      mockUnits.push(newUnit)
      saveAcademicUnitsToLocalStorage(mockUnits)

      return newUnit
    }
  } catch (error) {
    console.error("Error creating academic unit:", error)
    throw error
  }
}

// Helper function to add academic unit to localStorage
function addAcademicUnitToLocalStorage(unitData: any) {
  try {
    const mockUnits = getStoredAcademicUnits()
    mockUnits.push({
      ...unitData,
      createdAt: unitData.createdAt || new Date().toISOString(),
    })
    saveAcademicUnitsToLocalStorage(mockUnits)
  } catch (error) {
    console.error("Error adding academic unit to localStorage:", error)
  }
}

export const updateAcademicUnit = async (id: string, data: any) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.put(`/academic-units/${id}`, data)

      // Also update in localStorage for development convenience
      const mockUnits = getStoredAcademicUnits()
      const index = mockUnits.findIndex((u) => u._id === id)

      if (index !== -1) {
        mockUnits[index] = {
          ...mockUnits[index],
          ...response.data,
          updatedAt: new Date().toISOString(),
        }
        saveAcademicUnitsToLocalStorage(mockUnits)
      }

      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Updating academic unit in localStorage only")

      const mockUnits = getStoredAcademicUnits()
      const index = mockUnits.findIndex((u) => u._id === id)

      if (index === -1) {
        throw new Error("Academic unit not found")
      }

      // Check if another unit with the same name exists
      const nameExists = mockUnits.some((u) => u.name === data.name && u._id !== id)
      if (nameExists) {
        throw new Error("Academic unit with this name already exists")
      }

      // Update unit
      const updatedUnit = {
        ...mockUnits[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      mockUnits[index] = updatedUnit
      saveAcademicUnitsToLocalStorage(mockUnits)

      return updatedUnit
    }
  } catch (error) {
    console.error("Error updating academic unit:", error)
    throw error
  }
}

export const deleteAcademicUnit = async (id: string) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, use real API
      const response = await api.delete(`/academic-units/${id}`)

      // Also delete from localStorage for development convenience
      const mockUnits = getStoredAcademicUnits()
      const filteredUnits = mockUnits.filter((u) => u._id !== id)
      saveAcademicUnitsToLocalStorage(filteredUnits)

      return response.data
    } else {
      // Backend is not available, use mock data
      console.log("Backend unavailable: Deleting academic unit from localStorage only")

      const mockUnits = getStoredAcademicUnits()
      const filteredUnits = mockUnits.filter((u) => u._id !== id)

      if (filteredUnits.length === mockUnits.length) {
        throw new Error("Academic unit not found")
      }

      saveAcademicUnitsToLocalStorage(filteredUnits)

      // Return mock response
      return {
        message: "Academic unit removed successfully",
      }
    }
  } catch (error) {
    console.error("Error deleting academic unit:", error)
    throw error
  }
}

