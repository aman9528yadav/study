"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Smartphone, Monitor, Trash2, ChevronLeft, Eye, RefreshCw, CheckCircle, Ban } from "lucide-react"
import { getUserWithDevices, deleteDevice, resetAllDevices, toggleDeviceStatus } from "@/app/actions/device"
import Link from "next/link"

export default function UserDevicesPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true)
    const res = await getUserWithDevices(params.id as string)
    if (res.success) {
      setUser(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const handleDeleteDevice = async (deviceId: string) => {
    if (confirm("Are you sure you want to remove this device?")) {
      await deleteDevice(deviceId)
      fetchUser()
    }
  }

  const handleResetAll = async () => {
    if (confirm("Are you sure you want to log out and remove ALL devices for this user?")) {
      await resetAllDevices(params.id as string)
      fetchUser()
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading device details...</div>
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">User not found</div>
  }

  const devices = user.devices || []
  const activeDevices = devices.filter((d: any) => d.status === 'ACTIVE').length
  const blockedDevices = devices.length - activeDevices

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> Users <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">Login Devices</span>
      </div>

      {/* User Header Card */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/students')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4" /> View Profile
          </button>
          <button onClick={handleResetAll} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors">
            <Trash2 className="w-4 h-4" /> Reset All Devices
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-semibold text-gray-600 mb-4">Total Devices</p>
          <h3 className="text-3xl font-bold text-blue-500">{devices.length}</h3>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1"><Smartphone className="w-3 h-3" /> All registered devices</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-semibold text-gray-600 mb-4">Active Devices</p>
          <h3 className="text-3xl font-bold text-green-500">{activeDevices}</h3>
          <p className="text-xs text-green-500 mt-4 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Currently active</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-semibold text-gray-600 mb-4">Blocked Devices</p>
          <h3 className="text-3xl font-bold text-red-500">{blockedDevices}</h3>
          <p className="text-xs text-red-500 mt-4 flex items-center gap-1"><Ban className="w-3 h-3" /> Blocked</p>
        </div>
      </div>

      {/* Devices List Table Card */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm mt-8">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Login Devices</h3>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <select className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500">
                <option>10</option>
                <option>25</option>
              </select>
              <span>devices per page</span>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search devices..." 
                className="border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 font-bold bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-100">Device</th>
                  <th className="px-4 py-3 border-b border-gray-100">OS / Browser</th>
                  <th className="px-4 py-3 border-b border-gray-100">IP Address</th>
                  <th className="px-4 py-3 border-b border-gray-100">Location</th>
                  <th className="px-4 py-3 border-b border-gray-100">First Login</th>
                  <th className="px-4 py-3 border-b border-gray-100">Last Activity</th>
                  <th className="px-4 py-3 border-b border-gray-100">Login Count</th>
                  <th className="px-4 py-3 border-b border-gray-100">Status</th>
                  <th className="px-4 py-3 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-500">No login devices found.</td></tr>
                ) : devices.map((device: any) => (
                  <tr key={device.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center">
                          {device.name.toLowerCase().includes('phone') || device.name.toLowerCase().includes('mobile') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 text-xs">{device.name}</p>
                          <p className="text-[10px] text-gray-400">Device</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-700 text-xs">{device.browser}</p>
                      <p className="text-[10px] text-gray-400">Browser</p>
                    </td>
                    <td className="px-4 py-4 text-blue-500 font-medium text-xs">{device.ipAddress}</td>
                    <td className="px-4 py-4 text-gray-500 text-xs">{device.location || "Local"}</td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-700">{new Date(device.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] text-gray-400">{new Date(device.lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-700">{new Date(device.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] text-gray-400">Recently</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">1x</span>
                    </td>
                    <td className="px-4 py-4">
                      {device.status === 'ACTIVE' ? (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Blocked</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDeleteDevice(device.id)} className="w-7 h-7 rounded border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors bg-white">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Showing 1 to {devices.length} of {devices.length} devices
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-12 text-[11px] text-gray-400">
        <div className="flex items-center gap-2">
          <span>Score Plus</span>
          <span>|</span>
          <span className="hover:text-blue-500 cursor-pointer">Contact</span>
          <span>|</span>
          <span className="hover:text-blue-500 cursor-pointer">Arknox Technology</span>
        </div>
        <div className="mt-2 sm:mt-0 text-right">
          <div>2026. made with ♥ by <span className="text-blue-500 cursor-pointer">Arknox Technology LTD</span></div>
          <div>&lt;/&gt; Contact us for more awesome projects at <span className="text-blue-500 cursor-pointer">www.arknox.in</span></div>
        </div>
      </div>
    </div>
  )
}
