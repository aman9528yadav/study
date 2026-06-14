import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IndianRupee, TrendingUp, Calendar, CreditCard } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function FeesPage() {
  const approvedEnrollments = await prisma.enrollment.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      batch: { select: { title: true, price: true } }
    }
  })

  const totalRevenue = approvedEnrollments.reduce((sum, current) => sum + (current.batch.price || 0), 0)
  
  // Calculate this month's revenue
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthlyRevenue = approvedEnrollments
    .filter(e => {
      const d = new Date(e.createdAt)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((sum, current) => sum + (current.batch.price || 0), 0)

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fees & Revenue</h1>
        <p className="text-muted-foreground mt-1">
          Track platform earnings and student purchases.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Monthly Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Earnings this month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Transactions</CardTitle>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{approvedEnrollments.length.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Approved purchases</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A detailed list of all approved enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-slate-50 p-4 border-b font-medium text-sm text-slate-500">
              <div className="col-span-3">Student Name</div>
              <div className="col-span-4">Batch Purchased</div>
              <div className="col-span-2 text-right">Date</div>
              <div className="col-span-3 text-right">Price Paid</div>
            </div>
            
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {approvedEnrollments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No approved transactions yet.
                </div>
              ) : (
                approvedEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="grid grid-cols-12 p-4 text-sm items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-3 font-medium text-slate-900 truncate pr-4">
                      {enrollment.user.name}
                      <div className="text-xs text-slate-500 font-normal truncate mt-0.5">{enrollment.user.email}</div>
                    </div>
                    <div className="col-span-4 text-slate-700 truncate pr-4">
                      {enrollment.batch.title}
                    </div>
                    <div className="col-span-2 text-right text-slate-500 flex items-center justify-end gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-3 text-right font-bold text-emerald-600">
                      ₹{(enrollment.batch.price || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
