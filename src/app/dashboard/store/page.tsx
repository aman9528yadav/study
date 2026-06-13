import { getUserSession } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, Clock } from "lucide-react"
import { enrollInBatch } from "@/app/actions/enrollment"
import { redirect } from "next/navigation"

export default async function StorePage() {
  const userSession = await getUserSession()
  if (!userSession) redirect("/login")

  // Get user to get ID and enrollments
  const user = await prisma.user.findUnique({
    where: { email: userSession.email! },
    include: { enrollments: true }
  })

  // JIT fallback for missing DB user should ideally happen in auth hook, but just in case:
  const enrollments = user?.enrollments || []

  // Fetch all public batches
  const batches = await prisma.batch.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" }
  })

  // Map user enrollments to check status
  const enrollmentMap = new Map()
  enrollments.forEach(e => {
    enrollmentMap.set(e.batchId, e.status)
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">All Courses</h1>
        <p className="text-slate-500 mt-2">{batches.length} courses available</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {batches.map(batch => {
          const status = enrollmentMap.get(batch.id)
          const isEnrolled = status === "APPROVED"
          const isPending = status === "PENDING"
          
          return (
            <Card key={batch.id} className="overflow-hidden flex flex-col hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
              <div className="aspect-video bg-indigo-50 dark:bg-slate-800 relative">
                {batch.thumbnail ? (
                  <img src={batch.thumbnail} alt={batch.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-indigo-200 dark:text-slate-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
                    <BookOpen className="w-12 h-12 mb-2" />
                    <span className="font-bold tracking-wider opacity-50 uppercase">{batch.title.substring(0, 15)}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                  NEW
                </div>
              </div>
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 inline-block px-2 py-1 rounded w-fit">
                  Dropper / 12th
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-2 mb-3">
                  {batch.title}
                </h3>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-2" />
                    Starts {batch.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Ends {batch.endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      ₹{batch.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  {isEnrolled ? (
                    <a href={`/dashboard/batches/${batch.id}`} className="px-5 py-2.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl font-bold text-sm transition-colors hover:bg-green-100">
                      Go to Batch
                    </a>
                  ) : isPending ? (
                    <div className="px-5 py-2.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl font-bold text-sm">
                      Pending
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <a href={`/dashboard/store/${batch.id}`} className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors">
                        Details
                      </a>
                      <form action={async () => { await enrollInBatch(batch.id) }}>
                        <Button type="submit" className="bg-[#1c2438] hover:bg-slate-800 text-white font-bold rounded-xl px-4 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                          Buy Now
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
