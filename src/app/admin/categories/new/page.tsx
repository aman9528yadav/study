"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, X, Settings } from "lucide-react"
import { createCategory } from "@/app/actions/category"

export default function NewCategoryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [order, setOrder] = useState(0)
  const [description, setDescription] = useState("")
  
  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Category name is required")
      return
    }

    setSaving(true)
    // We only need basic fields on create as per the typical flow, 
    // tags can be added later or we could implement tag adding here as well.
    const res = await createCategory({
      name,
      description
    })
    
    if (res.success) {
      router.push(`/admin/categories/${res.id}/edit`)
    } else {
      alert("Error creating category")
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> Categories <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">Add Category</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Add Category</h1>
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
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Class 10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="A short description of this category..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleCreate} disabled={saving} className="px-6 py-2.5 bg-blue-500 text-white rounded-md font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-70">
          {saving ? "Creating..." : "Create Category"}
        </button>
        <button onClick={() => router.push('/admin/categories')} className="px-6 py-2.5 bg-white border border-red-200 text-red-500 rounded-md font-bold text-sm hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}
