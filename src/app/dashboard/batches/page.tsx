"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { getMyBatches } from "@/app/actions/batch"
import Link from "next/link"

export default function MyBatchesPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBatches() {
      const res = await getMyBatches()
      if (res.success) {
        setBatches(res.data || [])
      }
      setLoading(false)
    }
    fetchBatches()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Batches</h1>
          <p className="text-muted-foreground mt-1">Batches you are currently enrolled in.</p>
        </div>
        <Link href="/dashboard/store">
          <Button variant="outline">Explore More Courses</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading your batches...</p>
        ) : batches.length === 0 ? (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">You aren't enrolled in any batches yet.</h3>
            <p className="text-slate-500 mb-6">Head over to the store to find the perfect course for you.</p>
            <Link href="/dashboard/store">
              <Button>Browse Store</Button>
            </Link>
          </div>
        ) : (
          batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{batch.title}</CardTitle>
                <CardDescription>
                  Enrolled
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
                  <Button className="w-full">Go to Classroom</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
