"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NetworkErrorProps {
  message?: string
  onRetry?: () => void
}

export function NetworkError({
  message = "Failed to connect to the server. Please check your connection or try again later.",
  onRetry,
}: NetworkErrorProps) {
  return (
    <div className="my-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
        <div className="flex-1">
          <h5 className="font-medium text-destructive">Connection Error</h5>
          <div className="text-sm text-destructive/90 space-y-2">
            <p>{message}</p>
            {onRetry && (
              <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
            <p className="text-xs mt-2">
              Note: In development mode, mock data will be used when the backend is not available.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

