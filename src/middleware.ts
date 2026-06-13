import { updateSession } from "@/utils/supabase/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Always update session to keep the token fresh
  const response = await updateSession(req)
  
  // Create a supabase client directly here to read the user to check role logic
  // We can't easily rely on the response from updateSession for extracting user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ignore, updateSession handles this
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

  if (isAuthPage) {
    if (user) {
      // Redirect logged-in users away from auth pages
      if (user.user_metadata?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return response // return the refreshed cookie response
  }

  // Not an auth page, check if user is logged in
  if (!user) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url))
  }

  // Role-based protection
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  if (isAdminRoute && user.user_metadata?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/login", 
    "/signup"
  ],
}
