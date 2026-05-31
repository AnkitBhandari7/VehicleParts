import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [vendors, setVendors] = useState([])
  const [vendorFilter, setVendorFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/api/purchaseinvoice'), api.get('/api/vendor')])
      .then(([inv, vnd]) => { setInvoices(inv.data); setVendors(vnd.data) })
      .catch(() => setError('Failed to load invoices.'))
      .finally(() => setLoading(false))
  }, [])

  const vendorMap = Object.fromEntries(vendors.map(v => [v.vendorID, v.name]))
  const filtered = invoices.filter(i => {
    const matchesVendor = !vendorFilter || String(i.vendorID) === vendorFilter;
    const vendorName = vendorMap[i.vendorID]?.toLowerCase() || '';
    const q = search.toLowerCase();
    
    const matchesSearch = !q || 
      i.purchaseInvoiceID.toString().includes(q) || 
      i.partID.toString().includes(q) ||
      vendorName.includes(q);
      
    return matchesVendor && matchesSearch;
  })
  const totalSpent = filtered.reduce((s, i) => s + Number(i.totalCost ?? 0), 0)
  const totalQty = filtered.reduce((s, i) => s + Number(i.quantityPurchased ?? 0), 0)

  const money = n => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      {/* Premium Subtitle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Purchase Invoices</h1>
        </div>
        <Link to="/staff/invoices/create" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-md shadow-blue-500/10 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Invoice
        </Link>
      </div>

      {/* Modern Horizontal Stat Cards with Colored Icons & Badges */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* TOTAL INVOICES */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-blue-50 text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{filtered.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{vendorFilter ? `From ${vendorMap[Number(vendorFilter)] ?? 'vendor'}` : 'All vendors'}</p>
            </div>
          </div>

          {/* TOTAL SPENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{money(totalSpent)}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Procurement cost</p>
            </div>
          </div>

          {/* UNITS PURCHASED */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Units Purchased</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalQty.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Total stock added</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              Invoice Records
              {!loading && (
                <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100">
                  {filtered.length}
                </span>
              )}
            </h3>
            
            <div className="relative">
              <input 
                type="text"
                placeholder="Search by ID or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-full bg-slate-50/50 text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64 shadow-sm"
              />
              <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-bold shadow-sm">
              <option value="">All Vendors</option>
              {vendors.map(v => <option key={v.vendorID} value={v.vendorID}>{v.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading invoices...</div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 text-sm font-semibold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white/50">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-55">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-xs font-bold text-slate-900">No invoices found</p>
            <Link to="/staff/invoices/create" className="text-xs text-blue-600 font-bold hover:underline mt-2 inline-block">Create your first invoice →</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {['Invoice', 'Vendor', 'Part ID', 'Qty', 'Unit Cost', 'Total Cost', 'Stock After', 'Date'].map(h => (
                      <th key={h} className="px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(inv => (
                    <tr key={inv.purchaseInvoiceID} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100/60 px-2 py-0.5 rounded-lg text-[10px] font-extrabold">#{inv.purchaseInvoiceID}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">{vendorMap[inv.vendorID] ?? `Vendor #${inv.vendorID}`}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 border border-slate-200/40 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">#{inv.partID}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-550 font-bold">{inv.quantityPurchased}</td>
                      <td className="px-6 py-4 text-slate-550 font-bold">{money(inv.unitCost)}</td>
                      <td className="px-6 py-4 font-black text-slate-900">{money(inv.totalCost)}</td>
                      <td className="px-6 py-4">
                        {inv.updatedStockLevel != null
                          ? <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">↑ {inv.updatedStockLevel} units</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(inv.purchasedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold bg-white">
              <span>Showing {filtered.length} of {invoices.length} invoices</span>
              <span className="font-extrabold text-slate-900">Total Spent: {money(totalSpent)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}