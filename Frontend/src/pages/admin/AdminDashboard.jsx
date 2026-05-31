import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function AdminDashboard() {
  const [report,   setReport]   = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [staff,    setStaff]    = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/admin/reports/financial'),
      api.get('/api/notifications/low-stock'),
      api.get('/api/admin/staff'),
    ]).then(([r, s, st]) => {
      if (r.status  === 'fulfilled') setReport(r.value.data)
      if (s.status  === 'fulfilled') setLowStock(s.value.data)
      if (st.status === 'fulfilled') setStaff(st.value.data)
    }).finally(() => setLoading(false))
  }, [])

  const money = n => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      
      {/* Premium Subtitle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        </div>
      </div>

      {/* Modern Horizontal Stat Cards with Colored Icons & Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* TOTAL REVENUE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? "..." : money(report?.summary?.totalRevenue)}</p>
          </div>
        </div>

        {/* LOW STOCK PARTS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className={`p-3.5 rounded-xl ${lowStock.length > 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Parts</p>
            <p className={`text-2xl font-black mt-0.5 ${lowStock.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {loading ? "..." : lowStock.length}
            </p>
          </div>
        </div>

        {/* STAFF MEMBERS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Members</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? "..." : staff.length}</p>
          </div>
        </div>

        {/* TOTAL INVOICES */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? "..." : (report?.summary?.totalInvoices ?? '—')}</p>
          </div>
        </div>

      </div>

      {/* Two Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Low Stock Alerts (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Low Stock Alerts</h3>
            </div>
            <Link 
              to="/admin/notifications" 
              className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 bg-white rounded-xl shadow-sm transition-all"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading stock reports...</div>
            ) : lowStock.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold italic bg-white/50">
                All components are fully stocked.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Part Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4">Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStock.slice(0, 6).map((p) => (
                    <tr key={p.partID} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-slate-900">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200/30">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-bold">{p.lowStockThreshold} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Staff Members list (Spans 1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Staff Directory</h3>
            </div>
            <Link 
              to="/admin/staff" 
              className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 bg-white rounded-xl shadow-sm transition-all"
            >
              Manage
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading operators...</div>
            ) : staff.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold italic bg-white/50">
                No staff members registered.
              </div>
            ) : (
              staff.slice(0, 6).map((s, i) => {
                const name = `${s.firstName} ${s.lastName}`.trim()
                const ini  = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div key={s.staffID ?? i} className="flex items-center gap-3.5 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 text-xs font-black shadow-sm">
                      {ini}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 truncate leading-tight">{name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.position}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-extrabold text-slate-900 text-sm mb-5">Quick Access Portal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {[
            { label: 'Financial Report', to: '/admin/financial',    icon: <IconChart /> },
            { label: 'Manage Staff',     to: '/admin/staff',        icon: <IconUsers /> },
            { label: 'Notifications',    to: '/admin/notifications',icon: <IconBell />  },
            { label: 'Parts Inventory',  to: '/staff/inventory',    icon: <IconBox />   },
            { label: 'Purchase Invoice', to: '/staff/invoices',     icon: <IconDoc />   },
            { label: 'Vendors',          to: '/staff/vendors',      icon: <IconStore /> },
            { label: 'Customers',        to: '/staff/customers',    icon: <IconSearch />},
          ].map(({ label, to, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-150 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-center group bg-slate-50/30"
            >
              <div className="text-slate-500 group-hover:text-blue-600 transition-colors p-2 rounded-lg bg-white border border-slate-200/50 shadow-sm group-hover:border-blue-200/50">
                {icon}
              </div>
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-800 uppercase tracking-wide leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Simple SVG icons ───────────────────────────────────────────────────────────
function IconChart() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
function IconDoc() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
function IconStore() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
