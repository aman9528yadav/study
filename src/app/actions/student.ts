"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getStudents() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: 'desc' },
      include: {
        enrollments: {
          include: {
            batch: { select: { title: true } }
          }
        }
      }
    })
    return { success: true, data: students }
  } catch (error) {
    return { success: false, error: "Failed to fetch students" }
  }
}

export async function createStudent(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { success: false, error: "Missing fields" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        status: "ACTIVE"
      }
    })

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create student" }
  }
}

export async function updateStudentStatus(studentId: string, status: string, suspendedUntil?: Date | null) {
  try {
    const suspendDate = status === 'SUSPENDED' ? (suspendedUntil || null) : null;
    
    await prisma.user.update({
      where: { id: studentId },
      data: {
        status: status,
        suspendedUntil: suspendDate
      }
    });
    
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    console.error("Ban Error:", error)
    return { success: false, error: error?.message || "Failed to update status" }
  }
}

export async function updateStudent(studentId: string, data: { name: string, phone: string }) {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: {
        name: data.name,
        phone: data.phone || null
      }
    })
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    await prisma.user.delete({
      where: { id: studentId }
    })
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete user" }
  }
}

export async function updateEnrollmentStatus(enrollmentId: string, status: string) {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status }
    })
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error) {
    console.error("Failed to update enrollment:", error)
    return { success: false, error: "Failed to update enrollment status" }
  }
}
