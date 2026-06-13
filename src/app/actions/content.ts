"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBatchContent(batchId: string) {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        subjects: {
          orderBy: { createdAt: 'asc' },
          include: {
            chapters: {
              orderBy: { order: 'asc' },
              include: {
                videos: { orderBy: { order: 'asc' } },
                pdfs: { orderBy: { order: 'asc' } },
                tests: true
              }
            }
          }
        }
      }
    })
    return { success: true, data: batch }
  } catch (error) {
    return { success: false, error: "Failed to fetch batch content" }
  }
}

export async function createSubject(batchId: string, name: string) {
  try {
    await prisma.subject.create({
      data: { batchId, name }
    })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create subject" }
  }
}

export async function createChapter(subjectId: string, name: string, batchId: string) {
  try {
    await prisma.chapter.create({
      data: { subjectId, name }
    })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create chapter" }
  }
}

export async function createVideo(formData: FormData) {
  try {
    const chapterId = formData.get("chapterId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const youtubeId = formData.get("youtubeId") as string
    const videoUrl = formData.get("videoUrl") as string

    if (!chapterId || !title || (!youtubeId && !videoUrl)) {
      return { success: false, error: "Missing required fields" }
    }

    const video = await prisma.video.create({
      data: {
        chapterId,
        title,
        description,
        youtubeId: youtubeId || null,
        videoUrl: videoUrl || null,
      }
    })
    
    // We need to revalidate the batch page
    // Since we don't have batchId directly, we find it:
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true }
    })
    
    if (chapter?.subject?.batchId) {
      revalidatePath(`/admin/batches/${chapter.subject.batchId}`)
    }

    return { success: true, data: video }
  } catch (error) {
    return { success: false, error: "Failed to create video" }
  }
}

export async function createPDF(formData: FormData) {
  try {
    const chapterId = formData.get("chapterId") as string
    const title = formData.get("title") as string
    const type = formData.get("type") as string // "NOTE" or "DPP"
    const url = formData.get("url") as string

    if (!chapterId || !title || !url || !type) {
      return { success: false, error: "Missing required fields" }
    }

    const pdf = await prisma.pDF.create({
      data: {
        chapterId,
        title,
        type,
        url,
      }
    })
    
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true }
    })
    
    if (chapter?.subject?.batchId) {
      revalidatePath(`/admin/batches/${chapter.subject.batchId}`)
    }

    return { success: true, data: pdf }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create PDF" }
  }
}
