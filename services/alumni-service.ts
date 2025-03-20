import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Mock data for development
const mockAlumniData = [
  {
    _id: "1",
    name: "Ashish Rautela",
    academicUnit: "Himalayan School of Science/Engineering and Technology",
    program: "BCA",
    passingYear: "2021-22",
    registrationNumber: "DD2017304002",
    createdAt: "2023-05-15T10:30:00Z",
    qualifiedExams: {
      examName: "NET",
      rollNumber: "123456",
      certificateUrl: "https://example.com/certificate.pdf",
    },
    employment: {
      type: "Employed",
      employerName: "Tech Solutions Ltd",
      employerContact: "+91-9876543210",
      employerEmail: "hr@techsolutions.com",
      documentUrl: "https://example.com/offer-letter.pdf",
    },
    higherEducation: {
      institutionName: "Delhi University",
      programName: "MCA",
      documentUrl: "https://example.com/admission-letter.pdf",
    },
  },
  {
    _id: "2",
    name: "Khushi",
    academicUnit: "Himalayan School of Science/Engineering and Technology",
    program: "BCA",
    passingYear: "2021-22",
    registrationNumber: "DD2017304003",
    createdAt: "2023-05-14T09:15:00Z",
  },
  {
    _id: "3",
    name: "Manish Semwal",
    academicUnit: "Himalayan School of Science/Engineering and Technology",
    program: "BCA",
    passingYear: "2022-23",
    registrationNumber: "DD2018304001",
    createdAt: "2023-05-13T14:45:00Z",
  },
]

export const createAlumni = async (alumniData: any, token: string) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { ...alumniData, _id: Math.random().toString(36).substring(2, 9) }
    }

    const response = await axios.post(`${API_URL}/alumni`, alumniData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to create alumni")
    }
    throw new Error("Failed to create alumni. Please try again.")
  }
}

export const getAlumni = async (params: any, token: string) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Apply filters if any
      let filteredData = [...mockAlumniData]

      if (params.academicUnit && params.academicUnit !== "all") {
        filteredData = filteredData.filter((a) => a.academicUnit === params.academicUnit)
      }

      if (params.passingYear && params.passingYear !== "all") {
        filteredData = filteredData.filter((a) => a.passingYear === params.passingYear)
      }

      if (params.program) {
        filteredData = filteredData.filter((a) => a.program.toLowerCase().includes(params.program.toLowerCase()))
      }

      return {
        data: filteredData,
        pagination: {
          total: filteredData.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(filteredData.length / (params.limit || 10)),
        },
      }
    }

    const response = await axios.get(`${API_URL}/alumni`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch alumni")
    }
    throw new Error("Failed to fetch alumni. Please try again.")
  }
}

export const getAlumniById = async (id: string, token: string) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const alumni = mockAlumniData.find((a) => a._id === id)
      if (!alumni) {
        throw new Error("Alumni not found")
      }
      return alumni
    }

    const response = await axios.get(`${API_URL}/alumni/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch alumni")
    }
    throw new Error("Failed to fetch alumni. Please try again.")
  }
}

export const updateAlumni = async (id: string, alumniData: any, token: string) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { ...alumniData, _id: id }
    }

    const response = await axios.put(`${API_URL}/alumni/${id}`, alumniData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to update alumni")
    }
    throw new Error("Failed to update alumni. Please try again.")
  }
}

export const deleteAlumni = async (id: string, token: string) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: true }
    }

    const response = await axios.delete(`${API_URL}/alumni/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to delete alumni")
    }
    throw new Error("Failed to delete alumni. Please try again.")
  }
}

export const getStats = async (token: string) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        totalAlumni: 1245,
        byAcademicUnit: {
          "Himalayan School of Science/Engineering and Technology": 450,
          "Himalayan Institute of Medical Sciences (Medical)": 320,
          "Himalayan School of Management Studies": 280,
          Other: 195,
        },
        byPassingYear: {
          "2016-17": 280,
          "2017-18": 310,
          "2018-19": 325,
          "2019-20": 330,
        },
        employmentRate: 85,
      }
    }

    const response = await axios.get(`${API_URL}/alumni/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch statistics")
    }
    throw new Error("Failed to fetch statistics. Please try again.")
  }
}

