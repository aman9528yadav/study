"use client"

import { useState, useEffect } from "react"
import { BookOpen, ExternalLink, Download, FileText } from "lucide-react"
import { getEbooks } from "@/app/actions/ebook"

export default function StudentEbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveEbooks = async () => {
      const res = await getEbooks()
      if (res.success && res.data) {
        // Filter to only show active ebooks
        setEbooks(res.data.filter((e: any) => e.status === "Active"))
      }
      setLoading(false)
    }
    fetchActiveEbooks()
  }, [])

  // Helper to safely parse JSON arrays
  const parseTags = (jsonStr: string) => {
    try {
      const arr = JSON.parse(jsonStr)
      return Array.isArray(arr) ? arr : []
    } catch (e) {
      return []
    }
  }

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading ebooks library...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">My Library</h1>
        <p className="text-muted-foreground">Access your course materials, study guides, and ebooks.</p>
      </div>

      {ebooks.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Ebooks Available</h3>
          <p className="text-muted-foreground">There are currently no active ebooks available in the library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map((ebook) => {
            const subjects = parseTags(ebook.subjects)
            const boards = parseTags(ebook.boards)
            
            return (
              <div key={ebook.id} className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="bg-blue-50/50 p-6 flex items-center justify-center border-b border-gray-100">
                  <FileText className="w-16 h-16 text-blue-500" />
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{ebook.title}</h3>
                    {ebook.chapterName && <p className="text-sm font-semibold text-blue-600 mt-1">{ebook.chapterName}</p>}
                  </div>
                  
                  {ebook.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {ebook.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                    {subjects.slice(0, 2).map((s: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">{s}</span>
                    ))}
                    {boards.slice(0, 1).map((b: string, i: number) => (
                      <span key={i} className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">{b}</span>
                    ))}
                    {(subjects.length > 2 || boards.length > 1) && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">+{subjects.length + boards.length - 3}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400 font-medium">
                      {ebook.pageCount ? `${ebook.pageCount} pages` : ebook.fileSize ? ebook.fileSize : 'PDF Document'}
                    </div>
                    
                    <a 
                      href={ebook.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                    >
                      {ebook.sourceType === 'URL' ? (
                        <><ExternalLink className="w-4 h-4" /> Open Link</>
                      ) : (
                        <><Download className="w-4 h-4" /> Download</>
                      )}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
