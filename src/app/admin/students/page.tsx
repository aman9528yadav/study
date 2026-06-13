"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, AlertCircle, Percent, Eye, Edit2, Smartphone, Trash2 } from "lucide-react"
import { getStudents, updateStudentStatus, updateStudent, deleteStudent, updateEnrollmentStatus } from "@/app/actions/student"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UsersManagerPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [editUser, setEditUser] = useState<any>(null)
  const [blockUser, setBlockUser] = useState<any>(null)
  const [viewUser, setViewUser] = useState<any>(null)
  const [suspendDate, setSuspendDate] = useState<string>("")

  const fetchStudents = async () => {
    setLoading(true)
    const res = await getStudents()
    if (res.success) {
      setStudents(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string, date?: Date) => {
    const res = await updateStudentStatus(id, newStatus, date)
    if (res.success) {
      fetchStudents()
      setBlockUser(null)
      setSuspendDate("")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editUser) return
    const formData = new FormData(e.currentTarget)
    const res = await updateStudent(editUser.id, {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string
    })
    if (res.success) {
      fetchStudents()
      setEditUser(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to completely delete this user?")) {
      const res = await deleteStudent(id)
      if (res.success) fetchStudents()
    }
  }

  const handleEnrollmentStatusChange = async (enrollmentId: string, status: string) => {
    const res = await updateEnrollmentStatus(enrollmentId, status)
    if (res.success) {
      // Re-fetch students and update the current viewUser state to reflect changes
      fetchStudents()
      // Note: setViewUser will reflect stale data until modal is closed/reopened, 
      // but for simplicity, we could just close the modal or update it locally.
      // Better: Update local viewUser state
      if (viewUser) {
        setViewUser({
          ...viewUser,
          enrollments: viewUser.enrollments.map((e: any) => 
            e.id === enrollmentId ? { ...e, status } : e
          )
        })
      }
    } else {
      alert(res.error || "Failed to update enrollment")
    }
  }

  // Calculate stats
  const totalUsers = students.length
  const verifiedUsers = students.filter(s => s.status === 'ACTIVE').length
  const unverifiedUsers = totalUsers - verifiedUsers
  const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-blue-500 mb-2 font-medium">
        Dashboard <span className="text-gray-400 mx-1">/</span> Users <span className="text-gray-400 mx-1">/</span> <span className="text-gray-500">All Users</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-gray-800 mb-6">All Users</h1>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center mb-4 text-white">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalUsers}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Total Users</p>
          <p className="text-xs text-gray-400">All registered users</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-green-500 rounded-md flex items-center justify-center mb-4 text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{verifiedUsers}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Verified Users</p>
          <p className="text-xs text-gray-400">Email verified accounts</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-orange-400 rounded-md flex items-center justify-center mb-4 text-white">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{unverifiedUsers}</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Unverified Users</p>
          <p className="text-xs text-gray-400">Pending email verification</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center mb-4 text-white">
            <Percent className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{verificationRate}%</h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">Verification Rate</p>
          <p className="text-xs text-gray-400">Email verification success rate</p>
        </div>
      </div>

      {/* Users List Table Card */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm mt-8">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Users List</h3>
          <span className="text-sm text-gray-400">Total: {totalUsers} users</span>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <select className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>users per page</span>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search users..." 
                className="border border-gray-200 rounded-full px-4 py-1.5 text-sm outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 font-bold bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-100">ID</th>
                  <th className="px-4 py-3 border-b border-gray-100">User</th>
                  <th className="px-4 py-3 border-b border-gray-100">Email</th>
                  <th className="px-4 py-3 border-b border-gray-100">Phone</th>
                  <th className="px-4 py-3 border-b border-gray-100">Batches</th>
                  <th className="px-4 py-3 border-b border-gray-100">Date of Birth</th>
                  <th className="px-4 py-3 border-b border-gray-100">Joined Date</th>
                  <th className="px-4 py-3 border-b border-gray-100">Login Devices</th>
                  <th className="px-4 py-3 border-b border-gray-100">Status</th>
                  <th className="px-4 py-3 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-500">Loading users...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-500">No users found.</td></tr>
                ) : students.map((student, idx) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{student.email}</td>
                    <td className="px-4 py-4 text-gray-400">{student.phone || "N/A"}</td>
                    <td className="px-4 py-4 text-blue-500 bg-blue-50 rounded-full inline-block mt-3 mb-3 ml-2 px-2 text-xs font-semibold">{student.enrollments?.length || 0}</td>
                    <td className="px-4 py-4 text-gray-400">N/A</td>
                    <td className="px-4 py-4 text-gray-500">{new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-4 text-gray-500 flex items-center gap-1"><Smartphone className="w-3 h-3" /> N/A</td>
                    <td className="px-4 py-4">
                      {student.status === 'ACTIVE' ? (
                        <span onClick={() => setBlockUser(student)} className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-green-600">Verified</span>
                      ) : student.status === 'SUSPENDED' ? (
                        <span onClick={() => setBlockUser(student)} className="bg-orange-400 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-orange-500">Suspended</span>
                      ) : (
                        <span onClick={() => setBlockUser(student)} className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-red-600">Banned</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewUser(student)} className="w-7 h-7 rounded border border-blue-200 text-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors bg-white">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditUser(student)} className="w-7 h-7 rounded border border-green-200 text-green-500 flex items-center justify-center hover:bg-green-50 transition-colors bg-white">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/admin/users/${student.id}/devices`} className="w-7 h-7 rounded border border-orange-200 text-orange-400 flex items-center justify-center hover:bg-orange-50 transition-colors bg-orange-50">
                          <Smartphone className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(student.id)} className="w-7 h-7 rounded border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors bg-red-50">
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
            Showing 1 to {students.length} of {students.length} users
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

      {/* Edit User Modal */}
      <Dialog isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User Profile" description="Update student details">
        {editUser && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={editUser.name} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="phone" defaultValue={editUser.phone || ""} placeholder="N/A" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Block User Modal */}
      <Dialog isOpen={!!blockUser} onClose={() => setBlockUser(null)} title="Manage User Access" description="Temporarily suspend or permanently ban this user.">
        {blockUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Current Status: <span className="font-bold">{blockUser.status}</span></p>
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={() => handleUpdateStatus(blockUser.id, 'ACTIVE')} variant={blockUser.status === 'ACTIVE' ? 'default' : 'outline'} className="w-full justify-start">🟢 Active (Verified)</Button>
              
              <div className={`p-3 rounded-md border transition-colors ${blockUser.status === 'SUSPENDED' ? 'border-orange-400 bg-orange-50/50' : 'border-gray-200 bg-white'}`}>
                <Button onClick={() => handleUpdateStatus(blockUser.id, 'SUSPENDED', suspendDate ? new Date(suspendDate) : undefined)} variant={blockUser.status === 'SUSPENDED' ? 'default' : 'outline'} className={`w-full justify-start ${blockUser.status === 'SUSPENDED' ? '' : 'text-orange-600 border-orange-200 hover:bg-orange-50'} mb-3`}>
                  🟠 Suspended (Temporary Block)
                </Button>
                <div className="space-y-1.5 px-1">
                  <Label className="text-xs text-gray-500">Ban until (optional):</Label>
                  <Input type="datetime-local" value={suspendDate} onChange={(e) => setSuspendDate(e.target.value)} className="text-sm bg-white" />
                  <p className="text-[10px] text-gray-400">If you leave this empty, they will be suspended indefinitely until manually unbanned.</p>
                </div>
              </div>

              <Button onClick={() => handleUpdateStatus(blockUser.id, 'BANNED')} variant={blockUser.status === 'BANNED' ? 'default' : 'outline'} className={`w-full justify-start ${blockUser.status === 'BANNED' ? '' : 'text-red-600 border-red-200 hover:bg-red-50'}`}>🔴 Banned (Permanent Block)</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* View User Enrollments Modal */}
      <Dialog isOpen={!!viewUser} onClose={() => setViewUser(null)} title={`${viewUser?.name}'s Enrollments`} description="Manage requested batches">
        {viewUser && (
          <div className="space-y-4">
            {!viewUser.enrollments || viewUser.enrollments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">This student is not enrolled in any batches.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {viewUser.enrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{enrollment.batch?.title || "Unknown Batch"}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: <span className={`font-bold ${
                          enrollment.status === 'APPROVED' ? 'text-green-500' :
                          enrollment.status === 'PENDING' ? 'text-orange-500' :
                          'text-red-500'
                        }`}>{enrollment.status || 'PENDING'}</span>
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {enrollment.status !== 'APPROVED' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleEnrollmentStatusChange(enrollment.id, 'APPROVED')}>
                          Approve
                        </Button>
                      )}
                      {enrollment.status !== 'REJECTED' && (
                        <Button size="sm" variant="destructive" onClick={() => handleEnrollmentStatusChange(enrollment.id, 'REJECTED')}>
                          Reject
                        </Button>
                      )}
                      {enrollment.status !== 'PENDING' && (
                        <Button size="sm" variant="outline" onClick={() => handleEnrollmentStatusChange(enrollment.id, 'PENDING')}>
                          Make Pending
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
