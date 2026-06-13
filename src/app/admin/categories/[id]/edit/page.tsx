"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, X, Settings } from "lucide-react"
import { getCategory, updateCategory } from "@/app/actions/category"

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [order, setOrder] = useState(0)
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("Active")
  
  // Tag States
  const [subjects, setSubjects] = useState<string[]>([])
  const [boards, setBoards] = useState<string[]>([])
  const [exams, setExams] = useState<string[]>([])

  // Input states for tags
  const [subjectInput, setSubjectInput] = useState("")
  const [boardInput, setBoardInput] = useState("")
  const [examInput, setExamInput] = useState("")

  useEffect(() => {
    const fetchCat = async () => {
      const res = await getCategory(params.id as string)
      if (res.success && res.data) {
        setName(res.data.name)
        setOrder(res.data.order)
        setDescription(res.data.description || "")
        setStatus(res.data.status)
        
        try { setSubjects(JSON.parse(res.data.subjects)) } catch(e){}
        try { setBoards(JSON.parse(res.data.boards)) } catch(e){}
        try { setExams(JSON.parse(res.data.exams)) } catch(e){}
      }
      setLoading(false)
    }
    fetchCat()
  }, [params.id])

  const handleUpdate = async () => {
    setSaving(true)
    const res = await updateCategory(params.id as string, {
      name,
      order,
      description,
      status,
      subjects: JSON.stringify(subjects),
      boards: JSON.stringify(boards),
      exams: JSON.stringify(exams)
    })
    
    if (res.success) {
      alert("Category updated successfully!")
      router.push("/admin/categories")
    } else {
      alert("Error updating category")
    }
    setSaving(false)
  }

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>, value: string, setArr: any, arr: string[], setInput: any) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed && !arr.includes(trimmed)) {
        setArr([...arr, trimmed])
      }
      setInput("")
    }
  }

  const removeTag = (index: number, arr: string[], setArr: any) => {
    setArr(arr.filter((_, i) => i !== index))
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading category details...</div>

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> Categories <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">Edit Category</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Edit Category</h1>
        <button onClick={() => router.push('/admin/categories')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Basic Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Order (For sorting)</label>
                <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"></textarea>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm relative">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
            <p className="text-xs text-gray-400 mt-1">Type subject name and press Enter to add</p>
          </div>
          <div className="p-6">
            <input 
              type="text" 
              placeholder="Type subject name and press Enter" 
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyDown={(e) => addTag(e, subjectInput, setSubjects, subjects, setSubjectInput)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4" 
            />
            {subjects.length === 0 ? <p className="text-sm text-gray-400">No subjects added yet</p> : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    {sub}
                    <button onClick={() => removeTag(i, subjects, setSubjects)} className="hover:text-blue-200"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Boards */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded">Boards</h3>
            <p className="text-xs text-gray-400 mt-1 bg-blue-50 text-blue-600 inline-block px-2">Type board name and press Enter to add</p>
          </div>
          <div className="p-6">
            <input 
              type="text" 
              placeholder="Type board name and press Enter" 
              value={boardInput}
              onChange={(e) => setBoardInput(e.target.value)}
              onKeyDown={(e) => addTag(e, boardInput, setBoards, boards, setBoardInput)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4" 
            />
            {boards.length === 0 ? <p className="text-sm text-gray-400">No boards added yet</p> : (
              <div className="flex flex-wrap gap-2">
                {boards.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    {b}
                    <button onClick={() => removeTag(i, boards, setBoards)} className="hover:text-green-200"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Settings Floating Icon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
            <Settings className="w-4 h-4" />
          </div>
        </div>

        {/* Exams */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Exams</h3>
            <p className="text-xs text-gray-400 mt-1">Type exam name and press Enter to add</p>
          </div>
          <div className="p-6">
            <input 
              type="text" 
              placeholder="Type exam name and press Enter" 
              value={examInput}
              onChange={(e) => setExamInput(e.target.value)}
              onKeyDown={(e) => addTag(e, examInput, setExams, exams, setExamInput)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4" 
            />
            {exams.length === 0 ? <p className="text-sm text-gray-400">No exams added yet</p> : (
              <div className="flex flex-wrap gap-2">
                {exams.map((ex, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    {ex}
                    <button onClick={() => removeTag(i, exams, setExams)} className="hover:text-orange-200"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleUpdate} disabled={saving} className="px-6 py-2.5 bg-blue-500 text-white rounded-md font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70">
          {saving ? "Updating..." : "Update Category"}
        </button>
        <button onClick={() => router.push('/admin/categories')} className="px-6 py-2.5 bg-white border border-red-200 text-red-500 rounded-md font-bold text-sm hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}
