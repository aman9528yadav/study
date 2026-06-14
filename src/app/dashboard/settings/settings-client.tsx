"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { 
  User, Bell, Moon, Lock, Shield, 
  HelpCircle, LogOut, ChevronRight, 
  Camera, Trash2, Mail, X, Loader2
} from "lucide-react"
import { updateProfile } from "@/app/actions/auth"

export default function SettingsClient({ userName, userEmail }: { userName: string, userEmail: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // UI States for demo purposes
  const [darkMode, setDarkMode] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(userName)
  const [editPhone, setEditPhone] = useState("")

  const initials = userName.substring(0, 2).toUpperCase()

  const handleLogout = () => {
    alert("Logout clicked")
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", editName)
      formData.append("phone", editPhone)
      const res = await updateProfile(formData)
      if (res.error) {
        alert(res.error)
      } else {
        setIsEditingProfile(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-[#f4f5f8] min-h-screen text-slate-900 pb-20 -m-6 sm:-m-8">
      {/* Header Area */}
      <div className="bg-[#1c2438] text-white pt-10 pb-8 px-6 rounded-b-[2rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow-md border border-slate-100 group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{userName}</h2>
          <p className="text-indigo-200 text-sm font-medium mt-1">{userEmail}</p>
          <button onClick={() => setIsEditingProfile(true)} className="mt-4 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-sm transition-colors border border-white/10">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Preferences Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">Preferences</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Dark Mode</p>
                  <p className="text-xs text-slate-500">Adjust the appearance</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Push Notifications</p>
                  <p className="text-xs text-slate-500">Class reminders & updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Email Alerts</p>
                  <p className="text-xs text-slate-500">Offers and newsletters</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

          </div>
        </section>

        {/* Security Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">Security & Privacy</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            <button className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Change Password</p>
                  <p className="text-xs text-slate-500">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Privacy Policy</p>
                  <p className="text-xs text-slate-500">How we protect your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>

          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 ml-2">Danger Zone</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 border-b border-red-50 hover:bg-red-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                  <LogOut className="w-5 h-5" />
                </div>
                <p className="font-semibold text-red-600">Log Out</p>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </div>
                <p className="font-semibold text-red-600">Delete Account</p>
              </div>
            </button>

          </div>
        </section>

      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
