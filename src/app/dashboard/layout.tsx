import { ReactNode } from "react"
import { Ban, Clock, LogOut } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { getUserSession, logout } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"
import { MobileHeader, BottomNav } from "@/components/mobile-nav"
import { getSystemSettings } from "@/app/actions/settings"
import { MaintenanceScreen } from "@/components/maintenance-screen"
import { MaintenanceWatcher } from "@/components/maintenance-watcher"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const userSession = await getUserSession()

  let isBlocked = false
  let blockReason = ""
  let isTemporary = false
  let dbUser = null

  if (userSession) {
    dbUser = await prisma.user.findUnique({
      where: { id: userSession.id }
    })
    
    if (dbUser) {
      if (dbUser.status === "BANNED") {
        isBlocked = true
        blockReason = "Your account has been permanently banned by an administrator."
      } else if (dbUser.status === "SUSPENDED") {
        isBlocked = true
        isTemporary = true
        if (dbUser.suspendedUntil) {
          if (new Date() > new Date(dbUser.suspendedUntil)) {
            isBlocked = false
            prisma.user.update({ where: { id: dbUser.id }, data: { status: 'ACTIVE', suspendedUntil: null } }).catch(console.error)
          } else {
            const banDate = new Date(dbUser.suspendedUntil).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
            blockReason = `Your account has been temporarily suspended until ${banDate}.`
          }
        } else {
          blockReason = "Your account has been temporarily suspended until further notice from the administrator."
        }
      }
    }
  }

  // Check Maintenance Mode
  const settings = await getSystemSettings()
  const isMaintenanceActive = settings?.maintenanceMode === true
  const isAdmin = userSession?.user_metadata?.role === "ADMIN" || dbUser?.role === "ADMIN"

  if (isMaintenanceActive && !isAdmin) {
    return <MaintenanceScreen message={settings.maintenanceMessage} endTime={settings.maintenanceEndTime} />
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
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-14">
      <MobileHeader>
        <UserMenu />
      </MobileHeader>
      
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto sm:max-w-none bg-[#f4f5f8] shadow-sm relative overflow-hidden pb-8">
        <MaintenanceWatcher currentStatus={isMaintenanceActive} />
        {isMaintenanceActive && isAdmin && (
          <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold shadow-md z-50 flex items-center justify-center gap-2">
            ⚠️ Maintenance Mode is currently ACTIVE. Students cannot access the platform.
          </div>
        )}
        {children}
      </main>
      
      <BottomNav />
    </div>
  )
}
