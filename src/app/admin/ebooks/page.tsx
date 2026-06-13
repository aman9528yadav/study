"use client"

import { useState, useEffect } from "react"
import { Eye, Edit2, Trash2, Plus, Book, CheckCircle, XCircle, FileText } from "lucide-react"
import { getEbooks, deleteEbook } from "@/app/actions/ebook"
import Link from "next/link"

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEbooks = async () => {
    setLoading(true)
    const res = await getEbooks()
    if (res.success) {
      setEbooks(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEbooks()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ebook?")) {
      const res = await deleteEbook(id)
      if (res.success) fetchEbooks()
    }
  }

  // Calculate stats
  const totalEbooks = ebooks.length
  const activeEbooks = ebooks.filter(e => e.status === 'Active').length
  const inactiveEbooks = totalEbooks - activeEbooks
  const totalViews = ebooks.reduce((sum, e) => sum + (e.views || 0), 0)

  // Helper to safely parse JSON arrays
  const parseTags = (jsonStr: string) => {
    try {
      const arr = JSON.parse(jsonStr)
      return Array.isArray(arr) ? arr : []
    } catch (e) {
      return []
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">Ebooks</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Ebook Management</h1>
        <Link href="/admin/ebooks/create" className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add New Ebook
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center mb-4 text-white">
            <Book className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalEbooks}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Total Ebooks</p>
          <p className="text-xs text-gray-400">All ebooks in library</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-green-500 rounded-md flex items-center justify-center mb-4 text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{activeEbooks}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Active Ebooks</p>
          <p className="text-xs text-gray-400">Published and available</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-red-500 rounded-md flex items-center justify-center mb-4 text-white">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{inactiveEbooks}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Inactive Ebooks</p>
          <p className="text-xs text-gray-400">Not published</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-400 rounded-md flex items-center justify-center mb-4 text-white">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalViews.toLocaleString()}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Total Views</p>
          <p className="text-xs text-gray-400">Cumulative ebook views</p>
        </div>
      </div>

      {/* Ebooks List Table Card */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm mt-8">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">All Ebooks</h3>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <select className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>ebooks per page</span>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search ebooks..." 
                className="border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 font-bold bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-100">SN ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100 w-1/3">Title ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100 w-1/4">Chapter Name ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Source ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">File Size ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Pages ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Views ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Status ↕</th>
                  <th className="px-4 py-3 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-500">Loading ebooks...</td></tr>
                ) : ebooks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No ebooks found. <Link href="/admin/ebooks/create" className="text-blue-500 hover:underline">Add one</Link>
                    </td>
                  </tr>
                ) : ebooks.map((ebook, idx) => {
                  const subjects = parseTags(ebook.subjects)
                  const boards = parseTags(ebook.boards)
                  const exams = parseTags(ebook.exams)
                  
                  return (
                    <tr key={ebook.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors align-top">
                      <td className="px-4 py-4 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-800">{ebook.title}</p>
                        {ebook.description && (
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{ebook.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-blue-600 mb-2">{ebook.chapterName || "—"}</p>
                        <div className="flex flex-wrap gap-1">
                          {subjects.map((s: string, i: number) => <span key={i} className="bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded text-[9px] font-bold">{s}</span>)}
                          {boards.map((b: string, i: number) => <span key={i} className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{b}</span>)}
                          {exams.map((e: string, i: number) => <span key={i} className="bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded text-[9px] font-bold">{e}</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{ebook.sourceType}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{ebook.fileSize || "—"}</td>
                      <td className="px-4 py-4 text-gray-500">{ebook.pageCount || "—"}</td>
                      <td className="px-4 py-4 text-gray-500">{ebook.views?.toLocaleString() || "0"}</td>
                      <td className="px-4 py-4">
                        {ebook.status === 'Active' ? (
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">Active</span>
                        ) : (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button className="w-7 h-7 rounded border border-blue-200 text-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors bg-white">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/admin/ebooks/${ebook.id}/edit`} className="w-7 h-7 rounded border border-orange-200 text-orange-400 flex items-center justify-center hover:bg-orange-50 transition-colors bg-white">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => handleDelete(ebook.id)} className="w-7 h-7 rounded border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors bg-white">
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

          <div className="mt-4 text-xs text-gray-500">
            Showing 1 to {ebooks.length} of {ebooks.length} entries
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
