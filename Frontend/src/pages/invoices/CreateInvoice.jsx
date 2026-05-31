import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { getAllParts } from '../../services/inventoryAPI'

const empty = { vendorID: '', partID: '', quantityPurchased: '', unitCost: '', notes: '' }

function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`truncate max-w-[140px] text-right ${bold ? 'text-lg font-extrabold text-slate-900' : 'font-medium text-slate-800'}`}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [vendors, setVendors] = useState([])
  const [parts, setParts] = useState([])
  
  // Search & autocomplete state
  const [partSearch, setPartSearch] = useState('')
  const [showPartDropdown, setShowPartDropdown] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load active vendors and all parts on mount
    Promise.all([
      api.get('/api/vendor?activeOnly=true'),
      getAllParts()
    ])
    .then(([vendorRes, partsRes]) => {
      setVendors(vendorRes.data)
      setParts(partsRes.data)
    })
    .catch(() => {})
  }, [])

  const hc = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const qty = Number(form.quantityPurchased)
  const cost = Number(form.unitCost)
  const total = qty > 0 && cost > 0 ? qty * cost : null
  
  const selVendor = vendors.find(v => String(v.vendorID) === String(form.vendorID))
  const selPart = parts.find(p => String(p.partID) === String(form.partID))

  const money = n => `Rs. ${Number(n ?? 0).toLocaleString()}`

  // Filter parts based on user search query
  const filteredParts = partSearch.trim() === ''
    ? parts
    : parts.filter(p => 
        p.name?.toLowerCase().includes(partSearch.toLowerCase()) || 
        p.partNumber?.toLowerCase().includes(partSearch.toLowerCase())
      )

  const handleSelectPart = (part) => {
    setForm(f => ({ ...f, partID: String(part.partID) }))
    setPartSearch(`${part.name} (${part.partNumber})`)
    setShowPartDropdown(false)
  }

  const handleClearPart = () => {
    setForm(f => ({ ...f, partID: '' }))
    setPartSearch('')
  }

  async function submit(e) {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      await api.post('/api/purchaseinvoice', { 
        vendorID: Number(form.vendorID), 
        partID: Number(form.partID), 
        quantityPurchased: qty, 
        unitCost: cost, 
        notes: form.notes 
      })
      navigate('/staff/invoices')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create invoice.'
      setError(typeof msg === 'string' ? msg : 'Failed to create invoice.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="p-8">
      {/* Back button and Header */}
      <div className="mb-6">
        <Link to="/staff/invoices" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Purchase Invoice</h1>
      </div>

      <form onSubmit={submit}>
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* Left Columns - Form Sections */}
          <div className="col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Vendor Section */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h3 className="font-semibold text-slate-900">Select Vendor</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vendor</label>
                  <select name="vendorID" value={form.vendorID} onChange={hc} required 
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800">
                    <option value="">Select an active vendor...</option>
                    {vendors.map(v => <option key={v.vendorID} value={v.vendorID}>{v.name}</option>)}
                  </select>
                </div>

                {selVendor && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl transition-all">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                      {selVendor.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{selVendor.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{selVendor.contactPerson} · {selVendor.phone}</p>
                    </div>
                    <div className="ml-auto text-green-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Item Details Section */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <h3 className="font-semibold text-slate-900">Item Details</h3>
              </div>
              <div className="p-6 space-y-4">
                
                {/* Autocomplete Part Search */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Part Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Type to search part by name or number..."
                      value={partSearch}
                      onChange={(e) => {
                        setPartSearch(e.target.value)
                        setShowPartDropdown(true)
                        if (form.partID) {
                          // Clear selection if they start editing
                          setForm(f => ({ ...f, partID: '' }))
                        }
                      }}
                      onFocus={() => setShowPartDropdown(true)}
                      required={!form.partID}
                      className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 focus:bg-white transition-colors" 
                    />
                    {form.partID && (
                      <button 
                        type="button"
                        onClick={handleClearPart}
                        className="absolute right-3 top-2.5 text-slate-450 hover:text-slate-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Search and select the existing part to update its stock level.</p>

                  {/* Autocomplete Dropdown List */}
                  {showPartDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredParts.length === 0 ? (
                        <div className="p-3 text-sm text-slate-450 text-center">
                          No matching parts found.
                        </div>
                      ) : (
                        filteredParts.map(part => (
                          <div
                            key={part.partID}
                            onClick={() => handleSelectPart(part)}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm flex justify-between items-center transition-colors">
                            <div>
                              <p className="font-semibold text-slate-800">{part.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">Part No: {part.partNumber} · Category: {part.category}</p>
                            </div>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              Stock: {part.stock}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Part Badge Detail */}
                {selPart && (
                  <div className="flex items-center gap-3 p-4 bg-green-50/50 border border-green-100 rounded-xl transition-all">
                    <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                      ID
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{selPart.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Current Stock Level: {selPart.stock} (Threshold: {selPart.lowStockThreshold})</p>
                    </div>
                    <div className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                      Selected ID: #{selPart.partID}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                    <input type="number" name="quantityPurchased" value={form.quantityPurchased} onChange={hc} required min="1" placeholder="0"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Unit Cost (Rs.)</label>
                    <input type="number" name="unitCost" value={form.unitCost} onChange={hc} required min="0.01" step="0.01" placeholder="0.00"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 focus:bg-white transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes (optional)</label>
                  <textarea name="notes" value={form.notes} onChange={hc} rows={3} placeholder="Additional notes about this purchase..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 focus:bg-white resize-none transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary Sticky Panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Order Summary</h3>
            </div>
            <div className="p-6 space-y-3">
              <SummaryRow label="Vendor" value={selVendor?.name} />
              <SummaryRow label="Part ID" value={form.partID ? `#${form.partID}` : ''} />
              <SummaryRow label="Part Name" value={selPart?.name} />
              <SummaryRow label="Quantity" value={form.quantityPurchased} />
              <SummaryRow label="Unit Cost" value={cost > 0 ? money(cost) : ''} />
              <div className="border-t border-slate-100 my-2 pt-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Grand Total</span>
                <span className={`text-2xl font-extrabold transition-colors ${total != null ? 'text-blue-600' : 'text-slate-200'}`}>
                  {total != null ? money(total) : '—'}
                </span>
              </div>
            </div>

            <div className="mx-6 mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-2 items-start">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs text-blue-700 leading-normal">Submitting this invoice will automatically update the part's stock level.</p>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <button type="submit" disabled={submitting || !form.partID}
                className="w-full py-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? 'Creating...' : 'Submit Purchase Order'}
              </button>
              <Link to="/staff/invoices" className="block w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold text-center transition-colors">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}