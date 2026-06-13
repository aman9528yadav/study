"use server"

import { prisma } from "@/lib/prisma"
import { getUserSession } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"

export async function checkEnrollment(batchId: string) {
  const user = await getUserSession()
  if (!user) return { success: false, enrolled: false, status: null }

  const userId = user.id

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_batchId: {
          userId: userId,
          batchId: batchId
        }
      }
    })
    return { success: true, enrolled: !!enrollment, status: enrollment?.status || null }
  } catch (error) {
    return { success: false, enrolled: false, status: null }
  }
}

export async function enrollInBatch(batchId: string) {
  const user = await getUserSession()
  if (!user) return { success: false, error: "Not logged in" }

  const userId = user.id

  try {
    // Just-In-Time (JIT) Sync
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId,
          name: user.user_metadata?.name || "Student",
          email: user.email!,
          password: "SUPABASE_AUTH",
          role: "STUDENT",
          status: "ACTIVE"
        }
      })
    }

    await prisma.enrollment.create({
      data: {
        userId: userId,
        batchId: batchId,
        status: "PENDING"
      }
    })
    
    revalidatePath(`/dashboard/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    console.error("Enrollment error:", error)
    return { success: false, error: "Failed to enroll or already enrolled" }
  }
}
