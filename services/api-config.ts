// Central configuration for API connectivity
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"

// Function to check backend connectivity
export const checkBackendConnectivity = async (): Promise<boolean> => {
  if (isDevelopment) {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Short timeout to avoid long waits
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch (error) {
      console.warn("Backend connectivity check failed:", error)
      return false
    }
  }
  return true // Assume connected in production
}

// Helper to simulate API delay in development
export const simulateApiDelay = async (ms = 800): Promise<void> => {
  if (isDevelopment) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export { API_URL, isDevelopment }

