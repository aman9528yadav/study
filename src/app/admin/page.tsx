import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, BookOpen, Database, IndianRupee, AlertCircle, Video, FileText, PlusCircle, Settings, HelpCircle, ChevronRight, Activity } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminPage() {
  const [
    totalStudents,
    activeBatches,
    videosCount,
    pdfsCount,
    recentEnrollments,
    approvedEnrollments,
    pendingEnrollments,
    unresolvedDoubts,
    recentVideos,
    recentPdfs
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.batch.count(),
    prisma.video.count(),
    prisma.pDF.count(),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        batch: { select: { title: true } }
      }
    }),
    prisma.enrollment.findMany({
      where: { status: 'APPROVED' },
      include: { batch: { select: { price: true } } }
    }),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.doubt.count({ where: { resolved: false } }),
    prisma.video.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { chapter: { select: { name: true } } }
    }),
    prisma.pDF.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { chapter: { select: { name: true } } }
    })
  ])

  const contentUploads = videosCount + pdfsCount
  const totalRevenue = approvedEnrollments.reduce((sum, current) => sum + (current.batch.price || 0), 0)

  // Combine and sort recent content
  const recentContent = [
    ...recentVideos.map(v => ({ ...v, type: 'VIDEO' as const })),
    ...recentPdfs.map(p => ({ ...p, type: 'PDF' as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform statistics and command center.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Students</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Registered users</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Active Batches</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeBatches.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Available programs</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Content Uploads</CardTitle>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{contentUploads.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">{videosCount} Videos, {pdfsCount} PDFs</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">From approved enrollments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Main Column */}
        <div className="col-span-4 space-y-6">
          
          {/* Needs Attention Alerts */}
          {(pendingEnrollments > 0 || unresolvedDoubts > 0) && (
            <Card className="border-red-200 bg-red-50/30 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <CardTitle className="text-lg">Needs Attention</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingEnrollments > 0 && (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{pendingEnrollments} Pending Enrollments</p>
                        <p className="text-xs text-slate-500">Students waiting for approval</p>
                      </div>
                    </div>
                    <Link href="/admin/students" className="text-sm text-blue-600 font-medium hover:underline flex items-center">
                      Review <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                )}

                {unresolvedDoubts > 0 && (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{unresolvedDoubts} Unresolved Doubts</p>
                        <p className="text-xs text-slate-500">Questions waiting for answers</p>
                      </div>
                    </div>
                    <Link href="/admin/doubts" className="text-sm text-blue-600 font-medium hover:underline flex items-center">
                      Resolve <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcuts to common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/batches">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Create Batch</p>
                  </div>
                </Link>

                <Link href="/admin/students">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Manage Users</p>
                  </div>
                </Link>

                <Link href="/admin/content">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Upload Content</p>
                  </div>
                </Link>

                <Link href="/admin/settings">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Platform Settings</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="col-span-3 space-y-6">
          
          {/* Recent Enrollments */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Enrollments</CardTitle>
                <CardDescription>Latest student purchases</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEnrollments.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No recent enrollments
                  </div>
                ) : (
                  recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {enrollment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {enrollment.user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {enrollment.batch.title}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap text-right">
                        <div>{new Date(enrollment.createdAt).toLocaleDateString()}</div>
                        <div className={`mt-0.5 font-medium ${enrollment.status === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>
                          {enrollment.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentEnrollments.length > 0 && (
                <Link href="/admin/students" className="mt-4 text-sm text-blue-600 font-medium hover:underline block text-center pt-2 border-t border-slate-100">
                  View All Enrollments
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Recent Content */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Recently Uploaded</CardTitle>
              <CardDescription>Latest videos and materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContent.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No content uploaded yet
                  </div>
                ) : (
                  recentContent.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'VIDEO' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                      }`}>
                        {item.type === 'VIDEO' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.chapter.name}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
