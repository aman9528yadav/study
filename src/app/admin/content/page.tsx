"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, Database } from "lucide-react"
import { getBatches } from "@/app/actions/batch"
import Link from "next/link"

export default function ContentManagerPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBatches() {
      setLoading(true)
      const res = await getBatches()
      if (res.success) {
        setBatches(res.data || [])
      }
      setLoading(false)
    }
    fetchBatches()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
        <p className="text-muted-foreground mt-1">Select a batch below to build its syllabus and upload video lectures.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading batches...</p>
        ) : batches.length === 0 ? (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-4">No batches found. You need to create a batch first!</p>
            <Link href="/admin/batches">
              <Button>Go to Batches Manager</Button>
            </Link>
          </div>
        ) : (
          batches.map((batch) => (
            <Card key={batch.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl line-clamp-1">{batch.title}</CardTitle>
                <CardDescription>
                  {batch._count?.enrollments || 0} students enrolled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/admin/batches/${batch.id}`}>
                  <Button className="w-full gap-2">
                    <Folder className="w-4 h-4" />
                    Manage Syllabus
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
