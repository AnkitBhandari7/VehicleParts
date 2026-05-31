import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { getRole } from '../../services/auth'

const emptyV = { vehicleNumber: '', make: '', model: '', year: '', color: '', notes: '', vin: '' }

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-slate-800 font-extrabold">{value || '—'}</span>
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [vForm, setVForm] = useState(emptyV)
  const [adding, setAdding] = useState(false)
  const [vError, setVError] = useState('')

  const role = getRole()
  const isStaff = role === 'Staff'

  useEffect(() => {
    Promise.all([api.get(`/api/customer/${id}`), api.get(`/api/customer/${id}/vehicles`)])
      .then(([c, v]) => { setCustomer(c.data); setVehicles(v.data) })
      .catch(() => setError('Customer not found.'))
      .finally(() => setLoading(false))
  }, [id])

  async function addVehicle(e) {
    e.preventDefault()
    setVError('')
    if (!vForm.vehicleNumber || !vForm.make || !vForm.model || !vForm.year) { 
      setVError('Plate, make, model and year are required.')
      return 
    }
    setAdding(true)
    try {
      const res = await api.post(`/api/customer/${id}/vehicles`, vForm)
      setVehicles([...vehicles, res.data])
      setVForm(emptyV)
      setShowForm(false)
    } catch { 
      setVError('Failed to add vehicle.') 
    } finally { 
      setAdding(false) 
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 bg-slate-50/50 min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4 bg-slate-50/50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <p className="text-sm text-rose-600 font-bold">⚠️ {error}</p>
          <Link to="/staff/customers" className="inline-flex justify-center items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm">
            Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  const initials = `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase()
  const money = n => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen pb-12">
      {/* Back button */}
      <div>
        <Link to="/staff/customers" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 uppercase tracking-widest transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Customers
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-500">
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 px-6 sm:px-10 py-10 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl -ml-24 -mb-24" />
          
          <div className="flex items-center gap-8 flex-wrap relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-black text-white backdrop-blur-xl shadow-2xl ring-4 ring-white/5">
              {initials}
            </div>
            <div className="flex-1 min-w-[250px]">
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">{customer.firstName} {customer.lastName}</h1>
              <div className="flex items-center gap-4 mt-4 flex-wrap text-[11px] font-bold uppercase tracking-widest">
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  Active Profile
                </span>
                {customer.creditStatus && (
                  <span className={`px-4 py-1.5 rounded-full border backdrop-blur-md
                    ${customer.creditStatus === 'Good' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}
                  `}>
                    Credit: {customer.creditStatus}
                  </span>
                )}
                {customer.registeredAt && (
                  <span className="text-white/50 font-semibold normal-case flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    Member since {new Date(customer.registeredAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/staff/customers" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-2xl border border-white/15 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95">
                All Customers
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white">
          {[
            { label: 'Total Revenue', value: money(customer.totalSpent), color: 'text-blue-700' },
            { label: 'Loyalty Balance', value: `${(customer.loyaltyPoints ?? 0).toLocaleString()} PTS`, color: 'text-blue-600' },
            { label: 'Registered Vehicles', value: `${vehicles.length} VEHICLE(S)`, color: 'text-blue-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="py-7 px-6 text-center hover:bg-slate-50/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-3">{label}</p>
              <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info (Spans 1/3) */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Contact Information</h3>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Email Address" value={customer.email || customer.user?.email} />
            <Field label="Phone Number" value={customer.phone} />
            <Field label="Home Address" value={customer.address} />
            <Field label="Date of Birth" value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null} />
          </div>
        </div>

        {/* Vehicles List (Spans 2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Garage Vehicles</h3>
              <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{vehicles.length}</span>
            </div>
            {isStaff && (
              <button 
                onClick={() => { setShowForm(!showForm); setVError('') }}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all shadow-sm ${
                  showForm 
                    ? 'border-rose-200 bg-rose-50 text-rose-650 hover:bg-rose-100' 
                    : 'border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100/60'
                }`}
              >
                {showForm ? 'Cancel' : '+ Add Automobile'}
              </button>
            )}
          </div>

          {showForm && isStaff && (
            <form onSubmit={addVehicle} className="p-6 bg-slate-50/60 border-b border-slate-150 space-y-5.5 shadow-inner">
              {vError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs font-bold text-rose-650">
                  ⚠️ {vError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                {[
                  { name: 'vehicleNumber', label: 'Plate/Number *' },
                  { name: 'make', label: 'Make *' },
                  { name: 'model', label: 'Model *' },
                  { name: 'year', label: 'Year *' },
                  { name: 'color', label: 'Color' },
                  { name: 'vin', label: 'VIN' },
                ].map(({ name, label }) => (
                  <div key={name} className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-2">{label}</label>
                    <input 
                      type="text" 
                      name={name} 
                      value={vForm[name]}
                      onChange={e => setVForm({ ...vForm, [e.target.name]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-800 font-bold transition-all shadow-sm" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2">Automobile Notes</label>
                <input 
                  type="text" 
                  name="notes" 
                  value={vForm.notes} 
                  onChange={e => setVForm({ ...vForm, notes: e.target.value })}
                  placeholder="Enter details like engine types or past modifications..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-800 font-bold transition-all shadow-sm" 
                />
              </div>
              <button 
                type="submit" 
                disabled={adding}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-md shadow-slate-900/10"
              >
                {adding && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {adding ? 'Adding Vehicle...' : 'Register Automobile'}
              </button>
            </form>
          )}

          {vehicles.length === 0 && !showForm ? (
            <div className="text-center py-16 text-slate-400 space-y-3 bg-white">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-35">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No vehicles registered yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {vehicles.map((v, i) => (
                <div key={v.vehicleID ?? i} className="flex items-center gap-4.5 p-5.5 hover:bg-slate-50/50 transition-colors duration-250">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100/35">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-wide truncate">
                        {v.make} {v.model}
                      </p>
                      <span className="bg-slate-100 border border-slate-200/50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">
                        {v.year}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Plate ID: <strong className="text-slate-600 font-bold">{v.vehicleNumber}</strong>
                      {v.color ? ` · Color: ${v.color}` : ''}
                      {v.vin ? ` · VIN: ${v.vin}` : ''}
                    </p>
                    {v.notes && (
                      <p className="text-[10px] text-slate-400 font-medium italic mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Notes: {v.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}