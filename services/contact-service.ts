import { checkBackendStatus } from "./backend-service"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

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
const saveContactsToLocalStorage = (contacts) => {
  try {
    localStorage.setItem("contactMessages", JSON.stringify(contacts))
  } catch (error) {
    console.error("Error saving contacts to localStorage:", error)
  }
}

export const sendContactMessage = async (contactData) => {
  console.log("FRONTEND: Sending contact message")
  console.log("FRONTEND: Contact data:", contactData)

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    })

    console.log("FRONTEND: Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("FRONTEND: Success:", result)

    storeContactInLocalStorage(contactData, result._id)

    return result
  } catch (error) {
    console.error("FRONTEND: Contact form submission failed:", error)

    storeContactInLocalStorage(contactData)

    throw error
  }
}

function storeContactInLocalStorage(contactData, id) {
  try {
    const storedMessages = getStoredContacts()
    const newMessage = {
      ...contactData,
      _id: id || Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    }

    storedMessages.push(newMessage)
    saveContactsToLocalStorage(storedMessages)
    console.log("FRONTEND: Contact message stored in localStorage:", newMessage)
  } catch (error) {
    console.error("FRONTEND: Error storing contact in localStorage:", error)
  }
}

export const getContactMessages = async () => {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendStatus()

    if (isBackendAvailable) {
      const response = await axios.get(`${API_URL}/contact`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      console.log("FRONTEND: Contact messages fetched from Express backend:", response.data)
      return response.data
    } else {
      console.log("FRONTEND: Express backend unavailable, returning contact messages from localStorage")

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
    console.error("FRONTEND: Error fetching messages from Express backend:", error)

    const storedMessages = getStoredContacts()

    if (storedMessages.length > 0) {
      return storedMessages
    }

    throw error
  }
}

export const testContactFormEmail = async () => {
  try {
    const response = await fetch("/api/contact/test-email")

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("FRONTEND: Contact form email test successful:", result)
    return result
  } catch (error) {
    console.error("FRONTEND: Contact form email test failed:", error)
    throw error
  }
}

// Test Express backend connection (uses API_URL)
export const testExpressBackend = async () => {
  try {
    console.log("FRONTEND: Testing Express backend connection...")
    const response = await axios.get(`${API_URL}/health`)
    console.log("FRONTEND: Express backend test successful:", response.data)
    return response.data
  } catch (error) {
    console.error("FRONTEND: Express backend test failed:", error)
    throw error
  }
}
