"use server"

import { prisma } from "@/lib/prisma"
import { getUserSession } from "./auth"
import { revalidatePath } from "next/cache"

export async function markAttendance(batchId: string) {
  try {
    const user = await getUserSession()
    if (!user) return { success: false, error: "Not authenticated" }

    // Use current date formatted as YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0]

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_batchId: {
          userId: user.id,
          batchId: batchId
        }
      }
    })

    if (!enrollment || enrollment.status !== "APPROVED") {
      return { success: false, error: "You are not enrolled in this batch" }
    }

    // Upsert attendance record
    await prisma.attendance.upsert({
      where: {
        userId_batchId_date: {
          userId: user.id,
          batchId: batchId,
          date: today
        }
      },
      update: {
        status: "PRESENT"
      },
      create: {
        userId: user.id,
        batchId: batchId,
        date: today,
        status: "PRESENT"
      }
    })

    revalidatePath(`/dashboard/batches/${batchId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Attendance Error:", error)
    return { success: false, error: "Failed to mark attendance" }
  }
}

export async function getStudentAttendanceStatus(batchId: string) {
  try {
    const user = await getUserSession()
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_batchId_date: {
          userId: user.id,
          batchId: batchId,
          date: today
        }
      }
    })

    return !!attendance && attendance.status === "PRESENT"
  } catch (error) {
    return false
  }
}

export async function getStudentFullAttendance(studentId?: string) {
  try {
    let targetUserId = studentId
    if (!targetUserId) {
      const session = await getUserSession()
      if (!session) return { success: false, error: "Not authenticated" }
      targetUserId = session.id
    }

    const records = await prisma.attendance.findMany({
      where: { userId: targetUserId },
      include: {
        batch: { select: { id: true, title: true } }
      },
      orderBy: { date: 'desc' }
    })

    return { success: true, data: records }
  } catch (error: any) {
    console.error("Failed to fetch full attendance:", error)
    return { success: false, error: "Failed to fetch attendance history" }
  }
}

export async function getAdminBatches() {
  try {
    const batches = await prisma.batch.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: batches }
  } catch (error) {
    return { success: false, data: [] }
  }
}
