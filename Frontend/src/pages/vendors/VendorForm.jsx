import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'

const empty = { name: '', contactPerson: '', phone: '', email: '', address: '', isActive: true }

export default function VendorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get(`/api/vendor/${id}`)
      .then(r => {
        const v = r.data
        setForm({ name: v.name ?? '', contactPerson: v.contactPerson ?? '', phone: v.phone ?? '', email: v.email ?? '', address: v.address ?? '', isActive: v.isActive ?? true })
      })
      .catch(() => setError('Failed to load vendor.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const hc = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit(e) {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      if (isEdit) await api.put(`/api/vendor/${id}`, form)
      else await api.post('/api/vendor', form)
      navigate('/staff/vendors')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save.'
      setError(typeof msg === 'string' ? msg : 'Failed to save.')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Back Link and Header */}
        <div className="mb-6">
          <Link to="/staff/vendors" className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-900 font-bold mb-3 transition-colors uppercase tracking-wider">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Vendors
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h1>
        </div>

        <form onSubmit={submit}>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 bg-white">
              <h3 className="font-extrabold text-slate-900 text-sm">Vendor Information</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">All fields marked * are required</p>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-bold text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Vendor Name *</label>
                <input name="name" value={form.name} onChange={hc} required 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800 focus:bg-white font-semibold transition-colors shadow-sm" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Contact Person *</label>
                <input name="contactPerson" value={form.contactPerson} onChange={hc} required 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800 focus:bg-white font-semibold transition-colors shadow-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Phone *</label>
                  <input name="phone" value={form.phone} onChange={hc} required 
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800 focus:bg-white font-semibold transition-colors shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={hc} required 
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800 focus:bg-white font-semibold transition-colors shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Address *</label>
                <input name="address" value={form.address} onChange={hc} required 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800 focus:bg-white font-semibold transition-colors shadow-sm" />
              </div>

              {isEdit && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Vendor Status</label>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{form.isActive ? 'Active' : 'Inactive'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{form.isActive ? 'Visible for invoice creation' : 'Hidden from invoice creation'}</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <Link to="/staff/vendors" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 rounded-xl text-xs font-bold shadow-sm transition-all">Cancel</Link>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all">
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? 'Saving...' : isEdit ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}