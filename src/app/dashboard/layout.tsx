import { ReactNode } from "react"
import { BookOpen, Calendar, LayoutDashboard, Settings, Video, Ban, Clock, LogOut } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { getUserSession, logout } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const userSession = await getUserSession()
  let isBlocked = false
  let blockReason = ""
  let isTemporary = false

  if (userSession) {
    const user = await prisma.user.findUnique({ where: { id: userSession.id } })
    if (user) {
      if (user.status === "BANNED") {
        isBlocked = true
        blockReason = "Your account has been permanently banned by an administrator."
      } else if (user.status === "SUSPENDED") {
        isBlocked = true
        isTemporary = true
        if (user.suspendedUntil) {
          const banDate = new Date(user.suspendedUntil).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
          blockReason = `Your account has been temporarily suspended until ${banDate}.`
        } else {
          blockReason = "Your account has been temporarily suspended until further notice from the administrator."
        }
      }
    }
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center text-slate-200 p-4">
        <div className="bg-[#1c2438] p-8 rounded-2xl max-w-md w-full text-center border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            {isTemporary ? <Clock className="w-10 h-10 text-orange-400" /> : <Ban className="w-10 h-10 text-red-500" />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {blockReason}
          </p>
          <form action={logout}>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2a344a] hover:bg-[#323d57] rounded-xl text-white font-medium transition-colors shadow-lg">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 flex-col hidden sm:flex border-r bg-background">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-primary">StudyPlatform</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="/dashboard/batches" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground rounded-md transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">My Batches</span>
          </a>
          <a href="/dashboard/live" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground rounded-md transition-colors">
            <Video className="w-5 h-5" />
            <span className="font-medium">Live Classes</span>
          </a>
          <a href="/dashboard/tests" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground rounded-md transition-colors">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Online Tests</span>
          </a>
          <a href="/dashboard/ebooks" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground rounded-md transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Ebooks</span>
          </a>
        </nav>
        <div className="p-4 mt-auto">
          <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground rounded-md transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background">
          <div className="sm:hidden">
            <h2 className="text-xl font-bold text-primary">StudyPlatform</h2>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
