"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { getBatches, createBatch, updateBatch, deleteBatch } from "@/app/actions/batch"
import { getCategories } from "@/app/actions/category"

export default function BatchesManagerPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const [editingBatch, setEditingBatch] = useState<any>(null)
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [batchRes, catRes] = await Promise.all([
      getBatches(),
      getCategories()
    ])
    if (batchRes.success) setBatches(batchRes.data || [])
    if (catRes.success) setCategories(catRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenCreate = () => {
    setEditingBatch(null)
    setError("")
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (batch: any) => {
    let featuresStr = ""
    try {
      if (batch.features) {
        featuresStr = JSON.parse(batch.features).join("\n")
      }
    } catch(e) {}
    
    setEditingBatch({
      ...batch,
      startDate: new Date(batch.startDate).toISOString().split('T')[0],
      endDate: new Date(batch.endDate).toISOString().split('T')[0],
      featuresStr
    })
    setError("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    let res;
    if (editingBatch) {
      res = await updateBatch(editingBatch.id, formData)
    } else {
      res = await createBatch(formData)
    }
    
    if (res.success) {
      setIsDialogOpen(false)
      fetchData()
    } else {
      setError(res.error || "Failed to save batch")
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!batchToDelete) return
    setSubmitting(true)
    const res = await deleteBatch(batchToDelete)
    if (res.success) {
      setIsDeleteDialogOpen(false)
      fetchData()
    } else {
      alert("Failed to delete batch")
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches Manager</h1>
          <p className="text-muted-foreground mt-1">Create new study batches, assign subjects, and manage pricing.</p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          Create Batch
        </Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title={editingBatch ? "Edit Batch" : "Create New Batch"}
        description={editingBatch ? "Update details for this batch." : "Set up a new batch for students to enroll in."}
      >
        <div className="max-h-[75vh] overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-4 py-1">
            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="title">Batch Title</Label>
              <Input id="title" name="title" required placeholder="JEE Mains Target Batch" defaultValue={editingBatch?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select 
                id="categoryId" 
                name="categoryId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={editingBatch?.categoryId || ""}
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Short summary of this batch..." defaultValue={editingBatch?.description} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" name="price" type="number" step="0.01" required placeholder="4999" defaultValue={editingBatch?.price} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" required defaultValue={editingBatch?.startDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" required defaultValue={editingBatch?.endDate} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validity">Validity</Label>
                <Input id="validity" name="validity" placeholder="e.g. 30 June 2027" defaultValue={editingBatch?.validity} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode">Mode of Lectures</Label>
                <Input id="mode" name="mode" placeholder="e.g. Live Online" defaultValue={editingBatch?.mode} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input id="schedule" name="schedule" placeholder="e.g. 3 Classes/Per day, 6 days/week" defaultValue={editingBatch?.schedule} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Key Features (One per line)</Label>
              <textarea 
                id="features" 
                name="features" 
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={"Exam guidance at centers\nOne-to-one emotional support\nIn-person helpdesk"}
                defaultValue={editingBatch?.featuresStr}
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Batch"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Batch"
        description="Are you sure you want to delete this batch? All its videos, PDFs, tests, and student enrollments will be permanently deleted. This cannot be undone."
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>All Batches</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search batches..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Batch Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Enrolled Students</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading batches...</td></tr>
                ) : batches.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">No batches found. Create one above.</td></tr>
                ) : batches.map((batch) => {
                  const cat = categories.find(c => c.id === batch.categoryId)
                  return (
                    <tr key={batch.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{batch.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {cat ? <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">{cat.name}</span> : <span className="text-xs">None</span>}
                      </td>
                      <td className="px-4 py-3">{batch._count?.enrollments || 0}</td>
                      <td className="px-4 py-3 text-muted-foreground">₹{batch.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={`/admin/batches/${batch.id}`}>
                            <Button variant="ghost" size="sm" className="h-8">Manage Content</Button>
                          </a>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(batch)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => {
                            setBatchToDelete(batch.id)
                            setIsDeleteDialogOpen(true)
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
