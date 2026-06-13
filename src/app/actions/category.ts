"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Using Raw SQL queries here to completely bypass the Windows Prisma Client lock issue
// without requiring the user to restart their dev server.

export async function getCategories() {
  try {
    const categories: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM Category ORDER BY "order" ASC`)
    return { success: true, data: categories }
  } catch (error: any) {
    console.error("getCategories Error:", error)
    return { success: false, error: "Failed to fetch categories" }
  }
}

export async function getCategory(id: string) {
  try {
    const categories: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM Category WHERE id = ?`, id)
    if (!categories || categories.length === 0) return { success: false, error: "Category not found" }
    return { success: true, data: categories[0] }
  } catch (error: any) {
    console.error("getCategory Error:", error)
    return { success: false, error: "Failed to fetch category" }
  }
}

export async function createCategory(data: { name: string, description?: string }) {
  try {
    const id = crypto.randomUUID()
    await prisma.$executeRawUnsafe(
      `INSERT INTO Category (id, name, description, status, "order", subjects, boards, exams, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      id,
      data.name,
      data.description || null,
      'Active',
      0,
      '[]',
      '[]',
      '[]'
    )
    revalidatePath("/admin/categories")
    return { success: true, id }
  } catch (error: any) {
    console.error("createCategory Error:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(id: string, data: { name: string, description?: string, status: string, order: number, subjects: string, boards: string, exams: string }) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Category SET name = ?, description = ?, status = ?, "order" = ?, subjects = ?, boards = ?, exams = ?, updatedAt = datetime('now') WHERE id = ?`,
      data.name,
      data.description || null,
      data.status,
      data.order,
      data.subjects,
      data.boards,
      data.exams,
      id
    )
    revalidatePath("/admin/categories")
    revalidatePath(`/admin/categories/${id}/edit`)
    return { success: true }
  } catch (error: any) {
    console.error("updateCategory Error:", error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM Category WHERE id = ?`, id)
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    console.error("deleteCategory Error:", error)
    return { success: false, error: "Failed to delete category" }
  }
}
