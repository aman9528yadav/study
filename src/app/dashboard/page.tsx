"use client"

import { useEffect, useState } from "react"
import { getStudentDashboardData } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"
import { ChevronDown, PlayCircle, MessageCircle, Clock, Video } from "lucide-react"
import Link from "next/link"
import { getTimeUntil } from "@/lib/utils"

const getYoutubeThumbnail = (urlOrId: string) => {
  if (!urlOrId) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = urlOrId.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : urlOrId
  if (!match && videoId.length > 15) return null // If it's a long non-youtube URL, don't try to load it from YouTube
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBatchId, setSelectedBatchId] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const res = await getStudentDashboardData()
      if (res.success) {
        setData(res.data)
        if (res.data?.enrolledBatchesList && res.data.enrolledBatchesList.length > 0) {
          setSelectedBatchId(res.data.enrolledBatchesList[0].id)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading your dashboard...</p>
      </div>
    )
  }

  if (!data || data.enrolledBatchesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Welcome to StudyPlatform!</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">You are not enrolled in any batches yet. Explore our batches and start learning today.</p>
        <Link href="/dashboard/batches" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
          Explore Batches
        </Link>
      </div>
    )
  }

  const selectedBatch = data.enrolledBatchesList.find((b: any) => b.id === selectedBatchId)
  const batchVideos = data.upcomingVideos?.filter((v: any) => v.batchId === selectedBatchId) || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-6">
      {/* Top Header Section with Dark Background */}
      <div className="bg-[#1c2438] text-white pt-8 pb-16 px-8 relative overflow-visible">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #4f46e5 0%, transparent 50%), radial-gradient(circle at 0% 100%, #ec4899 0%, transparent 50%)' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-20">
          <p className="text-xs font-bold tracking-wider text-slate-400 mb-2 uppercase">Your Batch</p>
          
          <div className="relative inline-block">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 text-3xl sm:text-4xl font-bold hover:text-indigo-300 transition-colors focus:outline-none"
            >
              <span className="truncate max-w-[280px] sm:max-w-md">{selectedBatch?.title || "Select Batch"}</span>
              <ChevronDown className={`w-6 h-6 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 overflow-hidden z-[100]">
                {data.enrolledBatchesList.map((batch: any) => (
                  <button
                    key={batch.id}
                    onClick={() => {
                      setSelectedBatchId(batch.id)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${batch.id === selectedBatchId ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-l-indigo-600' : 'text-slate-700 dark:text-slate-300 font-medium border-l-4 border-l-transparent'}`}
                  >
                    {batch.title}
                  </button>
                ))}
                <Link href="/dashboard/batches" className="w-full block text-center px-5 py-3 bg-slate-50 dark:bg-slate-900 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium transition-colors">
                  View All My Batches
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-4 -mt-8 relative z-10 space-y-8" onClick={() => isDropdownOpen && setIsDropdownOpen(false)}>
        {/* Batch Offerings */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Batch Offerings</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
            <Link href={`/dashboard/batches/${selectedBatchId}`} className="min-w-[200px] snap-center">
              <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group border-none shadow-sm rounded-xl h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">All Classes</span>
                </div>
                <ChevronDown className="w-5 h-5 -rotate-90 text-slate-300 group-hover:text-indigo-400 shrink-0" />
              </Card>
            </Link>

            <Link href="#" className="min-w-[200px] snap-center">
              <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group border-none shadow-sm rounded-xl h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">My Doubts</span>
                </div>
                <ChevronDown className="w-5 h-5 -rotate-90 text-slate-300 group-hover:text-blue-400 shrink-0" />
              </Card>
            </Link>
            
            <Link href={`/dashboard/batches/${selectedBatchId}?tab=tests`} className="min-w-[200px] snap-center">
              <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group border-none shadow-sm rounded-xl h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 transition-colors">Tests</span>
                </div>
                <ChevronDown className="w-5 h-5 -rotate-90 text-slate-300 group-hover:text-purple-400 shrink-0" />
              </Card>
            </Link>
          </div>
        </div>

        {/* Upcoming Events / Recent Content */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Upcoming Events ({batchVideos.length})</h3>
          
          {batchVideos.length === 0 ? (
            <Card className="border-none shadow-sm rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 rounded-full scale-150 blur-xl opacity-50"></div>
                <Clock className="w-20 h-20 text-indigo-400 relative z-10" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No upcoming events</h4>
              <p className="text-slate-500 max-w-sm">
                Your schedule is clear right now. This is a perfect time to revise your notes or practice DPPS!
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {batchVideos.map((video: any) => (
                <Link key={video.id} href={`/dashboard/batches/${selectedBatchId}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 group">
                    <div className="relative aspect-video bg-slate-900">
                      {getYoutubeThumbnail(video.youtubeId || video.videoUrl) ? (
                        <img 
                          src={getYoutubeThumbnail(video.youtubeId || video.videoUrl)!}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                          <PlayCircle className="w-12 h-12 mb-2 opacity-50 group-hover:opacity-100 transition-opacity group-hover:text-indigo-400 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider text-white">
                        {video.scheduledAt && new Date(video.scheduledAt) > new Date() 
                          ? `Starts ${getTimeUntil(video.scheduledAt)}`
                          : new Date(video.scheduledAt || video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">{video.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {video.subjectName} • {video.chapterName}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
