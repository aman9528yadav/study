import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Calendar, Clock, BookOpen, Star, ShieldCheck, HelpCircle, MonitorPlay } from "lucide-react"
import { Button } from "@/components/ui/button"
import { enrollInBatch } from "@/app/actions/enrollment"
import { getUserSession } from "@/app/actions/auth"

export default async function BatchDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const batch = await prisma.batch.findUnique({
    where: { id }
  })

  if (!batch) {
    notFound()
  }

  let features = []
  try {
    if (batch.features) features = JSON.parse(batch.features)
  } catch (e) {
    console.error("Failed to parse features", e)
  }

  const userSession = await getUserSession()
  let isEnrolled = false
  let isPending = false
  if (userSession) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_batchId: {
          userId: userSession.id,
          batchId: id
        }
      }
    })
    isEnrolled = enrollment?.status === "APPROVED"
    isPending = enrollment?.status === "PENDING"
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-8 pb-0 mb-8 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{batch.title}</h1>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-transparent text-sm font-medium">
          <button className="text-indigo-600 border-b-2 border-indigo-600 pb-4 px-1">Description</button>
          <button className="text-slate-500 hover:text-slate-700 pb-4 px-1">All Classes</button>
          <button className="text-slate-500 hover:text-slate-700 pb-4 px-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Infinity Learning
          </button>
          <button className="text-slate-500 hover:text-slate-700 pb-4 px-1">Tests</button>
          <button className="text-slate-500 hover:text-slate-700 pb-4 px-1">Community</button>
        </div>
      </div>

      <div className="flex justify-between items-start gap-8 flex-col-reverse md:flex-row">
        {/* Content Section */}
        <div className="flex-1 space-y-8 w-full">
          <div className="space-y-6">
            {/* Course Duration */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-500 mb-2">Course Duration:</p>
                <div className="space-y-1 text-slate-800 dark:text-slate-200 font-medium">
                  <p>Start Date: {batch.startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>Syllabus End: {batch.endDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Validity */}
            {batch.validity && (
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Validity:</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{batch.validity}</p>
                </div>
              </div>
            )}

            {/* Mode of Lectures */}
            {batch.mode && (
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <MonitorPlay className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Mode of Lectures:</p>
                  <p className="text-slate-600 dark:text-slate-300">{batch.mode}</p>
                </div>
              </div>
            )}

            {/* Schedule */}
            {batch.schedule && (
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Schedule:</p>
                  <p className="text-slate-600 dark:text-slate-300">{batch.schedule}</p>
                </div>
              </div>
            )}

            {/* Features list */}
            {features.map((feature: string, idx: number) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-300">{feature}</p>
              </div>
            ))}
            
            {/* Description fallback */}
            {batch.description && (
              <div className="flex gap-4 items-start pt-4">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">About Batch:</p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{batch.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Card */}
        <div className="w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl sticky top-48">
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            ₹{batch.price.toLocaleString('en-IN')}
          </div>
          
          {isEnrolled ? (
            <a href={`/dashboard/batches/${batch.id}`} className="block w-full text-center px-6 py-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl font-bold transition-colors hover:bg-green-100">
              Go to Batch
            </a>
          ) : isPending ? (
             <div className="w-full text-center px-6 py-3 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl font-bold">
              Enrollment Pending
            </div>
          ) : (
            <form action={enrollInBatch.bind(null, batch.id) as any}>
              <Button type="submit" className="w-full bg-[#1c2438] hover:bg-slate-800 text-white font-bold rounded-xl py-6 text-lg shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                Buy Now
              </Button>
            </form>
          )}
          
          <p className="text-center text-xs text-slate-500 mt-4">
            Secure checkout. Instant access upon approval.
          </p>
        </div>
      </div>
    </div>
  )
}
