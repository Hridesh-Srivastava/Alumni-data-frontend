"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Loader2, Terminal } from "lucide-react"
import { checkBackendStatus } from "@/services/backend-service"
import axios from "axios"

export function BackendStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const checkConnection = async () => {
    try {
      const isConnected = await checkBackendStatus()
      setStatus(isConnected ? "connected" : "disconnected")
      setLastChecked(new Date())

      // If disconnected, try to get more debug info
      if (!isConnected) {
        try {
          // Try a direct fetch to see if we can get more error details
          await fetch(`${API_URL.replace("/api", "")}/health`, {
            method: "GET",
            mode: "no-cors", // This allows us to at least see if the server responds
          })
        } catch (error) {
          if (error instanceof Error) {
            setDebugInfo(error.message)
          }
        }
      }
    } catch (error) {
      setStatus("disconnected")
      setLastChecked(new Date())
      if (error instanceof Error) {
        setDebugInfo(error.message)
      }
    }
  }

  useEffect(() => {
    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const runNetworkDiagnostics = async () => {
    setDebugInfo("Running diagnostics...")

    try {
      // Try different endpoints to see what works
      const endpoints = [
        { url: API_URL.replace("/api", ""), name: "Root endpoint" },
        { url: `${API_URL.replace("/api", "")}/health`, name: "Health endpoint" },
        { url: `${API_URL}/auth/login`, name: "Login endpoint" },
      ]

      let results = ""

      for (const endpoint of endpoints) {
        try {
          const start = performance.now()
          await axios.get(endpoint.url, {
            timeout: 3000,
            validateStatus: () => true, // Accept any status code
          })
          const end = performance.now()
          results += `✅ ${endpoint.name} (${Math.round(end - start)}ms)\n`
        } catch (error) {
          results += `❌ ${endpoint.name}: ${error instanceof Error ? error.message : "Unknown error"}\n`
        }
      }

      // Check if the server is running on the expected port
      try {
        const port = API_URL.match(/:(\d+)/)?.[1] || "5000"
        results += `\nChecking port ${port}:\n`

        const portCheckResponse = await fetch(`http://localhost:${port}`, {
          mode: "no-cors",
          signal: AbortSignal.timeout(2000),
        }).catch((e) => null)

        if (portCheckResponse) {
          results += `✅ Port ${port} is responding\n`
        } else {
          results += `❌ Port ${port} is not responding\n`
        }
      } catch (error) {
        results += `❌ Port check failed: ${error instanceof Error ? error.message : "Unknown error"}\n`
      }

      setDebugInfo(results)
    } catch (error) {
      setDebugInfo(`Diagnostics failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

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
                <button
                  onClick={runNetworkDiagnostics}
                  className="px-2 py-1 text-xs bg-destructive/20 hover:bg-destructive/30 rounded flex items-center"
                >
                  <Terminal className="h-3 w-3 mr-1" /> Run Diagnostics
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
                    <li>Check if your firewall is blocking connections to port 5000</li>
                    <li>
                      Try running the backend with <code>npm start</code> and check for any errors
                    </li>
                  </ol>
                </div>
              )}

              {debugInfo && (
                <div className="mt-3 p-3 border border-destructive/30 rounded text-xs bg-black/80 text-white font-mono whitespace-pre-wrap">
                  <h6 className="font-medium mb-1">Diagnostic Information:</h6>
                  {debugInfo}
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

