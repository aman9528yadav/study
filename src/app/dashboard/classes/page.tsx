"use client"

import { VideoPlayer } from "@/components/video-player"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClassPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Physics: Newton's Laws of Motion</h1>
        <p className="text-muted-foreground mt-1">
          Chapter 2 • By Dr. HC Verma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-border">
            <VideoPlayer videoId="dQw4w9WgXcQ" />
          </Card>

          <div className="flex gap-4">
            <Button className="flex-1" variant="outline">Download Notes (PDF)</Button>
            <Button className="flex-1" variant="outline">Practice Sheet</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Contents</CardTitle>
              <CardDescription>2 hours 15 mins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">1. Introduction to Force</p>
                  <p className="text-xs text-muted-foreground">0:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">2. First Law of Motion</p>
                  <p className="text-xs text-muted-foreground">15:30</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">3. Inertia & Mass</p>
                  <p className="text-xs text-muted-foreground">45:10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ask a Doubt</CardTitle>
              <CardDescription>Get help from instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full min-h-[100px] p-3 text-sm rounded-md border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Type your question here..."
              />
              <Button className="w-full mt-4">Submit Doubt</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
