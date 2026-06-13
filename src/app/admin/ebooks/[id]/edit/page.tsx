"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Link as LinkIcon, Upload, X } from "lucide-react"
import { updateEbook, getEbook } from "@/app/actions/ebook"
import { getCategories } from "@/app/actions/category"

export default function EditEbookPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Categories Data
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [chapterName, setChapterName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  
  // Tag selections
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedBoards, setSelectedBoards] = useState<string[]>([])
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  
  const [description, setDescription] = useState("")
  
  // File Info
  const [sourceType, setSourceType] = useState("URL") // URL or UPLOAD
  const [fileUrl, setFileUrl] = useState("")
  const [pageCount, setPageCount] = useState("")
  const [fileSize, setFileSize] = useState("")
  
  const [status, setStatus] = useState("Active")

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await getCategories()
      if (catRes.success && catRes.data) {
        setCategories(catRes.data)
      }
      
      const ebookRes = await getEbook(params.id as string)
      if (ebookRes.success && ebookRes.data) {
        const ebook = ebookRes.data
        setTitle(ebook.title)
        setChapterName(ebook.chapterName || "")
        setCategoryId(ebook.categoryId)
        setDescription(ebook.description || "")
        setSourceType(ebook.sourceType)
        setFileUrl(ebook.fileUrl)
        setPageCount(ebook.pageCount?.toString() || "")
        setFileSize(ebook.fileSize || "")
        setStatus(ebook.status)
        
        try { setSelectedSubjects(JSON.parse(ebook.subjects)) } catch(e){}
        try { setSelectedBoards(JSON.parse(ebook.boards)) } catch(e){}
        try { setSelectedExams(JSON.parse(ebook.exams)) } catch(e){}
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  // When category changes, find the full category object to populate the multi-select options
  // But don't reset selections if we just loaded the initial data
  useEffect(() => {
    if (categoryId) {
      const cat = categories.find(c => c.id === categoryId)
      setSelectedCategory(cat || null)
    } else {
      setSelectedCategory(null)
    }
  }, [categoryId, categories])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value)
    setSelectedSubjects([])
    setSelectedBoards([])
    setSelectedExams([])
  }

  // Helpers to parse the arrays from the category object
  const getCatArray = (jsonStr?: string) => {
    if (!jsonStr) return []
    try {
      const arr = JSON.parse(jsonStr)
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value)
    setter(values)
  }

  const handleUpdate = async () => {
    if (!title.trim() || !categoryId || !fileUrl.trim()) {
      alert("Please fill in all required fields (Title, Category, File URL)")
      return
    }

    setSaving(true)
    const res = await updateEbook(params.id as string, {
      title,
      chapterName,
      categoryId,
      subjects: JSON.stringify(selectedSubjects),
      boards: JSON.stringify(selectedBoards),
      exams: JSON.stringify(selectedExams),
      description,
      sourceType,
      fileUrl,
      pageCount: pageCount ? parseInt(pageCount) : undefined,
      fileSize,
      status
    })

    if (res.success) {
      alert("Ebook updated successfully!")
      router.push('/admin/ebooks')
    } else {
      alert("Error updating ebook")
    }
    setSaving(false)
  }

  const availableSubjects = getCatArray(selectedCategory?.subjects)
  const availableBoards = getCatArray(selectedCategory?.boards)
  const availableExams = getCatArray(selectedCategory?.exams)

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ebook data...</div>

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> Ebooks <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">Edit Ebook</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Edit Ebook</h1>
        <button onClick={() => router.push('/admin/ebooks')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Basic Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ebook Title <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter ebook title" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chapter Name (Optional)</label>
              <input type="text" value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="Enter chapter name" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-blue-100 space-y-6 relative overflow-hidden">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"></div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category Assignment <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-500">Assign category, subject, board, and exam for filtering.</p>
                <select value={categoryId} onChange={handleCategoryChange} className="w-full border border-blue-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-blue-800 bg-white shadow-sm font-medium">
                  <option value="">Select a Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {categoryId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <select multiple value={selectedSubjects} onChange={(e) => handleMultiSelectChange(e, setSelectedSubjects)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[100px] bg-white">
                      {availableSubjects.map((s: string, i: number) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-400">Hold Ctrl (Cmd on Mac) to select multiple</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Board</label>
                    <select multiple value={selectedBoards} onChange={(e) => handleMultiSelectChange(e, setSelectedBoards)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[100px] bg-white">
                      {availableBoards.map((s: string, i: number) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-400">Hold Ctrl (Cmd on Mac) to select multiple</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Exam</label>
                    <select multiple value={selectedExams} onChange={(e) => handleMultiSelectChange(e, setSelectedExams)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[100px] bg-white">
                      {availableExams.map((s: string, i: number) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-400">Hold Ctrl (Cmd on Mac) to select multiple</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Enter ebook description" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"></textarea>
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"></div>
          
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">File Information</h3>
          </div>
          <div className="p-6">
            <div className="flex border-b border-gray-200 mb-6">
              <button onClick={() => setSourceType('UPLOAD')} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${sourceType === 'UPLOAD' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Upload className="w-4 h-4" /> Upload File
              </button>
              <button onClick={() => setSourceType('URL')} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${sourceType === 'URL' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <LinkIcon className="w-4 h-4" /> External URL
              </button>
            </div>

            {sourceType === 'URL' && (
              <div className="space-y-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">External URL <span className="text-red-500">*</span></label>
                  <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://example.com/ebook.pdf" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-gray-400">Enter the URL where the ebook is hosted</p>
                </div>
              </div>
            )}

            {sourceType === 'UPLOAD' && (
              <div className="space-y-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Upload PDF <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs mt-1">PDF files up to 50MB</p>
                  </div>
                  <input type="hidden" value={fileUrl} /> {/* Simulated upload binding */}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Page Count (Optional)</label>
                <input type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} placeholder="e.g., 250" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                <p className="text-xs text-gray-400">Enter the number of pages in the PDF (optional).</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">File Size (Optional)</label>
                <input type="text" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="e.g., 5MB" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                <p className="text-xs text-gray-400">File size string (auto-detected for uploads, optional for URLs).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"></div>
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Settings</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleUpdate} disabled={saving} className="px-6 py-2.5 bg-blue-500 text-white rounded-md font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70">
          {saving ? "Updating..." : "Update Ebook"}
        </button>
        <button onClick={() => router.push('/admin/ebooks')} className="px-6 py-2.5 bg-white border border-red-200 text-red-500 rounded-md font-bold text-sm hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}
