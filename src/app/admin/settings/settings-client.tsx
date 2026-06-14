"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { updateMaintenanceMode } from "@/app/actions/settings"
import { Loader2 } from "lucide-react"

type SystemSetting = {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceEndTime: Date | null;
}

export default function AdminSettingsClient({ initialSettings }: { initialSettings: SystemSetting }) {
  const [isPending, startTransition] = useTransition()
  
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(initialSettings.maintenanceMode)
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialSettings.maintenanceMessage || "We are currently upgrading the servers. Please check back soon.")
  
  // Format Date for datetime-local input (YYYY-MM-DDThh:mm)
  const formatForInput = (date: Date | null) => {
    if (!date) return ""
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }
  
  const [maintenanceEndTime, setMaintenanceEndTime] = useState(formatForInput(initialSettings.maintenanceEndTime))

  const handleSaveMaintenance = (enabledState?: boolean) => {
    const isEnabled = enabledState !== undefined ? enabledState : isMaintenanceEnabled;
    startTransition(async () => {
      const res = await updateMaintenanceMode({
        isEnabled: isEnabled,
        message: maintenanceMessage,
        endTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null
      })
      
      if (res.error) {
        alert(res.error)
        if (enabledState !== undefined) {
          setIsMaintenanceEnabled(!enabledState) // revert on error
        }
      } else {
        alert(`Maintenance mode turned ${isEnabled ? 'ON' : 'OFF'} successfully!`)
      }
    })
  }

  const handleToggle = (checked: boolean) => {
    setIsMaintenanceEnabled(checked);
    handleSaveMaintenance(checked);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global application settings and API integrations.</p>
      </div>

      {/* Maintenance Mode Card */}
      <Card className="border-orange-200 dark:border-orange-900 shadow-sm">
        <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-orange-700 dark:text-orange-500">Maintenance Mode</CardTitle>
              <CardDescription className="text-orange-600/80 dark:text-orange-500/80 mt-1">
                When enabled, students will be blocked from accessing the platform. Admin access remains unaffected.
              </CardDescription>
            </div>
            <Switch 
              checked={isMaintenanceEnabled} 
              onCheckedChange={handleToggle}
              disabled={isPending}
              className="data-[state=checked]:bg-orange-600"
            />
          </div>
        </CardHeader>
        
        {isMaintenanceEnabled && (
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Public Message</Label>
              <Textarea 
                id="maintenanceMessage" 
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="We'll be right back..." 
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceTimer">Expected End Time (Timer)</Label>
              <Input 
                id="maintenanceTimer" 
                type="datetime-local" 
                value={maintenanceEndTime}
                onChange={(e) => setMaintenanceEndTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">If set, a countdown timer will be displayed to students.</p>
            </div>
          </CardContent>
        )}
        <CardFooter className="pt-6 border-t border-slate-100">
          <Button onClick={() => handleSaveMaintenance()} disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Maintenance Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>Public details of the educational platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" defaultValue="StudyPlatform" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Support Email</Label>
              <Input id="contactEmail" type="email" defaultValue="support@studyplatform.com" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Integrations</CardTitle>
          <CardDescription>Configure Razorpay/Stripe API keys for selling batches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razorpayKey">Razorpay Key ID</Label>
            <Input id="razorpayKey" type="password" placeholder="rzp_test_..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripeKey">Stripe Publishable Key</Label>
            <Input id="stripeKey" type="password" placeholder="pk_test_..." />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Update Keys</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
