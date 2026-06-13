"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Play, FileVideo, FileText, Edit, Trash2,
  Link as LinkIcon, Upload as UploadIcon,
  ChevronRight, ChevronDown, Plus, BookOpen, Layers, Clock, EyeOff, Eye,
} from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import {
  getBatchContent,
  createSubject, updateSubject, deleteSubject,
  createChapter, updateChapter, deleteChapter,
  createVideo, updateVideo, deleteVideo, toggleVideoPublished,
  createPDF, updatePDF, deletePDF,
} from "@/app/actions/content"
import { uploadFile } from "@/app/actions/upload"

export default function BatchDetailsPage() {
  const params = useParams()
  const batchId = params.id as string

  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Navigation state
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())

  // Add modals
  const [isSubjectOpen, setIsSubjectOpen] = useState(false)
  const [isChapterOpen, setIsChapterOpen] = useState(false)
  const [addChapterSubjectId, setAddChapterSubjectId] = useState("")
  const [resourceModal, setResourceModal] = useState<{ isOpen: boolean; type: "VIDEO" | "NOTE" | "DPP" }>({ isOpen: false, type: "VIDEO" })
  const [sourceType, setSourceType] = useState<"LINK" | "UPLOAD">("LINK")
  const [videoUploadMode, setVideoUploadMode] = useState<"NORMAL" | "SCHEDULED" | "LIVE">("NORMAL")

  // Edit / delete modals
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null)
  const [editingChapter, setEditingChapter] = useState<any>(null)
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)
  const [editingPDF, setEditingPDF] = useState<any>(null)
  const [deletingPDFId, setDeletingPDFId] = useState<string | null>(null)

  const fetchContent = async () => {
    setLoading(true)
    const res = await getBatchContent(batchId, true)
    if (res.success && res.data) {
      setBatch(res.data)
      // Auto-expand first subject and select first chapter
      if (res.data.subjects?.length > 0 && expandedSubjects.size === 0) {
        const firstSubject = res.data.subjects[0]
        setExpandedSubjects(new Set([firstSubject.id]))
        if (firstSubject.chapters?.length > 0) {
          setSelectedChapterId(firstSubject.chapters[0].id)
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchContent() }, [batchId])

  // Derived: selected chapter data
  const selectedChapter = batch?.subjects
    ?.flatMap((s: any) => s.chapters)
    ?.find((c: any) => c.id === selectedChapterId)

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev)
      next.has(subjectId) ? next.delete(subjectId) : next.add(subjectId)
      return next
    })
  }

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const name = new FormData(e.currentTarget).get("name") as string
    const res = await createSubject(batchId, name)
    if (res.success) { setIsSubjectOpen(false); fetchContent() }
    setSubmitting(false)
  }

  const handleAddChapter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const name = new FormData(e.currentTarget).get("name") as string
    const res = await createChapter(addChapterSubjectId, name, batchId)
    if (res.success) { setIsChapterOpen(false); fetchContent() }
    setSubmitting(false)
  }

  const handleAddResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append("chapterId", selectedChapterId!)
    formData.append("type", resourceModal.type)

    // For scheduled/live videos without a file, skip upload check
    const isScheduledVideo = resourceModal.type === "VIDEO" && (videoUploadMode === "SCHEDULED" || videoUploadMode === "LIVE")

    if (sourceType === "UPLOAD" && !isScheduledVideo) {
      const file = formData.get("file") as File
      if (file && file.size > 0) {
        const uploadRes = await uploadFile(formData)
        if (uploadRes.success && uploadRes.url) {
          resourceModal.type === "VIDEO"
            ? formData.append("videoUrl", uploadRes.url)
            : formData.append("url", uploadRes.url)
        } else { alert("File upload failed."); setSubmitting(false); return }
      } else { alert("Please select a file to upload."); setSubmitting(false); return }
    } else if (sourceType === "UPLOAD" && isScheduledVideo) {
      // Scheduled video — try upload if file selected, otherwise skip
      const file = formData.get("file") as File
      if (file && file.size > 0) {
        const uploadRes = await uploadFile(formData)
        if (uploadRes.success && uploadRes.url) {
          formData.append("videoUrl", uploadRes.url)
        }
      }
    }

    if (resourceModal.type === "VIDEO") {
      formData.append("videoType", videoUploadMode === "LIVE" ? "LIVE" : "RECORDED")
      if (videoUploadMode === "SCHEDULED" || videoUploadMode === "LIVE") {
        formData.set("isPublished", "false") // Keep hidden until live/scheduled
      } else {
        formData.set("isPublished", "true")
      }
    }

    const res = resourceModal.type === "VIDEO" ? await createVideo(formData) : await createPDF(formData)
    if (res.success) {
      setResourceModal({ ...resourceModal, isOpen: false })
      setVideoUploadMode("NORMAL")
      fetchContent()
    } else {
      alert("Error: " + (res.error || "Failed to create resource"))
    }
    setSubmitting(false)
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  if (!batch) return <div className="p-8 text-center text-destructive">Batch not found.</div>

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
        <div>
          <h1 className="text-xl font-bold">{batch.name}</h1>
          <p className="text-xs text-muted-foreground">{batch.description}</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setIsSubjectOpen(true)}>
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {/* ── Two Panel Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-64 shrink-0 border-r bg-muted/30 overflow-y-auto flex flex-col">
          {batch.subjects?.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground text-center mt-4">
              No subjects yet.<br />Click &quot;Add Subject&quot; to start.
            </div>
          ) : (
            <nav className="py-2">
              {batch.subjects.map((subject: any) => (
                <div key={subject.id}>
                  {/* Subject Row */}
                  <div className="group flex items-center gap-1 px-3 py-2 hover:bg-muted/60 cursor-pointer select-none">
                    <button
                      className="flex items-center gap-1 flex-1 min-w-0 text-left"
                      onClick={() => toggleSubject(subject.id)}
                    >
                      {expandedSubjects.has(subject.id)
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      }
                      <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-sm font-semibold truncate">{subject.name}</span>
                    </button>
                    {/* Subject actions — show on hover */}
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                      <button
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => { setAddChapterSubjectId(subject.id); setExpandedSubjects(prev => new Set([...prev, subject.id])); setIsChapterOpen(true) }}
                        title="Add Chapter"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingSubject(subject)}
                        title="Edit Subject"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
                        onClick={() => setDeletingSubjectId(subject.id)}
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Chapter Rows */}
                  {expandedSubjects.has(subject.id) && (
                    <div>
                      {subject.chapters?.map((chapter: any) => {
                        const isSelected = selectedChapterId === chapter.id
                        const resourceCount = (chapter.videos?.length || 0) + (chapter.pdfs?.length || 0)
                        return (
                          <div
                            key={chapter.id}
                            className={`group flex items-center gap-1 pl-7 pr-2 py-1.5 cursor-pointer select-none transition-colors
                              ${isSelected ? "bg-primary/10 text-primary border-r-2 border-primary" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
                            onClick={() => setSelectedChapterId(chapter.id)}
                          >
                            <BookOpen className="w-3 h-3 shrink-0" />
                            <span className="text-xs flex-1 truncate">{chapter.name}</span>
                            {resourceCount > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0
                                ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {resourceCount}
                              </span>
                            )}
                            {/* Chapter hover actions */}
                            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
                              <button
                                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={(e) => { e.stopPropagation(); setEditingChapter(chapter) }}
                                title="Edit Chapter"
                              >
                                <Edit className="w-2.5 h-2.5" />
                              </button>
                              <button
                                className="p-0.5 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
                                onClick={(e) => { e.stopPropagation(); setDeletingChapterId(chapter.id) }}
                                title="Delete Chapter"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      {/* Add Chapter inline button */}
                      <button
                        className="flex items-center gap-1.5 pl-7 pr-3 py-1.5 w-full text-left text-xs text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors"
                        onClick={() => { setAddChapterSubjectId(subject.id); setIsChapterOpen(true) }}
                      >
                        <Plus className="w-3 h-3" /> Add chapter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 overflow-y-auto bg-background">
          {!selectedChapterId || !selectedChapter ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 p-8">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p className="text-sm">Select a chapter from the sidebar<br />to manage its content</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Chapter header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold">{selectedChapter.name}</h2>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setResourceModal({ isOpen: true, type: "VIDEO" })}>
                    <Play className="w-3.5 h-3.5" /> Add Video
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => setResourceModal({ isOpen: true, type: "NOTE" })}>
                    <FileText className="w-3.5 h-3.5" /> Add Note
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => setResourceModal({ isOpen: true, type: "DPP" })}>
                    <FileText className="w-3.5 h-3.5" /> Add DPP
                  </Button>
                </div>
              </div>

              {/* Empty state */}
              {!selectedChapter.videos?.length && !selectedChapter.pdfs?.length ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <Play className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No resources yet. Add a Video, Note or DPP above.</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Videos section */}
                  {selectedChapter.videos?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Play className="w-4 h-4 text-red-500" /> Videos ({selectedChapter.videos.length})
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedChapter.videos.map((video: any) => {
                          const isActive = video.isPublished !== false
                          const isUpcoming = !isActive && video.scheduledAt && new Date(video.scheduledAt) > new Date()
                          const isLive = video.videoType === "LIVE"
                          
                          return (
                          <div key={video.id} className={`flex gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow bg-card relative overflow-hidden`}>
                            {/* Status strip on left edge */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                              isActive ? "bg-green-500" : isUpcoming ? "bg-amber-400" : "bg-slate-400"
                            }`} />
                            <div className="w-20 h-14 bg-muted rounded-md overflow-hidden shrink-0 flex items-center justify-center relative ml-1">
                              {video.youtubeId ? (
                                <img src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`} className="w-full h-full object-cover" alt={video.title} />
                              ) : (
                                <FileVideo className="w-5 h-5 text-red-400" />
                              )}
                              {!isActive && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  {isUpcoming ? <Clock className="w-4 h-4 text-amber-300" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                  isActive
                                    ? "bg-green-100 text-green-700"
                                    : isUpcoming ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {isActive ? "● ACTIVE" : isUpcoming ? "◐ UPCOMING" : "⊘ INACTIVE"}
                                </span>
                                {isLive && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 bg-red-100 text-red-700">
                                    LIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                              {video.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{video.description}</p>}
                              {video.scheduledAt && (
                                <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(video.scheduledAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              {/* Quick Activate / Deactivate */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-7 w-7 p-0 ${
                                  isActive
                                    ? "text-green-600 hover:bg-red-50 hover:text-red-600"
                                    : "text-amber-500 hover:bg-green-50 hover:text-green-600"
                                }`}
                                title={isActive ? "Deactivate (hide from students)" : "Activate (show to students)"}
                                onClick={async () => {
                                  await toggleVideoPublished(video.id, !isActive, batchId)
                                  fetchContent()
                                }}
                              >
                                {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingVideo({ ...video, batchId })}>
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeletingVideoId(video.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes section */}
                  {selectedChapter.pdfs?.filter((p: any) => p.type === "NOTE").length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" /> Class Notes ({selectedChapter.pdfs.filter((p: any) => p.type === "NOTE").length})
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedChapter.pdfs.filter((p: any) => p.type === "NOTE").map((pdf: any) => (
                          <div key={pdf.id} className="flex gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow bg-card items-center">
                            <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2">{pdf.title}</p>
                              <p className="text-xs text-blue-500 font-medium mt-0.5">Class Note</p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingPDF({ ...pdf, batchId })}>
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeletingPDFId(pdf.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DPP section */}
                  {selectedChapter.pdfs?.filter((p: any) => p.type === "DPP").length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-500" /> Practice Problems / DPP ({selectedChapter.pdfs.filter((p: any) => p.type === "DPP").length})
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedChapter.pdfs.filter((p: any) => p.type === "DPP").map((pdf: any) => (
                          <div key={pdf.id} className="flex gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow bg-card items-center">
                            <div className="w-10 h-10 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2">{pdf.title}</p>
                              <p className="text-xs text-purple-500 font-medium mt-0.5">Practice Problem</p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingPDF({ ...pdf, batchId })}>
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeletingPDFId(pdf.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════ DIALOGS ════════ */}

      {/* Add Subject */}
      <Dialog isOpen={isSubjectOpen} onClose={() => setIsSubjectOpen(false)} title="Add New Subject">
        <div className="p-4 space-y-4">
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input id="subjectName" name="name" required placeholder="e.g. Physics" autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsSubjectOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Subject"}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Add Chapter */}
      <Dialog isOpen={isChapterOpen} onClose={() => setIsChapterOpen(false)} title="Add New Chapter">
        <div className="p-4 space-y-4">
          <form onSubmit={handleAddChapter} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapterName">Chapter Name</Label>
              <Input id="chapterName" name="name" required placeholder="e.g. Thermodynamics" autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsChapterOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Chapter"}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit Subject */}
      <Dialog isOpen={!!editingSubject} onClose={() => setEditingSubject(null)} title="Edit Subject">
        <div className="p-4">
          <form onSubmit={async (e) => {
            e.preventDefault(); setSubmitting(true)
            const name = new FormData(e.currentTarget).get("name") as string
            const res = await updateSubject(editingSubject.id, name, batchId)
            if (res.success) { setEditingSubject(null); fetchContent() } else alert(res.error)
            setSubmitting(false)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSubjectName">Subject Name</Label>
              <Input id="editSubjectName" name="name" required defaultValue={editingSubject?.name} autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Subject */}
      <Dialog isOpen={!!deletingSubjectId} onClose={() => setDeletingSubjectId(null)} title="Delete Subject">
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">This will permanently delete the subject and <strong>all chapters and resources</strong> inside it.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingSubjectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              const res = await deleteSubject(deletingSubjectId!, batchId)
              if (res.success) { setDeletingSubjectId(null); fetchContent() } else alert(res.error)
            }}>Delete</Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Chapter */}
      <Dialog isOpen={!!editingChapter} onClose={() => setEditingChapter(null)} title="Edit Chapter">
        <div className="p-4">
          <form onSubmit={async (e) => {
            e.preventDefault(); setSubmitting(true)
            const name = new FormData(e.currentTarget).get("name") as string
            const res = await updateChapter(editingChapter.id, name, batchId)
            if (res.success) { setEditingChapter(null); fetchContent() } else alert(res.error)
            setSubmitting(false)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editChapterName">Chapter Name</Label>
              <Input id="editChapterName" name="name" required defaultValue={editingChapter?.name} autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingChapter(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Chapter */}
      <Dialog isOpen={!!deletingChapterId} onClose={() => setDeletingChapterId(null)} title="Delete Chapter">
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">This will permanently delete the chapter and <strong>all videos, notes and DPPs</strong> inside it.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingChapterId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              const res = await deleteChapter(deletingChapterId!, batchId)
              if (res.success) {
                if (selectedChapterId === deletingChapterId) setSelectedChapterId(null)
                setDeletingChapterId(null); fetchContent()
              } else alert(res.error)
            }}>Delete</Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Video */}
      <Dialog isOpen={!!editingVideo} onClose={() => setEditingVideo(null)} title="Edit Video">
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <form onSubmit={async (e) => {
            e.preventDefault(); setSubmitting(true)
            const formData = new FormData(e.currentTarget)
            formData.append("batchId", batchId)
            const res = await updateVideo(editingVideo.id, formData)
            if (res.success) { setEditingVideo(null); fetchContent() } else alert(res.error)
            setSubmitting(false)
          }} className="space-y-4">

            {/* Status toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">Video Status</p>
                <p className="text-xs text-muted-foreground">Control if students can see this video</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isPublished"
                    value="true"
                    defaultChecked={editingVideo?.isPublished !== false}
                    className="accent-green-500"
                  />
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isPublished"
                    value="false"
                    defaultChecked={editingVideo?.isPublished === false}
                    className="accent-amber-500"
                  />
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">Inactive</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editVideoTitle">Title</Label>
              <Input id="editVideoTitle" name="title" required defaultValue={editingVideo?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editVideoDesc">Description</Label>
              <Input id="editVideoDesc" name="description" defaultValue={editingVideo?.description} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editYoutubeId">YouTube ID</Label>
              <Input id="editYoutubeId" name="youtubeId" defaultValue={editingVideo?.youtubeId} placeholder="e.g. dQw4w9WgXcQ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editVideoUrl">Video URL</Label>
              <Input id="editVideoUrl" name="videoUrl" defaultValue={editingVideo?.videoUrl} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDuration">Duration (in minutes)</Label>
              <Input id="editDuration" name="duration" type="number" min="0" placeholder="e.g. 120" defaultValue={editingVideo?.duration ? Math.round(editingVideo.duration / 60) : ""} />
            </div>

            {/* Schedule section */}
            <div className="space-y-2 border rounded-lg p-3 bg-amber-50/50 border-amber-200">
              <Label htmlFor="editVideoType" className="text-amber-800 flex items-center gap-1.5">
                Video Type
              </Label>
              <select 
                id="editVideoType" 
                name="videoType" 
                defaultValue={editingVideo?.videoType || "RECORDED"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-amber-300 focus-visible:ring-amber-400"
              >
                <option value="RECORDED">Recorded</option>
                <option value="LIVE">Live Stream</option>
              </select>

              <Label htmlFor="editScheduledAt" className="text-amber-800 flex items-center gap-1.5 mt-3">
                <Clock className="w-3.5 h-3.5" /> Scheduled Date &amp; Time
                <span className="text-xs text-muted-foreground font-normal ml-1">(leave blank to unschedule)</span>
              </Label>
              <Input
                id="editScheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={editingVideo?.scheduledAt
                  ? new Date(new Date(editingVideo.scheduledAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
                  : ""}
                className="border-amber-300 focus-visible:ring-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingVideo(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Video */}
      <Dialog isOpen={!!deletingVideoId} onClose={() => setDeletingVideoId(null)} title="Delete Video">
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this video? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingVideoId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              const res = await deleteVideo(deletingVideoId!, batchId)
              if (res.success) { setDeletingVideoId(null); fetchContent() } else alert(res.error)
            }}>Delete</Button>
          </div>
        </div>
      </Dialog>

      {/* Edit PDF */}
      <Dialog isOpen={!!editingPDF} onClose={() => setEditingPDF(null)} title="Edit Document">
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <form onSubmit={async (e) => {
            e.preventDefault(); setSubmitting(true)
            const formData = new FormData(e.currentTarget)
            formData.append("batchId", batchId)
            const res = await updatePDF(editingPDF.id, formData)
            if (res.success) { setEditingPDF(null); fetchContent() } else alert(res.error)
            setSubmitting(false)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdfTitle">Title</Label>
              <Input id="pdfTitle" name="title" required defaultValue={editingPDF?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfType">Type</Label>
              <select id="pdfType" name="type" defaultValue={editingPDF?.type} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="NOTE">Class Note</option>
                <option value="DPP">Practice Problem</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfUrl">URL</Label>
              <Input id="pdfUrl" name="url" required defaultValue={editingPDF?.url} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfVideoIdEdit">Attach to Lecture (Optional)</Label>
              <select id="pdfVideoIdEdit" name="videoId" defaultValue={editingPDF?.videoId || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">None (Chapter Level)</option>
                {selectedChapter?.videos?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingPDF(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete PDF */}
      <Dialog isOpen={!!deletingPDFId} onClose={() => setDeletingPDFId(null)} title="Delete Document">
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this document? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingPDFId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              const res = await deletePDF(deletingPDFId!, batchId)
              if (res.success) { setDeletingPDFId(null); fetchContent() } else alert(res.error)
            }}>Delete</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={resourceModal.isOpen}
        onClose={() => { setResourceModal({ ...resourceModal, isOpen: false }); setVideoUploadMode("NORMAL") }}
        title={`Add ${resourceModal.type === "VIDEO" ? "Video Lecture" : resourceModal.type === "NOTE" ? "Class Note" : "Daily Practice Problem"}`}
      >
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <form onSubmit={handleAddResource} className="space-y-4">
            {/* Link / Upload toggle */}
            <div className="grid grid-cols-2 p-1 bg-muted rounded-md">
              <button type="button" onClick={() => setSourceType("LINK")}
                className={`py-1.5 text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors
                  ${sourceType === "LINK" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}>
                <LinkIcon className="w-4 h-4" /> Link
              </button>
              <button type="button" onClick={() => setSourceType("UPLOAD")}
                className={`py-1.5 text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors
                  ${sourceType === "UPLOAD" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}>
                <UploadIcon className="w-4 h-4" /> Upload
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resTitle">Title</Label>
              <Input id="resTitle" name="title" required placeholder="Enter title..." autoFocus />
            </div>

            {sourceType === "LINK" ? (
              <div className="space-y-2">
                <Label htmlFor="resLink">
                  {resourceModal.type === "VIDEO" ? "YouTube ID or URL" : "External URL"}
                  {resourceModal.type === "VIDEO" && videoUploadMode !== "NORMAL" && (
                    <span className="ml-1 text-xs text-amber-600 font-normal">(optional for scheduled/live)</span>
                  )}
                </Label>
                <Input
                  id="resLink"
                  name={resourceModal.type === "VIDEO" ? "youtubeId" : "url"}
                  required={!(resourceModal.type === "VIDEO" && videoUploadMode !== "NORMAL")}
                  placeholder={resourceModal.type === "VIDEO" ? "e.g. dQw4w9WgXcQ" : "https://example.com/file.pdf"}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="resFile">
                  Select File
                  {resourceModal.type === "VIDEO" && videoUploadMode !== "NORMAL" && (
                    <span className="ml-1 text-xs text-amber-600 font-normal">(optional for scheduled/live)</span>
                  )}
                </Label>
                <Input id="resFile" name="file" type="file"
                  required={!(resourceModal.type === "VIDEO" && videoUploadMode !== "NORMAL")}
                  accept={resourceModal.type === "VIDEO" ? "video/mp4,video/webm" : "application/pdf"}
                  className="cursor-pointer" />
              </div>
            )}
            
            {resourceModal.type !== "VIDEO" && selectedChapter && (
              <div className="space-y-2">
                <Label htmlFor="pdfVideoId">Attach to Lecture (Optional)</Label>
                <select id="pdfVideoId" name="videoId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None (Chapter Level)</option>
                  {selectedChapter.videos?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>
            )}
            
            {resourceModal.type === "VIDEO" && (
              <div className="space-y-2">
                <Label htmlFor="resDuration">Duration (in minutes)</Label>
                <Input id="resDuration" name="duration" type="number" min="0" placeholder="e.g. 120" />
              </div>
            )}

            {resourceModal.type === "VIDEO" && (
              <div className="space-y-2">
                <Label htmlFor="videoDescAdd">Description (Optional)</Label>
                <Input id="videoDescAdd" name="description" placeholder="Optional notes..." />
              </div>
            )}

            {/* ── Schedule Section (Videos only) ── */}
            {resourceModal.type === "VIDEO" && (
              <div className="border rounded-lg p-3 space-y-3 bg-amber-50/50 border-amber-200">
                <Label htmlFor="videoUploadMode" className="text-amber-800">Upload Mode</Label>
                <select
                  id="videoUploadMode"
                  value={videoUploadMode}
                  onChange={(e) => setVideoUploadMode(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-amber-400 border-amber-300"
                >
                  <option value="NORMAL">Normal (Direct Add)</option>
                  <option value="SCHEDULED">Schedule as Upcoming</option>
                  <option value="LIVE">Live Stream</option>
                </select>

                {videoUploadMode !== "NORMAL" && (
                  <div className="space-y-2 pt-1 border-t border-amber-200/50 mt-2">
                    <Label htmlFor="scheduledAt" className="text-xs text-amber-700">Scheduled Date &amp; Time</Label>
                    <Input
                      id="scheduledAt"
                      name="scheduledAt"
                      type="datetime-local"
                      required
                      className="border-amber-300 focus-visible:ring-amber-400"
                    />
                    <p className="text-xs text-amber-600">Students will see this as &quot;Upcoming&quot; until it goes live.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setResourceModal({ ...resourceModal, isOpen: false }); setVideoUploadMode("NORMAL") }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing..." : `Add ${resourceModal.type}`}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  )
}
