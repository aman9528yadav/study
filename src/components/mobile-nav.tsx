"use client"
import { useState } from "react"
import { Home, PlaySquare, Calendar, User, Menu, X, Settings, Store, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileHeader({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="p-1 -ml-1 text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-indigo-600">studyhub24</h2>
        </div>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </header>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
              <h2 className="font-bold text-indigo-600 text-xl">studyhub24</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <Link onClick={() => setIsOpen(false)} href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Home className="w-5 h-5" /> Home
                </Link>
                <Link onClick={() => setIsOpen(false)} href="/dashboard/store" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Store className="w-5 h-5" /> Store
                </Link>
                <Link onClick={() => setIsOpen(false)} href="/dashboard/ebooks" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                  <BookOpen className="w-5 h-5" /> Ebooks
                </Link>
                <Link onClick={() => setIsOpen(false)} href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Settings className="w-5 h-5" /> Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  
  const links = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/batches", icon: PlaySquare, label: "Batches" },
    { href: "/dashboard/tests", icon: Calendar, label: "Tests" },
    { href: "/dashboard/settings", icon: User, label: "Profile" },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex items-center justify-around h-14">
        {links.map(link => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}`}>
              <Icon className={`w-5 h-5 ${isActive ? "fill-indigo-100" : ""}`} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
