import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Login failed")
    }
    throw new Error("Login failed. Please try again.")
  }
}

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Registration failed")
    }
    throw new Error("Registration failed. Please try again.")
  }
}

export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to get user profile")
    }
    throw new Error("Failed to get user profile. Please try again.")
  }
}

