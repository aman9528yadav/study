"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectPath = formData.get("redirect") as string || "/dashboard"

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user is an admin
  if (data.user?.user_metadata?.role === "ADMIN") {
    redirect("/admin")
  }

  redirect(redirectPath)
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password || !name) {
    return { error: "Name, email, and password are required" }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: "STUDENT" // Default role for new signups
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const { prisma } = await import("@/lib/prisma")
    
    // Check if user already exists in Prisma to prevent conflicts
    const existing = await prisma.user.findUnique({ where: { email } })
    if (!existing) {
      await prisma.user.create({
        data: {
          id: data.user.id,
          name,
          email,
          password: "SUPABASE_AUTH",
          role: "STUDENT",
          status: "ACTIVE"
        }
      })
    }
  }

  // After successful signup, redirect to dashboard
  redirect("/dashboard")
}

export async function logout() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getUserSession() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
