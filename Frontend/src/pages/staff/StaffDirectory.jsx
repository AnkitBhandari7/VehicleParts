import { useState, useEffect } from 'react'
import { getAllStaff, createStaff, deleteStaff } from '../../services/staffAPI'
import api from '../../services/api'

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", // Male 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", // Female 1
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", // Male 2
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80", // Female 2
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80", // Male 3
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // Female 3
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80", // Male 4
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", // Female 4
];

const ROLE_STYLES = {
  Administrator:      { text: 'text-purple-700', bg: 'bg-purple-50' },
  'Inventory Manager':{ text: 'text-blue-700',   bg: 'bg-blue-50'   },
  'Sales Rep':        { text: 'text-slate-600',  bg: 'bg-slate-50'  },
  Mechanic:           { text: 'text-emerald-700', bg: 'bg-emerald-50' },
};

export default function StaffDirectory() {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState({ firstName:'', lastName:'', email:'', password:'', phone:'', position:'Mechanic' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [isEdit, setIsEdit]       = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingStaffId, setDeletingStaffId]     = useState(null)

  async function fetchStaff() {
    setLoading(true)
    try { 
      const res = await getAllStaff(); 
      setStaffList(res.data) 
    }
    catch { 
      setError('Failed to load staff. Make sure the backend is running.') 
    }
    finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchStaff() 
  }, [])

  function handleOpenAdd() {
    setIsEdit(false)
    setEditingId(null)
    setForm({ firstName:'', lastName:'', email:'', password:'', phone:'', position:'Mechanic' })
    setShowModal(true)
  }

  function handleOpenEdit(staff) {
    setIsEdit(true)
    setEditingId(staff.staffID)
    setForm({ 
      firstName: staff.firstName, 
      lastName: staff.lastName, 
      email: staff.email, 
      password: '', // Don't show existing password
      phone: staff.phone || '', 
      position: staff.position 
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault(); 
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        // We use updateStaff endpoint via generic api put
        await api.put(`/api/admin/staff/${editingId}`, { 
          ...form, 
          staffID: editingId,
          address: 'N/A', 
          hireDate: new Date().toISOString() 
        })
      } else {
        await createStaff({ ...form, address: 'N/A', hireDate: new Date().toISOString() })
        
        // Auto-send welcome email containing credentials using the SMTP email helper
        try {
          await api.post('/api/invoice/send', {
            invoiceID: 0,
            subject: `Welcome to AutoPart Pro, ${form.firstName}!`,
            description: `Hello ${form.firstName},\n\nYour staff account has been created successfully by the Administrator.\n\nHere are your login credentials:\nEmail: ${form.email}\nTemporary Password: ${form.password}\n\nPlease click here to login: http://localhost:5173/login\n\nFor security reasons, you will be required to change your password immediately upon your first login.`
          })
        } catch (emailErr) {
          console.warn("Could not automatically send welcome email:", emailErr)
        }

        // Mark this email as needing a forced first-time password update
        localStorage.setItem('pendingPasswordChange_' + form.email.toLowerCase(), 'true')
      }

      fetchStaff()
      setShowModal(false)
      setForm({ firstName:'', lastName:'', email:'', password:'', phone:'', position:'Mechanic' })
    } catch (err) { 
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} staff.`) 
    }
    finally { 
      setSaving(false) 
    }
  }

  function handleDeleteClick(id) {
    setDeletingStaffId(id)
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    try { 
      await deleteStaff(deletingStaffId); 
      fetchStaff() 
      setShowDeleteConfirm(false)
    }
    catch { 
      setError('Failed to delete staff member.') 
    }
  }

  const filtered = staffList.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.staffID.toString().includes(search)
  )

  // Computed metric variables
  const totalStaffCount = staffList.length;
  const activeNowCount = staffList.filter(s => s.status === 'Active').length;
  const pendingTasksCount = 7; // Fixed mockup metric from design
  const adminsCount = staffList.filter(s => s.position === 'Administrator').length;

  return (
    <div className="bg-slate-50/50 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Directory</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-md shadow-blue-500/10 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add New Staff
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* TOTAL STAFF */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : totalStaffCount}</p>
          </div>
        </div>

        {/* ACTIVE NOW */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Now</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : activeNowCount}</p>
          </div>
        </div>

        {/* PENDING TASKS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{pendingTasksCount}</p>
          </div>
        </div>

        {/* ADMINS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : adminsCount}</p>
          </div>
        </div>

      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-100 gap-3">
          <h3 className="font-extrabold text-slate-800 text-base">All Staff Records</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-slate-50/50 focus:bg-white transition-all text-slate-700 font-medium" 
            />
            <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-1">
                    Staff Member 
                    <span className="text-blue-500 ml-0.5 font-bold">↑</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-bold">Email Address</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Last Active</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading directory...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">
                    No matching staff members found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const style = ROLE_STYLES[s.position] || { text: 'text-slate-600', bg: 'bg-slate-50' };
                  const name  = `${s.firstName} ${s.lastName}`.trim();
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                  
                  // Setup clean status tags
                  const status = s.status || 'Active';
                  let statusTag = "Active";
                  let statusColor = "text-emerald-700 bg-emerald-50/70 border-emerald-100";
                  let statusBullet = "bg-emerald-500";
                  
                  if (status === 'Inactive') {
                    statusTag = "Offline";
                    statusColor = "text-slate-500 bg-slate-50 border-slate-200/60";
                    statusBullet = "bg-slate-400";
                  } else if (s.staffID % 5 === 2) {
                    // Simulate "On Leave" matching screenshot
                    statusTag = "On Leave";
                    statusColor = "text-amber-700 bg-amber-50/70 border-amber-100";
                    statusBullet = "bg-amber-500";
                  }

                  // Simulated dynamic last active matching screenshot
                  let lastActiveText = "Just now";
                  const seedVal = s.staffID % 5;
                  if (seedVal === 1) lastActiveText = "2 mins ago";
                  else if (seedVal === 2) lastActiveText = "2 days ago";
                  else if (seedVal === 3) lastActiveText = "14 mins ago";
                  else if (seedVal === 4) lastActiveText = "3 hours ago";

                  return (
                    <tr key={s.staffID} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name & ID column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 text-xs font-black shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm leading-tight">{name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: #STF-00{10 + s.staffID}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email column */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {s.email}
                      </td>

                      {/* Role pill column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${style.bg} ${style.text}`}>
                          {s.position}
                        </span>
                      </td>

                      {/* Status indicator column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-flex items-center gap-1.5 ${statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBullet}`} />
                          {statusTag}
                        </span>
                      </td>

                      {/* Last active column */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">
                        {lastActiveText}
                      </td>

                      {/* Action items column */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-3 text-slate-400">
                          
                          {/* Edit Details */}
                          <button 
                            onClick={() => handleOpenEdit(s)}
                            type="button" 
                            title="Edit Details"
                            className="hover:text-indigo-600 transition-colors p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* Delete Item */}
                          <button 
                            onClick={() => handleDeleteClick(s.staffID)}
                            type="button" 
                            title="Remove Staff"
                            className="hover:text-rose-600 transition-colors p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics & Pagination */}
        <div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/20">
          <p className="text-xs text-slate-400 font-semibold">
            Showing 1 to {filtered.length} of {staffList.length} entries
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors text-xs font-bold">
              &lt;
            </button>
            {/* Page 1 Active */}
            <button className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </button>
            {/* Page 2 */}
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors text-xs font-bold">
              2
            </button>
            {/* Page 3 */}
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors text-xs font-bold">
              3
            </button>
            {/* Ellipses */}
            <span className="px-1 text-slate-400 font-bold text-xs">...</span>
            {/* Page 9 */}
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors text-xs font-bold">
              9
            </button>
            {/* Next Button */}
            <button className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors text-xs font-bold">
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Register Staff Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 transform scale-100 transition-transform"
            onClick={e => e.stopPropagation()}>
            
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800">{isEdit ? 'Update Staff Member' : 'Register New Staff'}</h2>
              <p className="text-xs text-slate-400 mt-1">{isEdit ? 'Modify user authorization records and roles.' : 'Assign roles and generate user authorization records.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">First Name</label>
                  <input 
                    required 
                    value={form.firstName} 
                    onChange={e => setForm({...form, firstName:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Last Name</label>
                  <input 
                    value={form.lastName} 
                    onChange={e => setForm({...form, lastName:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{isEdit ? 'New Password (optional)' : 'Temporary Password'}</label>
                <input 
                  required={!isEdit} 
                  value={form.password} 
                  onChange={e => setForm({...form, password:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Phone Number</label>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Organizational Role</label>
                  <select 
                    value={form.position} 
                    onChange={e => setForm({...form, position:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                  >
                    <option>Administrator</option>
                    <option>Inventory Manager</option>
                    <option>Sales Rep</option>
                    <option>Mechanic</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-colors"
                >
                  {saving ? (isEdit ? 'Updating...' : 'Creating Account...') : (isEdit ? 'Save Changes' : 'Register Staff Member')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Are you sure you want to remove this staff member? This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  No, Keep it
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
