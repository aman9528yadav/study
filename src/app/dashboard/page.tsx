"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, LayoutGrid, Library, History, Bookmark, FileText } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const studyZoneItems = [
    {
      title: "My Batches",
      description: "View list of batches in which you are enr...",
      icon: <GraduationCap className="w-8 h-8 text-indigo-500 mb-4" strokeWidth={1.5} />,
      link: "/dashboard/batches"
    },
    {
      title: "Dashboard",
      description: "Track your progress through detailed pe...",
      icon: <LayoutGrid className="w-8 h-8 text-slate-500 mb-4" strokeWidth={1.5} />,
      link: "/dashboard"
    },
    {
      title: "Library",
      description: "Access all your free material here",
      icon: <Library className="w-8 h-8 text-slate-500 mb-4" strokeWidth={1.5} />,
      link: "#"
    },
    {
      title: "My History",
      description: "View your recent learning here",
      icon: <History className="w-8 h-8 text-slate-500 mb-4" strokeWidth={1.5} />,
      link: "#"
    },
    {
      title: "Bookmarks",
      description: "View the list of your saved questions",
      icon: <Bookmark className="w-8 h-8 text-slate-500 mb-4" strokeWidth={1.5} />,
      link: "#"
    },
    {
      title: "PDF Bank",
      description: "Download your Study PDFs from here",
      icon: <FileText className="w-8 h-8 text-slate-500 mb-4" strokeWidth={1.5} />,
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 -m-8 p-8">
      {/* Top Banner (No Upcoming Events) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center mb-10 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          No upcoming events,
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Perfect time to catch up on pending work!
        </p>
        <Button variant="outline" className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-950/50 rounded-full px-8">
          View Weekly Schedule
        </Button>
      </div>

      {/* My Study Zone Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">My Study Zone</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyZoneItems.map((item, idx) => (
            <Link href={item.link} key={idx} className="block group">
              <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 rounded-xl overflow-hidden cursor-pointer">
                <CardContent className="p-6 flex flex-col h-full">
                  <div>{item.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
