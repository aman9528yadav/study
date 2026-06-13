"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBatches() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    })
    return { success: true, data: batches }
  } catch (error) {
    return { success: false, error: "Failed to fetch batches" }
  }
}

export async function createBatch(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priceStr = formData.get("price") as string
    const startDateStr = formData.get("startDate") as string
    const endDateStr = formData.get("endDate") as string
    const validity = formData.get("validity") as string || null
    const mode = formData.get("mode") as string || null
    const schedule = formData.get("schedule") as string || null
    const featuresRaw = formData.get("features") as string || ""
    
    // Parse features from newline separated string to JSON array
    const features = JSON.stringify(featuresRaw.split("\n").map(f => f.trim()).filter(f => f.length > 0))

    if (!title || !priceStr || !startDateStr || !endDateStr) {
      return { success: false, error: "Missing required fields" }
    }

    await prisma.batch.create({
      data: {
        title,
        description,
        price: parseFloat(priceStr),
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        visibility: "PUBLIC",
        validity,
        mode,
        schedule,
        features
      }
    })

    revalidatePath("/admin/batches")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create batch" }
  }
}
