"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSystemSettings } from "@/app/actions/settings"

export function MaintenanceWatcher({ currentStatus }: { currentStatus: boolean }) {
  const router = useRouter()

  useEffect(() => {
    // Check for maintenance mode changes every 10 seconds
    const interval = setInterval(async () => {
      try {
        const settings = await getSystemSettings()
        const newStatus = settings?.maintenanceMode === true
        
        if (newStatus !== currentStatus) {
          router.refresh()
        }
      } catch (error) {
        // Silently ignore network errors during polling
        console.error("Failed to check maintenance status", error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [currentStatus, router])

  return null
}
