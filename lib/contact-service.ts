export const sendContactMessage = async (contactData: {
  name: string
  email: string
  subject: string
  message: string
}) => {
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("FRONTEND: Success:", result)
    return result
  } catch (error) {
    console.error("FRONTEND: Contact form submission failed:", error)
    throw error
  }
}

// Test backend connection
export const testEmailConnection = async () => {
  try {
    const response = await fetch("/api/contact/test-email")
    const result = await response.json()
    console.log("FRONTEND: Email test successful:", result)
    return result
  } catch (error) {
    console.error("FRONTEND: Email test failed:", error)
    throw error
  }
}

// Get contact messages
export const getContactMessages = async () => {
  try {
    const response = await fetch("/api/contact")
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}
