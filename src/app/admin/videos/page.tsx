"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, AlertTriangle } from "lucide-react"

export default function VideoSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Security</h1>
        <p className="text-muted-foreground mt-1">Configure DRM settings, watermark policies, and review security logs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Global DRM Settings
            </CardTitle>
            <CardDescription>These rules apply to the custom VideoPlayer component globally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Dynamic Watermarking</p>
                <p className="text-sm text-muted-foreground">Display student email moving randomly over video.</p>
              </div>
              <Button variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Enabled</Button>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Tab Switch Detection</p>
                <p className="text-sm text-muted-foreground">Pause playback if the user switches browser tabs.</p>
              </div>
              <Button variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Disable Developer Shortcuts</p>
                <p className="text-sm text-muted-foreground">Block F12, Right-Click, and PrintScreen.</p>
              </div>
              <Button variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Enabled</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Suspicious Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
                <p className="font-semibold">Multiple device logins detected</p>
                <p className="text-xs mt-1">Student: rahul@example.com logged in from 3 IPs in 10 mins.</p>
              </div>
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-semibold text-foreground">Excessive tab switching</p>
                <p className="text-xs text-muted-foreground mt-1">Student: amit@example.com switched tabs 15 times during Mock Test 4.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
