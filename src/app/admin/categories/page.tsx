"use client"

import { useState, useEffect } from "react"
import { Eye, Edit2, Trash2, List } from "lucide-react"
import { getCategories, deleteCategory } from "@/app/actions/category"
import Link from "next/link"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    setLoading(true)
    const res = await getCategories()
    if (res.success) {
      setCategories(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const res = await deleteCategory(id)
      if (res.success) fetchCategories()
    }
  }

  // Helper to parse JSON array string and get length safely
  const getTagCount = (jsonStr: string) => {
    try {
      const arr = JSON.parse(jsonStr)
      return Array.isArray(arr) ? arr.length : 0
    } catch (e) {
      return 0
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">Categories</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Categories List</h1>
      </div>

      {/* Categories List Table Card */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>entries per page</span>
              <select className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="border border-gray-200 rounded-md px-4 py-1.5 text-sm outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 font-bold bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-100">SN ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Name ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Description ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Subjects ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Boards ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Exams ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Status ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Order ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-500">Loading categories...</td></tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No categories found. <Link href="/admin/categories/new" className="text-blue-500 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : categories.map((cat, idx) => {
                  const subjectCount = getTagCount(cat.subjects)
                  const boardCount = getTagCount(cat.boards)
                  const examCount = getTagCount(cat.exams)
                  
                  return (
                    <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 text-gray-500 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-800">
                          <List className="w-4 h-4 text-blue-500" />
                          {cat.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400">{cat.description || "—"}</td>
                      
                      <td className="px-4 py-4">
                        {subjectCount > 0 ? (
                          <span className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{subjectCount}</span>
                        ) : <span className="text-gray-300 ml-2">-</span>}
                      </td>
                      
                      <td className="px-4 py-4">
                        {boardCount > 0 ? (
                          <span className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{boardCount}</span>
                        ) : <span className="text-gray-300 ml-2">-</span>}
                      </td>
                      
                      <td className="px-4 py-4">
                        {examCount > 0 ? (
                          <span className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{examCount}</span>
                        ) : <span className="text-gray-300 ml-2">-</span>}
                      </td>
                      
                      <td className="px-4 py-4">
                        {cat.status === 'Active' ? (
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">Active</span>
                        ) : (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">Inactive</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-500 text-center">{cat.order}</td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button className="w-7 h-7 rounded border border-blue-200 text-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors bg-white">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/admin/categories/${cat.id}/edit`} className="w-7 h-7 rounded border border-orange-200 text-orange-400 flex items-center justify-center hover:bg-orange-50 transition-colors bg-white">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => handleDelete(cat.id)} className="w-7 h-7 rounded border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors bg-white">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-500">
              Showing 1 to {categories.length} of {categories.length} entries
            </div>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</button>
              <button className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">2</button>
              <button className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">3</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-12 text-[11px] text-gray-400">
        <div className="flex items-center gap-2">
          <span>Score Plus</span>
          <span>|</span>
          <span className="hover:text-blue-500 cursor-pointer">Contact</span>
          <span>|</span>
          <span className="hover:text-blue-500 cursor-pointer">Arknox Technology</span>
        </div>
        <div className="mt-2 sm:mt-0 text-right">
          <div>2026. made with ♥ by <span className="text-blue-500 cursor-pointer">Arknox Technology LTD</span></div>
        </div>
      </div>
    </div>
  )
}
