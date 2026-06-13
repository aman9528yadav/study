"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Play, Lock, ChevronRight, ChevronLeft, Calendar, FileText, CheckCircle2, ChevronDown, Bell, Search, Menu, Video } from "lucide-react"
import { getBatchContent } from "@/app/actions/content"
import { checkEnrollment, enrollInBatch } from "@/app/actions/enrollment"
import { VideoPlayer } from "@/components/video-player"
import Link from "next/link"

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
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const playVideoId = searchParams.get('play')
  const batchId = id as string

  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  
  // Navigation State
  const [activeSubject, setActiveSubject] = useState<any>(null)
  const [activeChapter, setActiveChapter] = useState<any>(null)
  const [chapterTab, setChapterTab] = useState("all") // all, lectures, dpps, notes
  
  const [activeVideo, setActiveVideo] = useState<any>(null)
  const [attachmentsModal, setAttachmentsModal] = useState<any>(null)
  const [completedItems, setCompletedItems] = useState<string[]>([])
  const topRef = useRef<HTMLDivElement>(null)

  const handleBack = () => {
    if (activeVideo) {
      setActiveVideo(null)
    } else if (activeChapter) {
      setActiveChapter(null)
    } else if (activeSubject) {
      setActiveSubject(null)
    } else {
      router.push("/dashboard/batches")
    }
  }

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
    const stored = localStorage.getItem("completed_items")
    if (stored) {
      try { setCompletedItems(JSON.parse(stored)) } catch (e) {}
    }
  }, [batchId])

  useEffect(() => {
    if (batch && isEnrolled && playVideoId && !activeVideo) {
      let foundVideo = null
      let foundChapter = null
      let foundSubject = null
      
      batch.subjects?.forEach((sub: any) => {
        sub.chapters?.forEach((ch: any) => {
          ch.videos?.forEach((vid: any) => {
            if (vid.id === playVideoId) {
              foundVideo = vid
              foundChapter = ch
              foundSubject = sub
            }
          })
        })
      })
      
      if (foundVideo) {
        setActiveSubject(foundSubject)
        setActiveChapter(foundChapter)
        setActiveVideo(foundVideo)
      }
    }
  }, [batch, isEnrolled, playVideoId])

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCompletedItems(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      localStorage.setItem("completed_items", JSON.stringify(next))
      return next
    })
  }

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
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          Loading Classroom...
        </div>
      </div>
    )
  }

  if (!batch) return <div className="min-h-screen bg-[#f8f9fa] p-8 text-center text-red-500">Batch not found.</div>

  // --- Render Layouts ---

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans" ref={topRef}>
      
      {/* Universal Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-800 tracking-tight">All Classes</h1>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for Notes" 
                className="w-64 pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all" 
              />
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <span className="text-[#5a67d8] font-bold text-xs uppercase">XP</span>
              <span className="font-semibold text-sm">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Access Barrier */}
      {!isEnrolled && (
        <div className="max-w-3xl mx-auto mt-12 p-8 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          
          {enrollmentStatus === "PENDING" ? (
            <>
              <h2 className="text-2xl font-bold text-amber-600 mb-2">Pending Approval</h2>
              <p className="text-gray-500 mb-8">Your request is waiting for admin approval.</p>
              <button disabled className="px-8 py-3 bg-amber-100 text-amber-700 font-semibold rounded-lg cursor-not-allowed">
                Awaiting Approval...
              </button>
            </>
          ) : enrollmentStatus === "REJECTED" ? (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Enrollment Rejected</h2>
              <p className="text-gray-500 mb-8">Your request to enroll was rejected.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Premium Content</h2>
              <p className="text-gray-500 mb-8">Get full access to {batch.title} for ${batch.price}.</p>
              <button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {enrolling ? "Processing..." : "Request Access"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Main UI Branches */}
      {isEnrolled && (
        <>
          {/* Level 1: Subjects View */}
          {!activeSubject && (
            <div className="bg-white min-h-[calc(100vh-64px)]">
              <div className="border-b border-gray-200">
                <div className="flex gap-8 max-w-7xl mx-auto px-6">
                  <button className="py-4 border-b-[3px] border-[#5a67d8] text-[#5a67d8] font-semibold text-sm">Subjects</button>
                  <button className="py-4 text-gray-500 font-medium text-sm hover:text-gray-800">Resources</button>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-6 py-8">
                {(!batch.subjects || batch.subjects.length === 0) ? (
                  <p className="text-gray-500">No subjects available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batch.subjects.map((subject: any) => (
                      <button 
                        key={subject.id} 
                        onClick={() => setActiveSubject(subject)} 
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#f0f4ff] text-[#5a67d8] font-bold rounded-[10px] flex items-center justify-center shrink-0">
                            {subject.name.substring(0, 2).charAt(0).toUpperCase() + subject.name.substring(1, 2).toLowerCase()}
                          </div>
                          <h3 className="font-semibold text-gray-800 text-[15px]">{subject.name}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            {(() => {
                              let total = 0
                              let completed = 0
                              subject.chapters?.forEach((ch: any) => {
                                total += (ch.videos?.length || 0) + (ch.pdfs?.length || 0)
                                ch.videos?.forEach((v: any) => { if (completedItems.includes(v.id)) completed++ })
                                ch.pdfs?.forEach((p: any) => { if (completedItems.includes(p.id)) completed++ })
                              })
                              const progress = total === 0 ? 0 : Math.round((completed / total) * 100)
                              return (
                                <>
                                  <span className="text-[11px] font-bold text-gray-500 tracking-wide">{progress} %</span>
                                  <div className="w-8 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-8 flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-gray-400 inline-flex items-center justify-center text-[8px]">i</span> 
                  Completion % depends on lecture and DPP progress!
                </p>
              </div>
            </div>
          )}

          {/* Level 2: Chapters View */}
          {activeSubject && !activeChapter && (
            <div className="bg-[#f8f9fa] min-h-[calc(100vh-64px)] pb-12">
              <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex gap-8 max-w-7xl mx-auto px-6">
                  <button className="py-4 border-b-[3px] border-[#5a67d8] text-[#5a67d8] font-semibold text-sm">Chapters</button>
                  <button className="py-4 text-gray-500 font-medium text-sm hover:text-gray-800">Study Material</button>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-6 py-8">
                {(!activeSubject.chapters || activeSubject.chapters.length === 0) ? (
                  <p className="text-gray-500">No chapters available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activeSubject.chapters.map((chapter: any, i: number) => {
                      const chNum = String(i + 1).padStart(2, '0')
                      return (
                        <button 
                          key={chapter.id} 
                          onClick={() => setActiveChapter(chapter)} 
                          className="flex flex-col p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all text-left"
                        >
                          <span className="text-[10px] font-bold text-[#5a67d8] mb-3 uppercase tracking-wider bg-[#f0f4ff] px-2 py-1 rounded">
                            CH - {chNum}
                          </span>
                          <div className="flex justify-between items-center w-full mb-3">
                            <h3 className="font-semibold text-gray-800 text-[15px] truncate pr-4">
                              Ch - {chNum} : {chapter.name}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {(() => {
                              const vidTotal = chapter.videos?.length || 0
                              const vidCompleted = chapter.videos?.filter((v:any) => completedItems.includes(v.id)).length || 0
                              const dppTotal = chapter.pdfs?.filter((p:any) => p.type === 'DPP').length || 0
                              const dppCompleted = chapter.pdfs?.filter((p:any) => p.type === 'DPP' && completedItems.includes(p.id)).length || 0
                              return `Lecture: ${vidCompleted}/${vidTotal} • DPP: ${dppCompleted}/${dppTotal}`
                            })()}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Level 3: Split Pane View */}
          {activeSubject && activeChapter && (
            <div className="flex bg-white min-h-[calc(100vh-64px)] max-w-[1400px] mx-auto border-x border-gray-200">
              
              {/* Left Sidebar: Chapters List */}
              <div className="w-72 shrink-0 border-r border-gray-200 bg-gray-50 hidden md:block overflow-y-auto max-h-[calc(100vh-64px)]">
                <div className="p-4 text-[11px] font-bold text-gray-600 uppercase tracking-widest pt-6 mb-2">
                  ALL CHAPTERS
                </div>
                {activeSubject.chapters.map((chapter: any, i: number) => {
                  const chNum = String(i + 1).padStart(2, '0')
                  const isActive = activeChapter.id === chapter.id
                  return (
                    <button 
                      key={chapter.id} 
                      onClick={() => setActiveChapter(chapter)} 
                      className={`w-full text-left p-4 flex items-start gap-3 transition-colors mb-1
                        ${isActive ? 'bg-[#f0f4ff] border-l-4 border-[#5a67d8]' : 'hover:bg-gray-100 border-l-4 border-transparent'}
                      `}
                    >
                      <span className={`text-[11px] font-bold mt-[3px] shrink-0 ${isActive ? 'text-[#5a67d8]' : 'text-gray-500'}`}>
                        CH - {chNum}
                      </span>
                      <span className={`text-[13px] leading-tight ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        Ch - {chNum} : {chapter.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Right Main Content */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)] relative">
                
                {/* Tabs */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-200 px-8 pt-6 pb-0 flex gap-8">
                  {["All", "Lectures", "DPPs", "Notes", "DPP PDFs", "DPP Videos"].map(t => {
                    const id = t.toLowerCase().replace(" ", "-")
                    const isActive = chapterTab === id
                    return (
                      <button 
                        key={id} 
                        onClick={() => setChapterTab(id)} 
                        className={`text-[13px] font-medium pb-3 border-b-2 transition-colors
                          ${isActive ? 'text-[#5a67d8] border-[#5a67d8]' : 'text-gray-500 border-transparent hover:text-gray-800'}
                        `}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>

                <div className="p-8 pb-32">
                  {/* List of Content Cards */}
                  {(() => {
                    const showLectures = chapterTab === "all" || chapterTab === "lectures"
                    const showDPPs = chapterTab === "all" || chapterTab === "dpps"
                    const showNotes = chapterTab === "all" || chapterTab === "notes"
                    
                    const dpps = activeChapter.pdfs?.filter((p:any) => p.type === "DPP") || []
                    const notes = activeChapter.pdfs?.filter((p:any) => p.type === "NOTE") || []
                    const videos = activeChapter.videos || []

                    if (!showLectures && !showDPPs && !showNotes) {
                      return <div className="text-center py-12 text-gray-500">Coming soon.</div>
                    }

                    if (showLectures && videos.length === 0 && showDPPs && dpps.length === 0 && showNotes && notes.length === 0) {
                      return <div className="text-center py-12 text-gray-500">No content uploaded here yet.</div>
                    }

                    return (
                      <div className="space-y-4">
                        {showLectures && videos.map((video: any) => {
                          const isUpcoming = video.scheduledAt && new Date(video.scheduledAt) > new Date()
                          const isCompleted = completedItems.includes(video.id)
                          return (
                            <div key={video.id} className="flex flex-col sm:flex-row gap-5 p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                              <div className="absolute -bottom-px left-5 right-5 border-b border-dashed border-gray-200 hidden group-last:block" />
                              <div className="w-full sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                                {getYoutubeThumbnail(video.youtubeId || video.videoUrl) ? (
                                  <img src={getYoutubeThumbnail(video.youtubeId || video.videoUrl)!} alt="Thumbnail" className={`w-full h-full object-cover ${isUpcoming ? 'opacity-50' : ''}`} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><Video className="w-8 h-8" /></div>
                                )}
                                <div className="absolute bottom-1.5 left-1.5 bg-[#e53935] w-5 h-5 rounded-full flex items-center justify-center shadow-sm"><Play className="w-2.5 h-2.5 text-white ml-0.5" /></div>
                                {video.duration ? <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">{formatDuration(video.duration)}</div> : null}
                                {isUpcoming && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center flex-col"><span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded">UPCOMING</span></div>}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                      <span className="text-[#5a67d8]">Lecture</span> 
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}</span>
                                    </div>
                                    <div onClick={(e) => toggleComplete(video.id, e)}>
                                      <CheckCircle2 className={`w-5 h-5 cursor-pointer transition-colors ${isCompleted ? 'text-green-500 fill-green-50' : 'text-gray-300 hover:text-green-400'}`} />
                                    </div>
                                  </div>
                                  <h4 className="text-[15px] font-semibold text-gray-900 mt-1 line-clamp-2 leading-snug">{video.title}</h4>
                                  {video.duration && <p className="text-[11px] text-gray-500 mt-1 font-medium">{Math.floor(video.duration/3600)}h:{Math.floor((video.duration%3600)/60)}m</p>}
                                </div>
                                <div className="flex gap-3 mt-4">
                                  <button onClick={() => handlePlayVideo(video)} disabled={isUpcoming} className="px-5 py-2 bg-[#f4f5f8] hover:bg-[#e2e8f0] text-gray-900 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors min-w-[110px] disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Play className="w-3.5 h-3.5 fill-current" /> Watch
                                  </button>
                                  <button onClick={() => setAttachmentsModal(video)} className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors min-w-[110px]">Notes & more</button>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {(showDPPs || showNotes) && [...dpps, ...notes].filter(p => (showDPPs && p.type === "DPP") || (showNotes && p.type === "NOTE")).map((pdf: any) => {
                          const isCompleted = completedItems.includes(pdf.id)
                          return (
                            <a key={pdf.id} href={isEnrolled ? pdf.url : "#"} target={isEnrolled ? "_blank" : undefined} rel="noreferrer" onClick={(e) => { if(!isEnrolled) { e.preventDefault(); alert("Please enroll to view."); } }} className="flex flex-col sm:flex-row gap-5 p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                              <div className="absolute -bottom-px left-5 right-5 border-b border-dashed border-gray-200 hidden group-last:block" />
                              <div className="w-full sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-blue-50 flex items-center justify-center relative">
                                <FileText className="w-10 h-10 text-blue-400" />
                                <div className="absolute bottom-1.5 left-1.5 bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                  <FileText className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                      <span className="text-blue-500">{pdf.type === "DPP" ? "DPP" : "Note"}</span> 
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span>{new Date(pdf.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div onClick={(e) => toggleComplete(pdf.id, e)}>
                                      <CheckCircle2 className={`w-5 h-5 cursor-pointer transition-colors ${isCompleted ? 'text-green-500 fill-green-50' : 'text-gray-300 hover:text-green-400'}`} />
                                    </div>
                                  </div>
                                  <h4 className="text-[15px] font-semibold text-gray-900 mt-1 line-clamp-2 leading-snug">{pdf.title}</h4>
                                </div>
                                <div className="flex gap-3 mt-4">
                                  <span className="px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors min-w-[110px]">
                                    Open Document
                                  </span>
                                </div>
                              </div>
                            </a>
                          )
                        })}

                      </div>
                    )
                  })()}
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* Fullscreen Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-[#0b1121] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent z-10 shrink-0 absolute top-0 left-0 right-0">
            <h2 className="text-white font-bold text-lg drop-shadow-md">{activeVideo.title}</h2>
            <button 
              onClick={() => setActiveVideo(null)} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Course
            </button>
          </div>
          <div className="flex-1 w-full h-full flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              <VideoPlayer 
                videoId={activeVideo.youtubeId} 
                isLive={activeVideo.videoType === "LIVE" && (!activeVideo.scheduledAt || !activeVideo.duration || new Date() < new Date(new Date(activeVideo.scheduledAt).getTime() + activeVideo.duration * 1000))} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Attachments Modal */}
      {attachmentsModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setAttachmentsModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Attachments</h3>
              <button onClick={() => setAttachmentsModal(null)} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-6">
              
              {/* NOTES */}
              {attachmentsModal.pdfs?.filter((p:any) => p.type === "NOTE").length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center justify-between">NOTES <ChevronDown className="w-4 h-4" /></h4>
                  <div className="space-y-2">
                    {attachmentsModal.pdfs.filter((p:any) => p.type === "NOTE").map((pdf:any) => (
                      <div key={pdf.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                          <p className="text-sm text-gray-700 truncate font-medium">{pdf.title}</p>
                        </div>
                        <a href={pdf.url} target="_blank" rel="noreferrer" className="shrink-0 text-gray-500 hover:text-gray-900 p-1 text-xs underline font-medium">
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DPP */}
              {attachmentsModal.pdfs?.filter((p:any) => p.type === "DPP").length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center justify-between">DPP <ChevronDown className="w-4 h-4" /></h4>
                  <div className="space-y-2">
                    {attachmentsModal.pdfs.filter((p:any) => p.type === "DPP").map((pdf:any) => (
                      <div key={pdf.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                          <p className="text-sm text-gray-700 truncate font-medium">{pdf.title}</p>
                        </div>
                        <a href={pdf.url} target="_blank" rel="noreferrer" className="shrink-0 bg-[#5a67d8] hover:bg-[#434ebc] text-white px-3 py-1.5 rounded-full flex items-center justify-center gap-1 text-[11px] font-bold transition-colors">
                          <Play className="w-2.5 h-2.5 fill-current" /> Start
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!attachmentsModal.pdfs || attachmentsModal.pdfs.length === 0) && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No attachments linked to this lecture.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
