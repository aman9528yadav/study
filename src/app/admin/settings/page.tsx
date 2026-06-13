"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global application settings and API integrations.</p>
      </div>

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
