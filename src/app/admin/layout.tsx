import { ReactNode } from "react"
import { Users, LayoutDashboard, Settings, Video, Book, FileText, MessageSquare, GraduationCap, CalendarCheck, DollarSign, Image as ImageIcon, Layout, Globe, Folder, FormInput, Search, Bell, Moon, Languages } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import Link from "next/link"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#495057]">
      {/* Sidebar */}
      <aside className="w-64 flex-col hidden sm:flex bg-white border-r border-gray-100 shadow-sm z-10 overflow-y-auto scrollbar-hide">
        <div className="p-4 flex items-center gap-3 sticky top-0 bg-white z-20">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            S
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800">studyhub24</h2>
        </div>
        
        <div className="px-4 py-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Manage Contents</h3>
          <nav className="space-y-1">
            <Link href="/admin/students" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-md transition-colors border-l-4 border-blue-600">
              <Users className="w-4 h-4" />
              <span className="font-medium text-sm">Users</span>
            </Link>
            <div className="space-y-1">
              <Link href="/admin/categories" className="flex items-center justify-between px-3 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <Layout className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Categories</span>
                </div>
                <div className="w-4 h-4">▼</div>
              </Link>
              <div className="pl-9 space-y-1 py-1">
                <Link href="/admin/categories" className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium">
                  <span className="w-2 h-0.5 bg-blue-600"></span>
                  All Categories
                </Link>
                <Link href="/admin/categories/new" className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors text-sm font-medium">
                  <span className="w-2 h-0.5 bg-gray-300"></span>
                  Add Category
                </Link>
              </div>
            </div>
            <Link href="/admin/videos" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4" />
                <span className="font-medium text-sm">Videos</span>
              </div>
            </Link>
            <div className="space-y-1">
              <Link href="/admin/ebooks" className="flex items-center justify-between px-3 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <Book className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Ebooks</span>
                </div>
                <div className="w-4 h-4">▼</div>
              </Link>
              <div className="pl-9 space-y-1 py-1">
                <Link href="/admin/ebooks" className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium">
                  <span className="w-2 h-0.5 bg-blue-600"></span>
                  All Ebooks
                </Link>
                <Link href="/admin/ebooks/create" className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors text-sm font-medium">
                  <span className="w-2 h-0.5 bg-gray-300"></span>
                  Add Ebook
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Paid Services</h3>
          <nav className="space-y-1">
            <Link href="/admin/batches" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium text-sm">Batches</span>
              </div>
            </Link>
            <Link href="/admin/attendance" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4" />
                <span className="font-medium text-sm">Attendance</span>
              </div>
            </Link>
            <Link href="/admin/fees" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium text-sm">Fees</span>
              </div>
            </Link>
          </nav>
        </div>

        <div className="px-4 py-2 mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">System</h3>
          <nav className="space-y-1">
            <Link href="/admin/settings" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span className="font-medium text-sm">Settings</span>
              </div>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="sm:hidden">
              <h2 className="text-xl font-bold text-gray-800">studyhub24</h2>
            </div>
            <div className="hidden md:flex items-center relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Moon className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
              <Languages className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
              <GraduationCap className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="pl-2 border-l border-gray-200">
              <UserMenu />
            </div>
          </div>
        </header>
        
        {/* Main Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
