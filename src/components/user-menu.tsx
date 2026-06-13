"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { logout } from "@/app/actions/auth"

export function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    fetchUser()
  }, [supabase.auth])

  const name = user?.user_metadata?.name || "User"
  const email = user?.email || ""

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-sm font-medium leading-none">{name}</span>
        <span className="text-xs text-muted-foreground">{email}</span>
      </div>
      <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
        {name.charAt(0)}
      </div>
      <form action={logout}>
        <Button 
          variant="ghost" 
          size="icon" 
          type="submit"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
      </form>
    </div>
  )
}
