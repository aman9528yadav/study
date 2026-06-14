"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserSession } from "./auth"

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "global" }
    })
    
    // If not exists, create defaults
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "global",
          maintenanceMode: false,
        }
      })
    }
    
    return settings
  } catch (error) {
    console.error("Failed to fetch system settings:", error)
    // Fallback if DB isn't updated yet to prevent crashing
    return {
      id: "global",
      maintenanceMode: false,
      maintenanceMessage: null,
      maintenanceEndTime: null,
      updatedAt: new Date()
    }
  }
}

export async function updateMaintenanceMode(data: { isEnabled: boolean, message: string, endTime: Date | null }) {
  try {
    const session = await getUserSession()
    if (!session) return { error: "Not logged in" }
    
    const dbUser = await prisma.user.findUnique({ where: { id: session.id } })
    const isAdmin = session.user_metadata?.role === "ADMIN" || dbUser?.role === "ADMIN"
    
    if (!isAdmin) {
      return { error: "Unauthorized" }
    }

    await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: {
        maintenanceMode: data.isEnabled,
        maintenanceMessage: data.message,
        maintenanceEndTime: data.endTime
      },
      create: {
        id: "global",
        maintenanceMode: data.isEnabled,
        maintenanceMessage: data.message,
        maintenanceEndTime: data.endTime
      }
    })

    revalidatePath("/", "layout") // Revalidate everything
    return { success: true }
  } catch (error) {
    console.error("Failed to update maintenance mode:", error)
    return { error: "Failed to update settings. Did you run prisma db push?" }
  }
}
