import { CalendarCheck, BookOpen } from "lucide-react"
import { getStudentFullAttendance } from "@/app/actions/attendance"

export default async function StudentAttendancePage() {
  const response = await getStudentFullAttendance()
  
  if (!response.success || !response.data) {
    return (
      <div className="p-8 text-center text-red-500 bg-white min-h-screen">
        Failed to load attendance records.
      </div>
    )
  }

  const attendances = response.data

  // Group by batch
  const grouped: Record<string, any[]> = {}
  attendances.forEach(a => {
    const batchName = a.batch.title
    if (!grouped[batchName]) grouped[batchName] = []
    grouped[batchName].push(a)
  })

  return (
    <div className="min-h-screen bg-[#f4f5f8] pb-24">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-16 px-6">
        <h1 className="text-2xl font-bold text-white mb-2">My Attendance</h1>
        <p className="text-indigo-200 text-sm">
          Track your daily class presence across all your enrolled batches.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Days Present</p>
              <p className="text-2xl font-bold text-gray-900">{attendances.length}</p>
            </div>
          </div>
        </div>

        {/* Batch Grouped Records */}
        <div className="space-y-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              You haven't marked attendance yet.
            </div>
          ) : (
            Object.entries(grouped).map(([batchName, records]) => (
              <div key={batchName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-indigo-50/50 p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{batchName}</h2>
                    <p className="text-xs text-gray-500">{records.length} days present</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {records.map(record => (
                      <div key={record.id} className="flex flex-col items-center p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <CalendarCheck className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="text-sm font-bold text-emerald-900">
                          {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600/70 uppercase">
                          {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
