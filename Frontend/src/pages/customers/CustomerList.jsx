import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { getRole } from '../../services/auth'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const role = getRole()
  const isStaff = role === 'Staff'

  useEffect(() => {
    api.get('/api/customer')
      .then(r => setCustomers(r.data))
      .catch(() => setError('Could not load customers. Ensure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || 
      c.firstName?.toLowerCase().includes(q) || 
      c.lastName?.toLowerCase().includes(q) || 
      c.email?.toLowerCase().includes(q) || 
      c.phone?.includes(q) ||
      c.customerID.toString().includes(q)
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      {/* Premium Subtitle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customers</h1>
        </div>
        {isStaff && (
          <Link to="/staff/customers/register"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-md shadow-blue-500/10 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Register Customer
          </Link>
        )}
      </div>

      {/* Modern Horizontal Stat Cards with Colored Icons & Badges */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* TOTAL CUSTOMERS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-blue-50 text-blue-650">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{customers.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Registered customer base</p>
            </div>
          </div>

          {/* ACTIVE PORTAL USERS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Portal Users</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{customers.filter(c => c.email).length}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Online customer profiles</p>
            </div>
          </div>
        </div>
      )}

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-100 gap-3 bg-white">
          <h3 className="font-extrabold text-slate-800 text-base">All Customer Records</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search name, email or phone..." 
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
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading directory...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-rose-500 text-sm font-semibold">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium italic">
              No matching customers found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 font-bold">
                    <div className="flex items-center gap-1">
                      Customer 
                      <span className="text-blue-500 ml-0.5 font-bold">↑</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-bold">Email Address</th>
                  <th className="px-6 py-4 font-bold">Phone Number</th>
                  <th className="px-6 py-4 font-bold">Street Address</th>
                  <th className="px-6 py-4 font-bold">Joined Date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(c => {
                  const name = `${c.firstName} ${c.lastName}`.trim()
                  const ini  = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  
                  return (
                    <tr key={c.customerID} className="hover:bg-slate-50/50 transition-colors">
                      {/* Customer name and avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 text-xs font-black shadow-sm">
                            {ini}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm leading-tight">{name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: #CUST-{String(c.customerID).padStart(4,'0')}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-550 font-medium">
                        {c.email || '—'}
                      </td>

                      {/* Phone Number */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-550 font-semibold">
                        {c.phone || '—'}
                      </td>

                      {/* Street Address */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold max-w-[180px] truncate">
                        {c.address || '—'}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">
                        {c.registeredAt ? new Date(c.registeredAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full border text-[10px] font-bold inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-3 text-slate-400">
                          
                          {/* View Profile */}
                          <Link 
                            to={`/staff/customers/${c.customerID}`}
                            title="View Customer Profile"
                            className="hover:text-blue-600 transition-colors p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>

                          {/* Edit details */}
                          <Link 
                            to={`/staff/customers/${c.customerID}`}
                            title="Edit Details"
                            className="hover:text-blue-600 transition-colors p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Statistics & Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/20">
            <p className="text-xs text-slate-400 font-semibold">
              Showing 1 to {filtered.length} of {customers.length} entries
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
        )}
      </div>
    </div>
  )
}