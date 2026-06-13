"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBatchContent(batchId: string, includeHidden = false) {
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
                videos: {
                  where: includeHidden ? undefined : { isPublished: true },
                  orderBy: { order: 'asc' },
                  include: { pdfs: true }
                },
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

// ===================== SUBJECTS =====================

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

export async function updateSubject(id: string, name: string, batchId: string) {
  try {
    await prisma.subject.update({
      where: { id },
      data: { name }
    })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update subject" }
  }
}

export async function deleteSubject(id: string, batchId: string) {
  try {
    await prisma.subject.delete({ where: { id } })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete subject" }
  }
}

// ===================== CHAPTERS =====================

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

export async function updateChapter(id: string, name: string, batchId: string) {
  try {
    await prisma.chapter.update({
      where: { id },
      data: { name }
    })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update chapter" }
  }
}

export async function deleteChapter(id: string, batchId: string) {
  try {
    await prisma.chapter.delete({ where: { id } })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete chapter" }
  }
}

// ===================== VIDEOS =====================

export async function createVideo(formData: FormData) {
  try {
    const chapterId = formData.get("chapterId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const youtubeId = formData.get("youtubeId") as string
    const videoUrl = formData.get("videoUrl") as string
    const scheduledAtStr = formData.get("scheduledAt") as string
    const isPublishedStr = formData.get("isPublished") as string
    const durationMins = parseInt(formData.get("duration") as string)

    const videoType = formData.get("videoType") as string || "RECORDED"

    const isPublished = isPublishedStr !== "false"
    const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : null
    const duration = !isNaN(durationMins) ? durationMins * 60 : null

    // For published videos, require a source. Scheduled ones can be created without a link yet.
    if (!chapterId || !title) {
      return { success: false, error: "Missing required fields" }
    }
    if (isPublished && !youtubeId && !videoUrl && videoType !== "LIVE") {
      return { success: false, error: "Please provide a YouTube ID or Video URL" }
    }

    const video = await prisma.video.create({
      data: {
        chapterId,
        title,
        description,
        youtubeId: youtubeId || null,
        videoUrl: videoUrl || null,
        scheduledAt,
        isPublished,
        videoType,
        duration,
      }
    })
    
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true }
    })
    
    if (chapter?.subject?.batchId) {
      revalidatePath(`/admin/batches/${chapter.subject.batchId}`)
    }

    return { success: true, data: video }
  } catch (error: any) {
    console.error("createVideo error:", error)
    return { success: false, error: error?.message || "Failed to create video" }
  }
}

export async function updateVideo(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const youtubeId = formData.get("youtubeId") as string
    const videoUrl = formData.get("videoUrl") as string
    const batchId = formData.get("batchId") as string
    const scheduledAtStr = formData.get("scheduledAt") as string
    const isPublishedStr = formData.get("isPublished") as string
    const durationMins = parseInt(formData.get("duration") as string)
    const videoType = formData.get("videoType") as string || "RECORDED"

    const isPublished = isPublishedStr !== "false"
    const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : null
    const duration = !isNaN(durationMins) ? durationMins * 60 : null

    await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        youtubeId: youtubeId || null,
        videoUrl: videoUrl || null,
        scheduledAt,
        isPublished,
        videoType,
        duration,
      }
    })
    
    if (batchId) revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update video" }
  }
}

export async function deleteVideo(id: string, batchId: string) {
  try {
    await prisma.video.delete({ where: { id } })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete video" }
  }
}

export async function toggleVideoPublished(id: string, isPublished: boolean, batchId: string) {
  try {
    await prisma.video.update({
      where: { id },
      data: { isPublished }
    })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update video status" }
  }
}

// ===================== PDFS =====================

export async function createPDF(formData: FormData) {
  try {
    const chapterId = formData.get("chapterId") as string
    const title = formData.get("title") as string
    const type = formData.get("type") as string // "NOTE" or "DPP"
    const url = formData.get("url") as string
    const videoId = formData.get("videoId") as string || null

    if (!chapterId || !title || !url || !type) {
      return { success: false, error: "Missing required fields" }
    }

    const pdf = await prisma.pDF.create({
      data: {
        chapterId,
        title,
        type,
        url,
        videoId,
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

export async function updatePDF(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const type = formData.get("type") as string // "NOTE" or "DPP"
    const url = formData.get("url") as string
    const batchId = formData.get("batchId") as string
    const videoId = formData.get("videoId") as string || null

    await prisma.pDF.update({
      where: { id },
      data: {
        title,
        type,
        url,
        videoId,
      }
    })
    
    if (batchId) revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update PDF" }
  }
}

export async function deletePDF(id: string, batchId: string) {
  try {
    await prisma.pDF.delete({ where: { id } })
    revalidatePath(`/admin/batches/${batchId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete PDF" }
  }
}
