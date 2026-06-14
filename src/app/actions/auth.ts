"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { headers } from "next/headers"

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

  // Register device if login is successful
  if (data.user) {
    try {
      const { prisma } = await import("@/lib/prisma")
      const headersList = await headers()
      const userAgent = headersList.get("user-agent") || "Unknown Browser"
      const ipAddress = headersList.get("x-forwarded-for") || "Unknown IP"
      
      // Create a unique hash for the device based on user and browser to prevent infinite device creation
      // In a real production app, we would use a library like fingerprintjs on the client side
      const deviceId = `${data.user.id}-${Buffer.from(userAgent).toString('base64').substring(0, 20)}`
      
      await prisma.device.upsert({
        where: { deviceId },
        update: {
          lastLogin: new Date(),
          ipAddress
        },
        create: {
          userId: data.user.id,
          deviceId,
          name: "Web Browser",
          browser: userAgent.substring(0, 100),
          ipAddress,
          status: "ACTIVE"
        }
      })
    } catch (e) {
      console.error("Failed to register device", e)
    }
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
  const phone = formData.get("phone") as string

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
          phone: phone || null,
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

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Email is required" };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name) return { error: "Name is required" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Update Supabase auth metadata
  const { error } = await supabase.auth.updateUser({
    data: { name: name }
  });

  if (error) return { error: error.message };

  // Update Prisma User
  const { prisma } = await import("@/lib/prisma");
  await prisma.user.update({
    where: { id: user.id },
    data: { name, phone: phone || null }
  });

  return { success: true };
}
