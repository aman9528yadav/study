"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Play, Lock, ChevronRight, ChevronLeft, Calendar, FileText, CheckCircle2, ChevronDown, Bell, Search } from "lucide-react"
import { getBatchContent } from "@/app/actions/content"
import { checkEnrollment, enrollInBatch } from "@/app/actions/enrollment"
import { VideoPlayer } from "@/components/video-player"
import Link from "next/link"
import { getTimeUntil } from "@/lib/utils"

// Helper to get youtube thumbnail
const getYoutubeThumbnail = (urlOrId: string) => {
  if (!urlOrId) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = urlOrId.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : urlOrId
  if (!match && videoId.length > 15) return null
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export default function StudentClassroomPage() {
  const params = useParams()
  const batchId = params.id as string

  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("all-classes")
  const [activeSubject, setActiveSubject] = useState<any>(null)
  const [activeChapter, setActiveChapter] = useState<any>(null)
  const [chapterTab, setChapterTab] = useState("lectures")
  
  const [activeVideo, setActiveVideo] = useState<any>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setLoading(true)
    const [contentRes, enrollRes] = await Promise.all([
      getBatchContent(batchId),
      checkEnrollment(batchId)
    ])

    if (contentRes.success && contentRes.data) {
      setBatch(contentRes.data)
    }
    
    if (enrollRes.success) {
      setIsEnrolled(enrollRes.status === "APPROVED")
      setEnrollmentStatus(enrollRes.status)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [batchId])

  const handleEnroll = async () => {
    setEnrolling(true)
    const res = await enrollInBatch(batchId)
    if (res.success) {
      setEnrollmentStatus("PENDING")
    } else {
      alert(res.error || "Failed to enroll")
    }
    setEnrolling(false)
  }

  const handlePlayVideo = (video: any) => {
    if (!isEnrolled) return
    if (video.scheduledAt && new Date(video.scheduledAt) > new Date()) {
      alert("This class is scheduled for a future time and cannot be played yet.")
      return
    }
    setActiveVideo(video)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // --- Rendering Helpers ---

  // Top Tabs
  const renderTabs = () => (
    <div className="flex overflow-x-auto border-b border-[#2a344a] mb-6 scrollbar-hide">
      {["All Classes", "Khazana", "Tests", "Announcements"].map((tab) => {
        const id = tab.toLowerCase().replace(" ", "-")
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap relative
              ${activeTab === id ? "text-indigo-400" : "text-slate-400 hover:text-slate-300"}
            `}
          >
            {tab}
            {activeTab === id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
          </button>
        )
      })}
    </div>
  )

  // Level 1: Subjects List
  const renderSubjectsList = () => {
    if (!batch.subjects || batch.subjects.length === 0) {
      return <div className="p-8 text-center text-slate-500">No subjects available.</div>
    }

    return (
      <div className="space-y-3">
        {batch.subjects.map((subject: any) => {
          const chapterCount = subject.chapters?.length || 0
          return (
            <button
              key={subject.id}
              onClick={() => setActiveSubject(subject)}
              className="w-full flex items-center justify-between p-4 bg-[#1c2438] hover:bg-[#252f48] border border-[#2a344a] rounded-xl transition-all group text-left"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{subject.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{chapterCount} Chapters</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>
          )
        })}
      </div>
    )
  }

  // Level 2: Chapters List (Inside a Subject)
  const renderChaptersList = () => {
    if (!activeSubject.chapters || activeSubject.chapters.length === 0) {
      return <div className="p-8 text-center text-slate-500">No chapters available in this subject.</div>
    }

    return (
      <div className="space-y-3">
        {activeSubject.chapters.map((chapter: any) => {
          const videoCount = chapter.videos?.length || 0
          return (
            <button
              key={chapter.id}
              onClick={() => setActiveChapter(chapter)}
              className="w-full flex items-center justify-between p-4 bg-[#1c2438] hover:bg-[#252f48] border border-[#2a344a] rounded-xl transition-all group text-left"
            >
              <div>
                <h3 className="text-base font-semibold text-slate-100">{chapter.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {videoCount} Videos | 0 Exercises | 0 Notes
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>
          )
        })}
      </div>
    )
  }

  // Level 3: Videos List (Inside a Chapter)
  const renderVideosList = () => {
    return (
      <div className="mt-4">
        {/* Chapter Tabs */}
        <div className="flex overflow-x-auto border-b border-[#2a344a] mb-4 scrollbar-hide">
          {["Lectures", "Notes", "DPP", "DPP PDF", "DPP Videos"].map((tab) => {
            const id = tab.toLowerCase().replace(" ", "-")
            return (
              <button
                key={id}
                onClick={() => setChapterTab(id)}
                className={`px-8 py-3 text-sm font-medium transition-colors whitespace-nowrap
                  ${chapterTab === id ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-300"}
                `}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {chapterTab === "lectures" && (
          !activeChapter.videos || activeChapter.videos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No lectures uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {activeChapter.videos.map((video: any) => {
                const isActive = activeVideo?.id === video.id
                const isUpcoming = video.scheduledAt && new Date(video.scheduledAt) > new Date()
                const canPlay = isEnrolled && !isUpcoming
                return (
                  <button
                    key={video.id}
                    disabled={!canPlay}
                    onClick={() => handlePlayVideo(video)}
                    className={`w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-[#1c2438] hover:bg-[#252f48] border rounded-xl transition-all text-left
                      ${isActive ? "border-indigo-500/50 ring-1 ring-indigo-500/20" : "border-[#2a344a]"}
                      ${!canPlay ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                      {getYoutubeThumbnail(video.youtubeId || video.videoUrl) ? (
                        <img 
                          src={getYoutubeThumbnail(video.youtubeId || video.videoUrl)!} 
                          alt="Thumbnail"
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                          <Play className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-[10px] font-medium tracking-widest uppercase">Direct Stream</span>
                        </div>
                      )}
                      
                      {!canPlay && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          {isUpcoming ? (
                            <div className="flex flex-col items-center">
                              <Calendar className="w-6 h-6 text-white/80 mb-1" />
                              <span className="text-white/80 text-[10px] font-bold text-center leading-tight">
                                UPCOMING<br/>
                                <span className="text-indigo-300">{getTimeUntil(video.scheduledAt) ? `Starts ${getTimeUntil(video.scheduledAt)}` : ''}</span>
                              </span>
                            </div>
                          ) : (
                            <Lock className="w-8 h-8 text-white/80" />
                          )}
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                          <div className="bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-lg animate-pulse">Playing</div>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                        02:00:00
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className={`text-sm sm:text-base font-semibold leading-tight mb-2 line-clamp-2
                        ${isActive ? "text-indigo-400" : "text-slate-100"}
                      `}>
                        {video.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Play className="w-3.5 h-3.5" /> Lecture
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(video.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">{video.description}</p>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:flex items-center justify-center pr-2 shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-slate-600" />
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {(chapterTab === "notes" || chapterTab === "dpp") && (() => {
          const expectedType = chapterTab === "notes" ? "NOTE" : "DPP"
          const pdfs = activeChapter.pdfs?.filter((p: any) => p.type === expectedType) || []
          
          if (pdfs.length === 0) {
            return <div className="p-8 text-center text-slate-500">No {expectedType.toLowerCase()}s uploaded yet.</div>
          }

          return (
            <div className="space-y-3">
              {pdfs.map((pdf: any) => (
                <a
                  key={pdf.id}
                  href={isEnrolled ? pdf.url : "#"}
                  target={isEnrolled ? "_blank" : undefined}
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!isEnrolled) {
                      e.preventDefault()
                      alert("Please enroll to view this document.")
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 bg-[#1c2438] hover:bg-[#252f48] border rounded-xl transition-all text-left border-[#2a344a]
                    ${!isEnrolled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0
                    ${pdf.type === "DPP" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}
                  `}>
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-slate-100 line-clamp-1">{pdf.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {new Date(pdf.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="shrink-0 pl-4">
                    {!isEnrolled ? <Lock className="w-5 h-5 text-slate-600" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                  </div>
                </a>
              ))}
            </div>
          )
        })()}

        {(chapterTab === "dpp-pdf" || chapterTab === "dpp-videos") && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>Content for {chapterTab.toUpperCase()} is coming soon.</p>
          </div>
        )}
      </div>
    )
  }

  // --- Main Layout ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex items-center justify-center text-slate-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          Loading Classroom...
        </div>
      </div>
    )
  }

  if (!batch) return <div className="min-h-screen bg-[#0b1121] p-8 text-center text-red-400">Batch not found.</div>

  return (
    // Force PW Dark Theme explicitly across the whole page container
    <div className="min-h-screen bg-[#0b1121] text-slate-200 font-sans selection:bg-indigo-500/30" ref={topRef}>
      
      {/* Top Navbar / Header area (Mimicking PW's top nav) */}
      <div className="sticky top-0 z-40 bg-[#0b1121]/90 backdrop-blur-md border-b border-[#2a344a]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard/batches" className="p-2 hover:bg-[#1c2438] rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white truncate">
              {activeChapter ? activeChapter.name : activeSubject ? activeSubject.name : batch.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Anti-Piracy Video Player Section (Only if video is active) */}
        {isEnrolled && activeVideo && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-[#2a344a]">
              {activeVideo.youtubeId ? (
                <div className="w-full aspect-video">
                  <VideoPlayer videoId={activeVideo.youtubeId} />
                </div>
              ) : activeVideo.videoUrl ? (
                <div className="w-full aspect-video bg-black flex items-center justify-center">
                  <video 
                    src={activeVideo.videoUrl} 
                    controls 
                    controlsList="nodownload" 
                    className="w-full h-full"
                    autoPlay
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center text-slate-600 bg-[#0a0a0a]">
                  Invalid Video Source
                </div>
              )}
              <div className="p-4 bg-[#141b2d] border-t border-[#2a344a] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{activeVideo.title}</h2>
                  <p className="text-sm text-slate-400">{activeSubject?.name} • {activeChapter?.name}</p>
                </div>
                <button className="px-4 py-2 bg-[#1c2438] hover:bg-[#252f48] rounded-lg text-sm font-medium transition-colors border border-[#2a344a]">
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not Enrolled or Pending Barrier */}
        {!isEnrolled && (
          <div className="mb-8 p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
            <div className="bg-[#0b1121] rounded-xl p-8 flex flex-col items-center text-center">
              <Lock className="w-16 h-16 text-indigo-400 mb-6" />
              
              {enrollmentStatus === "PENDING" ? (
                <>
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">Pending Admin Approval</h2>
                  <p className="text-slate-400 max-w-lg mb-8 text-lg">
                    Your request to enroll in {batch.title} is currently pending. Please wait for an admin to approve your access.
                  </p>
                  <button disabled className="px-12 py-4 bg-yellow-600/50 text-white text-lg font-bold rounded-xl cursor-not-allowed">
                    Awaiting Approval...
                  </button>
                </>
              ) : enrollmentStatus === "REJECTED" ? (
                <>
                  <h2 className="text-3xl font-bold text-red-500 mb-4">Enrollment Rejected</h2>
                  <p className="text-slate-400 max-w-lg mb-8 text-lg">
                    Your request to enroll in {batch.title} was rejected by an admin.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mb-4">Unlock Premium Content</h2>
                  <p className="text-slate-400 max-w-lg mb-8 text-lg">
                    Get full access to live classes, recorded lectures, DPPS, and test series for {batch.title}.
                  </p>
                  <button 
                    onClick={handleEnroll} 
                    disabled={enrolling}
                    className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {enrolling ? "Processing..." : `Request Access @ $${batch.price}`}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area - Only visible if enrolled */}
        {isEnrolled && !activeSubject && (
          <>
            {renderTabs()}
            
            {activeTab === "all-classes" ? (
              <>
                {/* Notice Banner */}
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-100">Welcome to {batch.title}!</h4>
                    <p className="text-sm text-blue-200/70">Classes will be conducted as per the schedule. Check announcements for updates.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-4 mt-8">Subjects</h2>
                {renderSubjectsList()}
              </>
            ) : (
              <div className="p-16 text-center border border-[#2a344a] border-dashed rounded-xl mt-8">
                <p className="text-xl font-medium text-slate-300">Coming Soon</p>
                <p className="text-slate-500 mt-2">This feature is currently under development.</p>
              </div>
            )}
          </>
        )}

        {/* If subject is active but no chapter, show Chapters List (Level 2) */}
        {isEnrolled && activeSubject && !activeChapter && (
          <>
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <button onClick={() => setActiveSubject(null)} className="hover:text-white transition-colors">Subjects</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-200 font-medium">{activeSubject.name}</span>
            </div>
            {renderChaptersList()}
          </>
        )}

        {/* If chapter is active, show Videos List (Level 3) */}
        {isEnrolled && activeSubject && activeChapter && (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2">
              <button onClick={() => { setActiveChapter(null); setActiveSubject(null) }} className="hover:text-white transition-colors">Subjects</button>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <button onClick={() => setActiveChapter(null)} className="hover:text-white transition-colors">{activeSubject.name}</button>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span className="text-slate-200 font-medium">{activeChapter.name}</span>
            </div>
            {renderVideosList()}
          </>
        )}

      </div>
    </div>
  )
}
