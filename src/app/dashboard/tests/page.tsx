"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2 } from "lucide-react"

export default function OnlineTestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Online Tests</h1>
        <p className="text-muted-foreground mt-1">Take mock tests and review your performance.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Tests</h2>
        <Card>
          <CardHeader>
            <CardTitle>JEE Full Syllabus Mock Test 4</CardTitle>
            <CardDescription>3 Hours • 300 Marks • Negative Marking: -1</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
              <Calendar className="w-4 h-4" />
              <span>Ends in 2 days</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Start Test</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-8">Past Results</h2>
        <Card>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Physics Chapter 1-3 Quiz</h3>
              <p className="text-sm text-muted-foreground">Taken on Oct 12, 2024</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Score</p>
                <p className="text-2xl font-bold text-primary">85/100</p>
              </div>
              <Button variant="outline">View Solutions</Button>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Chemistry Organic Basics</h3>
              <p className="text-sm text-muted-foreground">Taken on Oct 5, 2024</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Score</p>
                <p className="text-2xl font-bold text-primary">42/50</p>
              </div>
              <Button variant="outline">View Solutions</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
