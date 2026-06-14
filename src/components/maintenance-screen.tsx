"use client"

import { useEffect, useState } from "react"
import { Construction, Timer, Clock } from "lucide-react"
import { MaintenanceWatcher } from "./maintenance-watcher"

export function MaintenanceScreen({ message, endTime }: { message: string | null, endTime: Date | null }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)

  useEffect(() => {
    if (!endTime) return

    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <MaintenanceWatcher currentStatus={true} />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Graphic */}
        <div className="h-32 bg-orange-500 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
            <Construction className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Site Under Maintenance</h1>
          
          <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm font-medium border border-orange-100 my-6 inline-block w-full">
            "{message || "We are currently performing scheduled maintenance. We should be back shortly."}"
          </div>

          {endTime && (
            <div className="mt-8">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-4 uppercase tracking-wider font-bold text-xs">
                <Timer className="w-4 h-4" /> Expected Completion In
              </div>
              
              {timeLeft ? (
                <div className="flex justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      {String(timeLeft.hours + (timeLeft.days * 24)).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Hours</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-300 mt-2">:</div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Mins</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-300 mt-2">:</div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Secs</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-3 rounded-lg border border-emerald-100">
                  <Clock className="w-5 h-5" /> Any moment now...
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Please check back later or refresh the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
