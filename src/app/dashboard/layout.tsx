import { ReactNode } from "react"
import { BookOpen, Calendar, LayoutDashboard, Settings, Video } from "lucide-react"
import { UserMenu } from "@/components/user-menu"

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
