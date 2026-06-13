"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUserDevices(userId: string) {
  try {
    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { lastLogin: 'desc' }
    })
    return { success: true, data: devices }
  } catch (error) {
    return { success: false, error: "Failed to fetch devices" }
  }
}

export async function getUserWithDevices(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        devices: {
          orderBy: { lastLogin: 'desc' }
        }
      }
    })
    if (!user) return { success: false, error: "User not found" }
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: "Failed to fetch user devices" }
  }
}

export async function deleteDevice(deviceId: string) {
  try {
    const device = await prisma.device.delete({
      where: { id: deviceId }
    })
    revalidatePath(`/admin/users/${device.userId}/devices`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete device" }
  }
}

export async function resetAllDevices(userId: string) {
  try {
    await prisma.device.deleteMany({
      where: { userId }
    })
    revalidatePath(`/admin/users/${userId}/devices`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to reset devices" }
  }
}

export async function toggleDeviceStatus(deviceId: string) {
  try {
    const device = await prisma.device.findUnique({ where: { id: deviceId } })
    if (!device) return { success: false, error: "Device not found" }

    const newStatus = device.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"
    
    await prisma.device.update({
      where: { id: deviceId },
      data: { status: newStatus }
    })
    
    revalidatePath(`/admin/users/${device.userId}/devices`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update device status" }
  }
}
