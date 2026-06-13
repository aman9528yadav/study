import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeUntil(dateInput: string | Date | null) {
  if (!dateInput) return null
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  
  if (diffMs <= 0) return null
  
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `in ${diffHours} hr${diffHours !== 1 ? 's' : ''}`
  
  const diffDays = Math.floor(diffHours / 24)
  return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
}
