"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, ArrowLeft, Plus, Folder, FileVideo, FileText, Link as LinkIcon, Upload as UploadIcon } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { getBatchContent, createSubject, createChapter, createVideo, createPDF } from "@/app/actions/content"
import { uploadFile } from "@/app/actions/upload"
import Link from "next/link"

export default function BatchDetailsPage() {
  const params = useParams()
  const batchId = params.id as string
  
  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Dialog states
  const [isSubjectOpen, setIsSubjectOpen] = useState(false)
  const [isChapterOpen, setIsChapterOpen] = useState(false)
  
  // Resource Modal States
  const [resourceModal, setResourceModal] = useState<{isOpen: boolean, type: "VIDEO" | "NOTE" | "DPP"}>({isOpen: false, type: "VIDEO"})
  const [sourceType, setSourceType] = useState<"LINK" | "UPLOAD">("LINK")
  const [selectedChapterId, setSelectedChapterId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")

  const fetchContent = async () => {
    setLoading(true)
    const res = await getBatchContent(batchId)
    if (res.success && res.data) {
      setBatch(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContent()
  }, [batchId])

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const name = new FormData(e.currentTarget).get("name") as string
    const res = await createSubject(batchId, name)
    if (res.success) {
      setIsSubjectOpen(false)
      fetchContent()
    }
    setSubmitting(false)
  }

  const handleAddChapter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const name = new FormData(e.currentTarget).get("name") as string
    const res = await createChapter(selectedSubjectId, name, batchId)
    if (res.success) {
      setIsChapterOpen(false)
      fetchContent()
    }
    setSubmitting(false)
  }

  const handleAddResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append("chapterId", selectedChapterId)
    formData.append("type", resourceModal.type)

    // Handle Upload First if necessary
    if (sourceType === "UPLOAD") {
      const file = formData.get("file") as File
      if (file && file.size > 0) {
        const uploadRes = await uploadFile(formData)
        if (uploadRes.success && uploadRes.url) {
          if (resourceModal.type === "VIDEO") {
            formData.append("videoUrl", uploadRes.url)
          } else {
            formData.append("url", uploadRes.url)
          }
        } else {
          alert("File upload failed.")
          setSubmitting(false)
          return
        }
      } else {
        alert("Please select a file to upload.")
        setSubmitting(false)
        return
      }
    }

    // Create Resource in DB
    let res
    if (resourceModal.type === "VIDEO") {
      res = await createVideo(formData)
    } else {
      res = await createPDF(formData)
    }

    if (res.success) {
      setResourceModal({ ...resourceModal, isOpen: false })
      fetchContent()
    } else {
      alert("Failed to create resource.")
    }
    
    setSubmitting(false)
  }

  const openChapterModal = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setIsChapterOpen(true)
  }

  const openResourceModal = (chapterId: string, type: "VIDEO" | "NOTE" | "DPP") => {
    setSelectedChapterId(chapterId)
    setResourceModal({ isOpen: true, type })
    setSourceType("LINK")
  }

  if (loading) return <div className="p-8 text-center">Loading batch data...</div>
  if (!batch) return <div className="p-8 text-center text-destructive">Batch not found.</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/batches">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{batch.title}</h1>
            <p className="text-muted-foreground mt-1">Manage Syllabus and Content Hierarchy</p>
          </div>
        </div>
        <Button onClick={() => setIsSubjectOpen(true)} className="gap-2">
          <Folder className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      {/* Syllabus Tree */}
      <div className="space-y-6">
        {batch.subjects?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-md bg-muted/20">
            No subjects added yet. Click "Add Subject" to start building the syllabus.
          </div>
        ) : (
          batch.subjects.map((subject: any) => (
            <Card key={subject.id} className="border-l-4 border-l-primary shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-muted/30">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Folder className="w-5 h-5 text-primary" />
                  {subject.name}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => openChapterModal(subject.id)} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Chapter
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {subject.chapters?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No chapters in this subject.</p>
                ) : (
                  <div className="space-y-4">
                    {subject.chapters.map((chapter: any) => (
                      <div key={chapter.id} className="border rounded-md overflow-hidden bg-card">
                        <div className="bg-muted/50 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b gap-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <BookIcon />
                            {chapter.name}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => openResourceModal(chapter.id, "VIDEO")}>
                              <Play className="w-3 h-3 text-red-500" /> Video
                            </Button>
                            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => openResourceModal(chapter.id, "NOTE")}>
                              <FileText className="w-3 h-3 text-blue-500" /> Note
                            </Button>
                            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => openResourceModal(chapter.id, "DPP")}>
                              <FileText className="w-3 h-3 text-purple-500" /> DPP
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-background">
                          {(!chapter.videos?.length && !chapter.pdfs?.length) ? (
                            <p className="text-xs text-muted-foreground italic">No resources added to this chapter yet.</p>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {/* Render Videos */}
                              {chapter.videos?.map((video: any) => (
                                <div key={`vid-${video.id}`} className="flex gap-3 p-2 border rounded hover:bg-muted/30 transition-colors">
                                  <div className="w-20 h-14 bg-muted rounded overflow-hidden shrink-0 relative flex items-center justify-center">
                                    {video.youtubeId ? (
                                      <img src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`} className="w-full h-full object-cover" />
                                    ) : (
                                      <FileVideo className="w-5 h-5 text-red-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                                    <p className="text-xs text-red-500 mt-0.5 font-medium">Video</p>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Render PDFs (Notes & DPPs) */}
                              {chapter.pdfs?.map((pdf: any) => (
                                <div key={`pdf-${pdf.id}`} className="flex gap-3 p-2 border rounded hover:bg-muted/30 transition-colors items-center">
                                  <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0
                                    ${pdf.type === "DPP" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"}
                                  `}>
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{pdf.title}</p>
                                    <p className={`text-xs mt-0.5 font-medium ${pdf.type === "DPP" ? "text-purple-500" : "text-blue-500"}`}>
                                      {pdf.type === "DPP" ? "Practice Problem" : "Class Note"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Subject Modal */}
      <Dialog isOpen={isSubjectOpen} onClose={() => setIsSubjectOpen(false)} title="Add New Subject">
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject Name</Label>
            <Input id="subjectName" name="name" required placeholder="e.g. Physics" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsSubjectOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Subject"}</Button>
          </div>
        </form>
      </Dialog>

      {/* Chapter Modal */}
      <Dialog isOpen={isChapterOpen} onClose={() => setIsChapterOpen(false)} title="Add New Chapter">
        <form onSubmit={handleAddChapter} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapterName">Chapter Name</Label>
            <Input id="chapterName" name="name" required placeholder="e.g. Thermodynamics" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsChapterOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Chapter"}</Button>
          </div>
        </form>
      </Dialog>

      {/* Unified Resource Modal */}
      <Dialog 
        isOpen={resourceModal.isOpen} 
        onClose={() => setResourceModal({ ...resourceModal, isOpen: false })} 
        title={`Add ${resourceModal.type === "VIDEO" ? "Video Lecture" : resourceModal.type === "NOTE" ? "Class Note" : "Daily Practice Problem (DPP)"}`}
      >
        <form onSubmit={handleAddResource} className="space-y-4">
          
          <div className="grid grid-cols-2 p-1 bg-muted rounded-md mb-4">
            <button 
              type="button" 
              onClick={() => setSourceType("LINK")}
              className={`py-1.5 text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors ${sourceType === "LINK" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LinkIcon className="w-4 h-4" /> Link
            </button>
            <button 
              type="button" 
              onClick={() => setSourceType("UPLOAD")}
              className={`py-1.5 text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors ${sourceType === "UPLOAD" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UploadIcon className="w-4 h-4" /> Upload
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resTitle">Title</Label>
            <Input id="resTitle" name="title" required placeholder={`Enter ${resourceModal.type.toLowerCase()} title...`} />
          </div>

          {sourceType === "LINK" ? (
            <div className="space-y-2">
              <Label htmlFor="resLink">{resourceModal.type === "VIDEO" ? "YouTube ID" : "External URL"}</Label>
              <Input 
                id="resLink" 
                name={resourceModal.type === "VIDEO" ? "youtubeId" : "url"} 
                required 
                placeholder={resourceModal.type === "VIDEO" ? "e.g. dQw4w9WgXcQ" : "https://example.com/file.pdf"} 
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="resFile">Select File</Label>
              <Input 
                id="resFile" 
                name="file" 
                type="file" 
                required 
                accept={resourceModal.type === "VIDEO" ? "video/mp4,video/webm" : "application/pdf"}
                className="cursor-pointer"
              />
            </div>
          )}

          {resourceModal.type === "VIDEO" && (
            <div className="space-y-2">
              <Label htmlFor="videoDesc">Description (Optional)</Label>
              <Input id="videoDesc" name="description" placeholder="Optional notes..." />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setResourceModal({ ...resourceModal, isOpen: false })}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Processing..." : `Add ${resourceModal.type}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
  )
}
