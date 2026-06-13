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

    const now = new Date()

    // Fetch upcoming scheduled videos
    const upcomingVideosData = await prisma.video.findMany({
      where: {
        isPublished: true,
        scheduledAt: { gt: now },
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
      orderBy: { scheduledAt: 'asc' }
    })

    const recentVideosData = await prisma.video.findMany({
      where: {
        isPublished: true,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: now } }
        ],
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
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentClassesCount = recentVideosData.length
    
    // Format the latest video
    let latestVideo = null
    if (recentVideosData.length > 0) {
      const v = recentVideosData[0]
      latestVideo = {
        ...v,
        batchName: v.chapter.subject.batch.title,
        chapterName: v.chapter.name
      }
    }

    // Upcoming tests & average score (placeholders until Test Engine is built)
    const upcomingTests = 0
    const averageScore = "N/A"

    const mapVideo = (v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeId: v.youtubeId,
      videoUrl: v.videoUrl,
      duration: v.duration,
      createdAt: v.createdAt,
      scheduledAt: v.scheduledAt,
      batchId: v.chapter.subject.batch.id,
      batchName: v.chapter.subject.batch.title,
      chapterName: v.chapter.name,
      subjectName: v.chapter.subject.name
    })

    const recentVideos = recentVideosData.map(mapVideo)
    const upcomingVideos = upcomingVideosData.map(mapVideo)

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
        upcomingVideos,
        enrolledBatchesList,
        userName: user.name
      }
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard data:", error)
    return { success: false, error: error.message }
  }
}
