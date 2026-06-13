"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { getBatches, createBatch } from "@/app/actions/batch"

export default function BatchesManagerPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchBatches = async () => {
    setLoading(true)
    const res = await getBatches()
    if (res.success) {
      setBatches(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const handleAddBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const res = await createBatch(formData)
    
    if (res.success) {
      setIsDialogOpen(false)
      fetchBatches()
    } else {
      setError(res.error || "Failed to create batch")
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
        <Button onClick={() => setIsDialogOpen(true)} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          Create Batch
        </Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title="Create New Batch"
        description="Set up a new batch for students to enroll in."
      >
        <form onSubmit={handleAddBatch} className="space-y-4">
          {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="title">Batch Title</Label>
            <Input id="title" name="title" required placeholder="JEE Mains Target Batch" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Short summary of this batch..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" name="price" type="number" step="0.01" required placeholder="49.99" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </form>
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
                  <th className="px-4 py-3 font-medium">Enrolled Students</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading batches...</td></tr>
                ) : batches.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">No batches found. Create one above.</td></tr>
                ) : batches.map((batch) => (
                  <tr key={batch.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{batch.title}</td>
                    <td className="px-4 py-3">{batch._count?.enrollments || 0}</td>
                    <td className="px-4 py-3 text-muted-foreground">${batch.price}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/admin/batches/${batch.id}`}>
                        <Button variant="ghost" size="sm">Manage Contents</Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
