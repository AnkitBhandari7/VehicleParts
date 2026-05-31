import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { getRole } from '../../services/auth'

export default function VendorList() {
  const [vendors, setVendors] = useState([])
  const [activeOnly, setActiveOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [targetVendor, setTargetVendor]           = useState(null)

  const role = getRole()
  const isAdmin = role === 'Admin'

  function load(only = activeOnly) {
    setLoading(true)
    api.get(`/api/vendor?activeOnly=${only}`)
      .then(r => setVendors(r.data))
      .catch(() => setError('Failed to load vendors.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function handleDeactivateClick(v) {
    setTargetVendor(v)
    setShowDeleteConfirm(true)
  }

  async function confirmDeactivate() {
    const id = targetVendor.vendorID
    setDeletingId(id)
    try {
      await api.delete(`/api/vendor/${id}`)
      setVendors(vs => vs.map(v => v.vendorID === id ? { ...v, isActive: false } : v))
      setShowDeleteConfirm(false)
    } catch { 
      alert('Failed to deactivate.') 
    }
    finally { 
      setDeletingId(null) 
    }
  }

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase()
    return !q || 
      v.name?.toLowerCase().includes(q) || 
      v.contactPerson?.toLowerCase().includes(q) || 
      v.email?.toLowerCase().includes(q) ||
      v.vendorID.toString().includes(q)
  })

  const active = vendors.filter(v => v.isActive).length

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      {/* Premium Subtitle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vendors</h1>
        </div>
        {isAdmin && (
          <Link to="/staff/vendors/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-md shadow-blue-500/10 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Vendor
          </Link>
        )}
      </div>

      {/* Modern Horizontal Stat Cards with Colored Icons & Badges */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* TOTAL VENDORS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vendors</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{vendors.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Registered providers</p>
            </div>
          </div>

          {/* ACTIVE VENDORS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Vendors</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{active}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Operative partners</p>
            </div>
          </div>

          {/* INACTIVE VENDORS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive Vendors</p>
              <p className="text-2xl font-black text-rose-600 mt-0.5">{vendors.length - active}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Suspended accounts</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="absolute left-3.5 top-2.5 text-slate-400 pointer-events-none"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..."
                className="pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-slate-50/50 text-slate-700 font-medium" />
            </div>

            {/* Simple toggle checkbox container */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-500 font-bold">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={() => { const v = !activeOnly; setActiveOnly(v); load(v) }}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500"
              />
              <span>Active Only</span>
            </label>
          </div>

          <span className="text-xs text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full">
            {!loading && `${filtered.length} vendor${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading vendors...</div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 text-sm font-semibold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold italic bg-white/50">No vendors found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        Vendor
                        <span className="text-blue-500 ml-0.5 font-bold">↑</span>
                      </div>
                    </th>
                    {['Contact Person', 'Phone', 'Email', 'Status'].map(h => (
                      <th key={h} className="px-6 py-4">{h}</th>
                    ))}
                    {isAdmin && <th className="px-6 py-4">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(v => (
                    <tr key={v.vendorID} className={`hover:bg-slate-50/30 transition-colors ${v.isActive ? '' : 'opacity-60'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 text-xs font-black flex-shrink-0 shadow-sm">
                            {v.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{v.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">VEND-{String(v.vendorID).padStart(3,'0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-550 font-bold">{v.contactPerson}</td>
                      <td className="px-6 py-4 text-slate-550 font-bold">{v.phone}</td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">{v.email}</td>
                      <td className="px-6 py-4">
                        {v.isActive
                          ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-100">Active</span>
                          : <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-100">Inactive</span>
                        }
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link to={`/staff/vendors/${v.vendorID}/edit`} 
                              className="p-1.5 border border-slate-200 rounded-xl text-slate-500 hover:border-blue-300 hover:bg-blue-50/40 transition-colors shadow-sm bg-white">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </Link>
                            {v.isActive && (
                              <button onClick={() => handleDeactivateClick(v)} disabled={deletingId === v.vendorID}
                                className="p-1.5 border border-rose-250 bg-rose-50 text-rose-650 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50 shadow-sm">
                                {deletingId === v.vendorID ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-200 border-top-2 border-red-650 rounded-full animate-spin" />
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-400 font-bold bg-white">
              Showing {filtered.length} of {vendors.length} vendors
            </div>
          </>
        )}
      </div>

      {/* Custom Deactivate Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deactivation</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Are you sure you want to deactivate "{targetVendor?.name}"? They will no longer be marked as an active partner.
              </p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  No, Keep Active
                </button>
                <button 
                  onClick={confirmDeactivate}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-colors"
                >
                  Yes, Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}