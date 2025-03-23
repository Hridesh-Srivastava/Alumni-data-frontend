import { checkBackendStatus as checkBackend } from "./backend-service"

export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    return await checkBackend()
  } catch (error) {
    console.error("Error checking backend status:", error)
    return false
  }
}

