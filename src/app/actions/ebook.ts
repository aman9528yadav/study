"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Using Raw SQL queries here to completely bypass the Windows Prisma Client lock issue
// without requiring the user to restart their dev server.

export async function getEbooks() {
  try {
    const ebooks: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM Ebook ORDER BY createdAt DESC`)
    return { success: true, data: ebooks }
  } catch (error: any) {
    console.error("getEbooks Error:", error)
    return { success: false, error: "Failed to fetch ebooks" }
  }
}

export async function getEbook(id: string) {
  try {
    const ebooks: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM Ebook WHERE id = ?`, id)
    if (!ebooks || ebooks.length === 0) return { success: false, error: "Ebook not found" }
    return { success: true, data: ebooks[0] }
  } catch (error: any) {
    console.error("getEbook Error:", error)
    return { success: false, error: "Failed to fetch ebook" }
  }
}

export async function createEbook(data: { 
  title: string, 
  chapterName?: string, 
  categoryId: string, 
  subjects: string, 
  boards: string, 
  exams: string, 
  description?: string, 
  sourceType: string, 
  fileUrl: string, 
  pageCount?: number, 
  fileSize?: string, 
  status: string 
}) {
  try {
    const id = crypto.randomUUID()
    await prisma.$executeRawUnsafe(
      `INSERT INTO Ebook (id, title, chapterName, categoryId, subjects, boards, exams, description, sourceType, fileUrl, pageCount, fileSize, status, views, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
      id,
      data.title,
      data.chapterName || null,
      data.categoryId,
      data.subjects,
      data.boards,
      data.exams,
      data.description || null,
      data.sourceType,
      data.fileUrl,
      data.pageCount || null,
      data.fileSize || null,
      data.status
    )
    revalidatePath("/admin/ebooks")
    return { success: true, id }
  } catch (error: any) {
    console.error("createEbook Error:", error)
    return { success: false, error: "Failed to create ebook" }
  }
}

export async function updateEbook(id: string, data: { 
  title: string, 
  chapterName?: string, 
  categoryId: string, 
  subjects: string, 
  boards: string, 
  exams: string, 
  description?: string, 
  sourceType: string, 
  fileUrl: string, 
  pageCount?: number, 
  fileSize?: string, 
  status: string 
}) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Ebook SET title = ?, chapterName = ?, categoryId = ?, subjects = ?, boards = ?, exams = ?, description = ?, sourceType = ?, fileUrl = ?, pageCount = ?, fileSize = ?, status = ?, updatedAt = datetime('now') WHERE id = ?`,
      data.title,
      data.chapterName || null,
      data.categoryId,
      data.subjects,
      data.boards,
      data.exams,
      data.description || null,
      data.sourceType,
      data.fileUrl,
      data.pageCount || null,
      data.fileSize || null,
      data.status,
      id
    )
    revalidatePath("/admin/ebooks")
    revalidatePath(`/admin/ebooks/${id}/edit`)
    return { success: true }
  } catch (error: any) {
    console.error("updateEbook Error:", error)
    return { success: false, error: "Failed to update ebook" }
  }
}

export async function deleteEbook(id: string) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM Ebook WHERE id = ?`, id)
    revalidatePath("/admin/ebooks")
    return { success: true }
  } catch (error: any) {
    console.error("deleteEbook Error:", error)
    return { success: false, error: "Failed to delete ebook" }
  }
}
