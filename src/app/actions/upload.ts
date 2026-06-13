"use server"

import fs from "fs/promises"
import path from "path"

export async function uploadFile(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file uploaded" }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Ensure filename is unique to avoid overwriting
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.name)
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_")
    const filename = `${baseName}_${uniqueSuffix}${ext}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    // Write file to public/uploads
    const filepath = path.join(uploadsDir, filename)
    await fs.writeFile(filepath, buffer)

    return { success: true, url: `/uploads/${filename}` }
  } catch (error) {
    console.error("Upload error:", error)
    return { success: false, error: "Failed to upload file" }
  }
}
