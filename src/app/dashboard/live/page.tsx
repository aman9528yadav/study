"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Clock } from "lucide-react"

export default function LiveClassesPage() {
  const classes = [
    { id: 1, title: "Thermodynamics - Part 2", teacher: "Dr. HC Verma", time: "Today, 4:00 PM", status: "Upcoming" },
    { id: 2, title: "Organic Chemistry Revision", teacher: "Prof. Sharma", time: "Today, 6:30 PM", status: "Upcoming" },
    { id: 3, title: "Calculus Limits", teacher: "Mr. Gupta", time: "Tomorrow, 10:00 AM", status: "Scheduled" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-muted-foreground mt-1">Join your upcoming live sessions directly from here.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center mb-2">
                  <Video className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full">
                  {cls.status}
                </span>
              </div>
              <CardTitle className="text-xl">{cls.title}</CardTitle>
              <CardDescription>By {cls.teacher}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{cls.time}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={cls.status === "Upcoming" ? "default" : "outline"}>
                {cls.status === "Upcoming" ? "Join Class" : "Remind Me"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
