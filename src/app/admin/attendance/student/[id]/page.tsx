import { prisma } from "@/lib/prisma"
import { CalendarCheck, ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminStudentAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true }
  })

  if (!user) {
    return <div className="p-8 text-center text-red-500">Student not found</div>
  }

  const attendances = await prisma.attendance.findMany({
    where: { userId: id },
    include: { batch: { select: { title: true } } },
    orderBy: { date: 'desc' }
  })

  // Group by batch
  const grouped: Record<string, any[]> = {}
  attendances.forEach(a => {
    const batchName = a.batch.title
    if (!grouped[batchName]) grouped[batchName] = []
    grouped[batchName].push(a)
  })

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/attendance" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Attendance</h1>
          </div>
          <p className="text-muted-foreground">
            Attendance history for <span className="font-medium text-slate-800">{user.name}</span> ({user.email})
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Days Present</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{attendances.length}</div>
            <p className="text-xs text-slate-500 mt-1">Across all batches</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {Object.keys(grouped).length === 0 ? (
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-8 text-center text-slate-500">
              No attendance records found for this student.
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([batchName, records]) => (
            <Card key={batchName} className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center gap-3 bg-slate-50 border-b pb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{batchName}</CardTitle>
                  <CardDescription>{records.length} days present</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {records.map(record => (
                    <div key={record.id} className="flex flex-col items-center p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                      <CalendarCheck className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-sm font-bold text-emerald-900">
                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600 uppercase">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
