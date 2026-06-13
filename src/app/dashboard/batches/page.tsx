"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { getBatches } from "@/app/actions/batch"
import Link from "next/link"

export default function MyBatchesPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBatches() {
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
        <h1 className="text-3xl font-bold tracking-tight">Available Batches</h1>
        <p className="text-muted-foreground mt-1">Explore available courses and batches on the platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading batches...</p>
        ) : batches.length === 0 ? (
          <p className="text-muted-foreground">No batches available at the moment.</p>
        ) : (
          batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{batch.title}</CardTitle>
                <CardDescription>
                  Price: ${batch.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {batch.description || "No description provided."}
                </p>
                <p className="text-xs font-medium text-foreground">
                  Starts: {new Date(batch.startDate).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/batches/${batch.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
