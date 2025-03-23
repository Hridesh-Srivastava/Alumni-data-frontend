"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { checkBackendStatus } from "@/services/backend-service"

export function BackendStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const checkConnection = async () => {
    try {
      const isConnected = await checkBackendStatus()
      setStatus(isConnected ? "connected" : "disconnected")
      setLastChecked(new Date())
    } catch (error) {
      setStatus("disconnected")
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  if (status === "loading") {
    return (
      <div className="mb-4 p-4 border rounded-lg bg-background">
        <div className="flex items-start">
          <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
          <div>
            <h5 className="font-medium">Checking backend connection...</h5>
          </div>
        </div>
      </div>
    )
  }

  if (status === "disconnected") {
    return (
      <div className="mb-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <div className="flex-1">
            <h5 className="font-medium text-destructive">Backend Disconnected</h5>
            <div className="text-sm text-destructive/90">
              <p>
                Unable to connect to the backend server. The application is running in development mode with mock data.
              </p>
              <p className="text-xs mt-2">Backend URL: {API_URL}</p>
              <p className="text-xs mt-1">Last checked: {lastChecked.toLocaleTimeString()}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={checkConnection}
                  className="px-2 py-1 text-xs bg-destructive/20 hover:bg-destructive/30 rounded"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="px-2 py-1 text-xs bg-destructive/20 hover:bg-destructive/30 rounded"
                >
                  {showTroubleshooting ? "Hide Troubleshooting" : "Show Troubleshooting"}
                </button>
              </div>

              {showTroubleshooting && (
                <div className="mt-3 p-3 border border-destructive/30 rounded text-xs">
                  <h6 className="font-medium mb-1">Troubleshooting Steps:</h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Ensure backend server is running on port 5000</li>
                    <li>Check MongoDB connection string in backend .env file</li>
                    <li>Verify CORS settings in backend server.js allow requests from {window.location.origin}</li>
                    <li>Try restarting the backend server</li>
                    <li>Check if NEXT_PUBLIC_API_URL is set correctly to {API_URL}</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950">
      <div className="flex items-start">
        <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
        <div>
          <h5 className="font-medium text-green-600 dark:text-green-400">Backend Connected</h5>
          <p className="text-sm text-green-600 dark:text-green-400">
            Successfully connected to the backend server.
            <span className="text-xs block mt-1">Last checked: {lastChecked.toLocaleTimeString()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

