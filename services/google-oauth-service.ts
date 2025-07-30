const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

export class GoogleOAuthService {
  static async initiateAuth(): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get Google OAuth URL")
      }

      const data = await response.json()
      return data.authUrl
    } catch (error) {
      console.error("Error initiating Google OAuth:", error)
      throw new Error("Failed to initiate Google OAuth")
    }
  }

  static redirectToGoogle(): void {
    this.initiateAuth()
      .then((authUrl) => {
        window.location.href = authUrl
      })
      .catch((error) => {
        console.error("Failed to redirect to Google:", error)
        throw error
      })
  }
} 