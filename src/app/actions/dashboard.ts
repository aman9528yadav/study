"use server"

import { prisma } from "@/lib/prisma"
import { getUserSession } from "@/app/actions/auth"

export async function getStudentDashboardData() {
  try {
    const userSession = await getUserSession()
    if (!userSession?.email) {
      return { success: false, error: "Not authenticated" }
    }

    let user = await prisma.user.findUnique({
      where: { email: userSession.email },
      include: {
        enrollments: {
          where: { status: "APPROVED" },
          include: {
            batch: true
          }
        }
      }
    })

    if (!user) {
      // Just-In-Time (JIT) Sync for missing users (e.g. registered before sync hook)
      user = await prisma.user.create({
        data: {
          id: userSession.id,
          name: userSession.user_metadata?.name || "Student",
          email: userSession.email,
          password: "SUPABASE_AUTH",
          role: "STUDENT",
          status: "ACTIVE"
        },
        include: {
          enrollments: { where: { status: "APPROVED" }, include: { batch: true } }
        }
      })
    }

    const enrolledBatchesCount = user.enrollments.length
    const batchIds = user.enrollments.map(e => e.batchId)

    // Fetch videos for these batches using a separate, safer query
    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,
        chapter: {
          subject: {
            batchId: { in: batchIds }
          }
        }
      },
      include: {
        chapter: {
          include: {
            subject: {
              include: {
                batch: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const recentClassesCount = videos.length
    
    // Format the latest video
    let latestVideo = null
    if (videos.length > 0) {
      const v = videos[0]
      latestVideo = {
        ...v,
        batchName: v.chapter.subject.batch.title,
        chapterName: v.chapter.name
      }
    }

    // Upcoming tests & average score (placeholders until Test Engine is built)
    const upcomingTests = 0
    const averageScore = "N/A"

    const recentVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeId: v.youtubeId,
      videoUrl: v.videoUrl,
      duration: v.duration,
      createdAt: v.createdAt,
      batchId: v.chapter.subject.batch.id,
      batchName: v.chapter.subject.batch.title,
      chapterName: v.chapter.name,
      subjectName: v.chapter.subject.name
    }))

    // Map the enrolled batches list for display
    const enrolledBatchesList = user.enrollments.map(e => e.batch)

    return {
      success: true,
      data: {
        enrolledBatchesCount,
        recentClassesCount,
        upcomingTests,
        averageScore,
        latestVideo,
        recentVideos,
        enrolledBatchesList,
        userName: user.name
      }
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard data:", error)
    return { success: false, error: error.message }
  }
}
