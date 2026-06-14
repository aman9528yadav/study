import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarCheck, Users, Search } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getAdminBatches } from "@/app/actions/attendance"
import Link from "next/link"

export default async function AdminAttendancePage({ searchParams }: { searchParams: Promise<{ date?: string, batchId?: string }> }) {
  const params = await searchParams
  const selectedDate = params?.date || new Date().toISOString().split("T")[0]
  const selectedBatchId = params?.batchId || "all"

  const whereClause: any = { date: selectedDate }
  if (selectedBatchId !== "all") {
    whereClause.batchId = selectedBatchId
  }

  const [attendances, batchesRes] = await Promise.all([
    prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        batch: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    getAdminBatches()
  ])

  const batches = batchesRes.data || []
  const totalPresent = attendances.filter(a => a.status === "PRESENT").length
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Register</h1>
          <p className="text-muted-foreground mt-1">
            Track student daily check-ins across all batches.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Present Today</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalPresent}</div>
            <p className="text-xs text-slate-500 mt-1">Students marked present</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>Records for {new Date(selectedDate).toLocaleDateString()}</CardDescription>
          </div>
          
          <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <select 
              name="batchId" 
              defaultValue={selectedBatchId}
              className="px-3 py-1.5 text-sm border rounded-md text-slate-700 bg-white"
            >
              <option value="all">All Batches</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <input 
              type="date" 
              name="date"
              defaultValue={selectedDate}
              className="px-3 py-1.5 text-sm border rounded-md text-slate-700"
            />
            <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
              Filter
            </button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-slate-50 p-4 border-b font-medium text-sm text-slate-500">
              <div className="col-span-4">Student Name</div>
              <div className="col-span-4">Batch</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Time Marked</div>
            </div>
            
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {attendances.length === 0 ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Users className="w-8 h-8 text-slate-300" />
                  <p>No attendance records found for these filters.</p>
                </div>
              ) : (
                attendances.map((record) => (
                  <div key={record.id} className="grid grid-cols-12 p-4 text-sm items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-4 font-medium truncate pr-4">
                      <Link href={`/admin/attendance/student/${record.user.id}`} className="text-blue-600 hover:underline">
                        {record.user.name}
                      </Link>
                      <div className="text-xs text-slate-500 font-normal truncate mt-0.5">{record.user.email}</div>
                    </div>
                    <div className="col-span-4 text-slate-700 truncate pr-4">
                      {record.batch.title}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-right text-slate-500">
                      {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
