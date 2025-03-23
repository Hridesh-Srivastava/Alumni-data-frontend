import api, { checkBackendStatus } from "./backend-service"
import axios from "axios"

// Helper function to get contacts from localStorage
const getStoredContacts = () => {
  try {
    const storedContacts = localStorage.getItem("contactMessages")
    return storedContacts ? JSON.parse(storedContacts) : []
  } catch (error) {
    console.error("Error parsing stored contacts:", error)
    return []
  }
}

// Helper function to save contacts to localStorage
const saveContactsToLocalStorage = (contacts: any[]) => {
  try {
    localStorage.setItem("contactMessages", JSON.stringify(contacts))
  } catch (error) {
    console.error("Error saving contacts to localStorage:", error)
  }
}

export const sendContactMessage = async (contactData: any) => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()
    console.log("Backend available:", isBackendAvailable)

    if (isBackendAvailable) {
      // Backend is available, send to API
      try {
        // Use direct axios call to avoid potential issues with the api instance
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        const response = await axios.post(`${API_URL}/contact`, contactData, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Contact message sent to backend:", response.data)

        // Also store in localStorage for development convenience
        storeContactInLocalStorage(contactData, response.data._id)

        return response.data
      } catch (error) {
        console.error("Error sending message to backend:", error)
        // Fall back to localStorage
        storeContactInLocalStorage(contactData)
        return {
          success: true,
          message: "Contact message stored locally (backend error)",
        }
      }
    } else {
      // Backend is not available, store in localStorage only
      console.log("Backend unavailable: Contact message stored in localStorage only")

      storeContactInLocalStorage(contactData)

      return {
        success: true,
        message: "Contact message received successfully (Development Mode)",
      }
    }
  } catch (error) {
    console.error("Error sending message:", error)
    // Still store in localStorage as fallback
    storeContactInLocalStorage(contactData)

    return {
      success: true,
      message: "Contact message stored locally (error occurred)",
    }
  }
}

// Helper function to store contact in localStorage
function storeContactInLocalStorage(contactData: any, id?: string) {
  try {
    const storedMessages = getStoredContacts()
    const newMessage = {
      ...contactData,
      _id: id || Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    }

    storedMessages.push(newMessage)
    saveContactsToLocalStorage(storedMessages)
    console.log("Contact message stored in localStorage:", newMessage)
  } catch (error) {
    console.error("Error storing contact in localStorage:", error)
  }
}

export const getContactMessages = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      // Backend is available, get from API
      const response = await api.get("/contact")
      return response.data
    } else {
      // Backend is not available, get from localStorage
      console.log("Backend unavailable: Returning contact messages from localStorage")

      const storedMessages = getStoredContacts()

      if (storedMessages.length > 0) {
        return storedMessages
      }

      // Fallback mock data
      return [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          subject: "Inquiry about alumni events",
          message: "I would like to know about upcoming alumni events.",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          subject: "Update my information",
          message: "I need to update my contact information in the alumni database.",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ]
    }
  } catch (error) {
    console.error("Error fetching messages:", error)

    // Return from localStorage as fallback
    const storedMessages = getStoredContacts()

    if (storedMessages.length > 0) {
      return storedMessages
    }

    throw error
  }
}

