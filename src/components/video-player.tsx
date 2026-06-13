"use client"

import { useState, useEffect, useRef } from "react"
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube"
import { Play, Pause, Maximize, Settings } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function VideoPlayer({ videoId }: { videoId: string }) {
  const [userEmail, setUserEmail] = useState<string>("student@example.com")
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    fetchUser()
  }, [supabase.auth])

  const [player, setPlayer] = useState<YouTubePlayer>(null)
  
  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  
  // Settings Menu State
  const [showSettings, setShowSettings] = useState(false)
  const [qualities, setQualities] = useState<string[]>([])
  const [currentQuality, setCurrentQuality] = useState("auto")
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [watermarkPos, setWatermarkPos] = useState({ top: 10, left: 10 })
  let controlsTimeout = useRef<NodeJS.Timeout | null>(null)

  // Safely extract YouTube ID in case user pasted full URL
  const extractYouTubeID = (urlOrId: string) => {
    if (!urlOrId) return ""
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = urlOrId.match(regExp)
    return (match && match[2].length === 11) ? match[2] : urlOrId
  }
  
  const safeVideoId = extractYouTubeID(videoId)

  // Anti-piracy: Move watermark periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: Math.random() * 80 + 10, // 10% to 90%
        left: Math.random() * 80 + 10,
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Update Progress Bar
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && player) {
      interval = setInterval(() => {
        const current = player.getCurrentTime()
        const total = player.getDuration()
        setCurrentTime(current)
        setDuration(total)
        setProgress((current / total) * 100)
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying, player])

  // Hide controls on idle
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo()
      } else {
        player.playVideo()
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value)
    if (player && duration > 0) {
      const seekTime = (newProgress / 100) * duration
      player.seekTo(seekTime, true)
      setProgress(newProgress)
      setCurrentTime(seekTime)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (player) {
      player.setPlaybackRate(rate)
      setPlaybackRate(rate)
      setShowSettings(false)
    }
  }

  const changeQuality = (quality: string) => {
    if (player) {
      player.setPlaybackQuality(quality)
      setCurrentQuality(quality)
      setShowSettings(false)
    }
  }

  const formatQuality = (q: string) => {
    const map: Record<string, string> = {
      highres: '1080p',
      hd1080: '1080p',
      hd720: '720p',
      large: '480p',
      medium: '360p',
      small: '240p',
      tiny: '144p',
      auto: 'Auto'
    }
    return map[q] || q
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err))
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00"
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target)
    setDuration(event.target.getDuration())
    const q = event.target.getAvailableQualityLevels()
    if (q && q.length > 0) setQualities(q)
  }

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === 1 || event.data === 3)
    if (event.data === 1 && player) {
      // Re-fetch qualities when playing starts in case manifest was delayed
      const q = player.getAvailableQualityLevels()
      if (q && q.length > 0 && qualities.length === 0) setQualities(q)
    }
  }

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, 
      disablekb: 1, 
      fs: 0, 
      modestbranding: 1, 
      rel: 0, 
      showinfo: 0,
      playsinline: 1,
    },
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden select-none group"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 
        CRITICAL: pointer-events-none completely blocks the user from clicking the native YouTube iframe.
        This prevents ANY interaction with YouTube's branding, Share button, or "More Videos" grid. 
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <YouTube 
          videoId={safeVideoId} 
          opts={opts} 
          onReady={onPlayerReady} 
          onStateChange={onStateChange}
          className="w-full h-full scale-[1.3]" // Scaling up hides top/bottom black bars and branding bleed
          iframeClassName="w-full h-full border-none" 
        />
      </div>

      {/* Invisible overlay to catch clicks for Play/Pause */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
      />

      {/* Dynamic Watermark overlay */}
      <div 
        className="absolute z-20 pointer-events-none text-white/40 font-mono text-sm sm:text-base tracking-widest transition-all duration-[5000ms] ease-linear whitespace-nowrap drop-shadow-md bg-black/10 px-2 py-1 rounded"
        style={{ top: `${watermarkPos.top}%`, left: `${watermarkPos.left}%` }}
      >
        {userEmail}
        <br />
        IP: 192.168.1.1
      </div>

      {/* Custom Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer group-hover:h-2 transition-all">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full z-30"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <span className="text-sm font-medium font-mono text-white/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`hover:text-indigo-400 transition-colors ${showSettings ? "text-indigo-400" : ""}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition-colors">
              <Maximize className="w-5 h-5" />
            </button>

            {/* Settings Popover */}
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-4 w-48 bg-[#1c2438]/95 backdrop-blur-md border border-[#2a344a] rounded-xl shadow-2xl p-2 z-50 overflow-hidden">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-1">Speed</div>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {[1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`py-1 text-xs font-medium rounded ${playbackRate === rate ? "bg-indigo-600 text-white" : "hover:bg-[#2a344a] text-slate-300"}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 border-t border-[#2a344a] pt-3">Quality</div>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-hide">
                  <button
                    onClick={() => changeQuality("auto")}
                    className={`py-1.5 px-2 text-sm font-medium rounded text-left ${currentQuality === "auto" ? "bg-indigo-600 text-white" : "hover:bg-[#2a344a] text-slate-300"}`}
                  >
                    Auto
                  </button>
                  {qualities.filter(q => q !== "auto").map(q => (
                    <button
                      key={q}
                      onClick={() => changeQuality(q)}
                      className={`py-1.5 px-2 text-sm font-medium rounded text-left ${currentQuality === q ? "bg-indigo-600 text-white" : "hover:bg-[#2a344a] text-slate-300"}`}
                    >
                      {formatQuality(q)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Big Play Button Overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-indigo-600/90 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] backdrop-blur-sm">
            <Play className="w-8 h-8 text-white fill-current ml-2" />
          </div>
        </div>
      )}
    </div>
  )
}
