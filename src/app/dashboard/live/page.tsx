"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Clock, Calendar } from "lucide-react"
import { getUpcomingLiveClasses } from "@/app/actions/batch"
import Link from "next/link"

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClasses() {
      const res = await getUpcomingLiveClasses()
      if (res.success) {
        setClasses(res.data || [])
      }
      setLoading(false)
    }
    fetchClasses()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-muted-foreground mt-1">Join your upcoming live sessions directly from here.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading your live classes...</p>
        ) : classes.length === 0 ? (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No upcoming live classes.</h3>
            <p className="text-slate-500">Check back later or browse your batches for recorded lectures.</p>
          </div>
        ) : (
          classes.map((cls) => {
            const isLiveNow = cls.scheduledAt && new Date() >= new Date(cls.scheduledAt)
            return (
              <Card key={cls.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center mb-2">
                      <Video className="w-5 h-5 text-destructive" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isLiveNow ? "bg-red-100 text-red-700" : "bg-muted"}`}>
                      {isLiveNow ? "LIVE NOW" : "Upcoming"}
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{cls.title}</CardTitle>
                  <CardDescription className="line-clamp-1">Batch: {cls.chapter.subject.batch.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {cls.scheduledAt 
                        ? new Date(cls.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        : "Anytime"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/dashboard/batches/${cls.chapter.subject.batch.id}?play=${cls.id}`} className="w-full">
                    <Button className="w-full" variant={isLiveNow ? "default" : "outline"}>
                      {isLiveNow ? "Join Class" : "Go to Class"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
