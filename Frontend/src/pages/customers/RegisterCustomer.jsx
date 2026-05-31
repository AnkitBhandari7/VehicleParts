import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

const emptyC = { email: '', password: '', firstName: '', lastName: '', phone: '', address: '', dateOfBirth: '' }
const emptyV = { vehicleNumber: '', make: '', model: '', year: '', color: '', notes: '', vin: '' }

function Section({ num, title, sub, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center flex-shrink-0 shadow-sm shadow-slate-900/10">
          {num}
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">{title}</h3>
          {sub && <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="p-6 sm:p-8 bg-white">{children}</div>
    </div>
  )
}

export default function RegisterCustomer() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyC)
  const [vehicles, setVehicles] = useState([])
  const [vForm, setVForm] = useState(emptyV)
  const [showVForm, setShowVForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [vError, setVError] = useState('')

  const hc = e => setForm({ ...form, [e.target.name]: e.target.value })
  const hvc = e => setVForm({ ...vForm, [e.target.name]: e.target.value })

  function addVehicle() {
    if (!vForm.vehicleNumber || !vForm.make || !vForm.model || !vForm.year) { 
      setVError('Plate, make, model and year are required.')
      return 
    }
    setVehicles([...vehicles, vForm])
    setVForm(emptyV)
    setShowVForm(false)
    setVError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = { ...form, dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth + 'T00:00:00Z').toISOString() : form.dateOfBirth }
      const res = await api.post('/api/customer/register', payload)
      const id = res.data.customerID
      for (const v of vehicles) {
        await api.post(`/api/customer/${id}/vehicles`, v)
      }
      navigate(`/staff/customers/${id}`)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.'
      setError(typeof msg === 'string' ? msg : 'Registration failed.')
    } finally { 
      setSubmitting(false) 
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen pb-12">
      {/* Back Link and Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/staff/customers" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 uppercase tracking-widest mb-3 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Customers
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Register Customer</h1>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 text-xs text-rose-700 font-bold flex gap-3 items-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-rose-550">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <Section num="1" title="Personal Details" sub="Complete the core profile identity fields">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
            {[
              { name: 'firstName', label: 'First Name', req: true },
              { name: 'lastName', label: 'Last Name', req: true },
              { name: 'email', label: 'Email Address', type: 'email', req: true },
              { name: 'password', label: 'Password', type: 'password', req: true, hint: 'Minimum 6 alphanumeric characters' },
              { name: 'phone', label: 'Phone Number', req: true },
              { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', req: true },
            ].map(({ name, label, type = 'text', req, hint }) => (
              <div key={name} className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {label}
                </label>
                <input 
                  type={type} 
                  name={name} 
                  value={form[name]} 
                  onChange={hc} 
                  required={req}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 focus:bg-white text-slate-800 font-bold transition-all shadow-sm" 
                />
                {hint && <p className="text-[9px] font-semibold text-slate-400 mt-1.5 leading-none">{hint}</p>}
              </div>
            ))}
            <div className="sm:col-span-2 flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Street Address
              </label>
              <input 
                name="address" 
                value={form.address} 
                onChange={hc} 
                required 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 focus:bg-white text-slate-800 font-bold transition-all shadow-sm" 
              />
            </div>
          </div>
        </Section>

        <Section num="2" title="Vehicle Details" sub="Optional — Link registered automobiles to this account">
          <div className="space-y-4">
            {vehicles.map((v, i) => (
              <div key={i} className="flex items-center gap-4.5 p-4.5 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-900 truncate uppercase leading-snug">
                      {v.make} {v.model}
                    </p>
                    <span className="bg-slate-100 border border-slate-200/50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">
                      {v.year}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Plate: <strong className="text-slate-600">{v.vehicleNumber}</strong>{v.color ? ` · Color: ${v.color}` : ''}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setVehicles(vehicles.filter((_, j) => j !== i))}
                  className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all"
                  title="Remove vehicle"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}

            {showVForm ? (
              <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-5.5 shadow-inner">
                {vError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-bold text-rose-650 flex items-center gap-2">
                    ⚠️ {vError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  {[
                    { name: 'vehicleNumber', label: 'Plate/Number' },
                    { name: 'make', label: 'Make' },
                    { name: 'model', label: 'Model' },
                    { name: 'year', label: 'Year' },
                    { name: 'color', label: 'Color' },
                    { name: 'vin', label: 'VIN' },
                  ].map(({ name, label }) => (
                    <div key={name} className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                      <input 
                        type="text" 
                        name={name} 
                        value={vForm[name]} 
                        onChange={hvc}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-800 font-bold transition-all shadow-sm" 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Automobile Notes</label>
                  <input 
                    type="text" 
                    name="notes" 
                    value={vForm.notes} 
                    onChange={hvc}
                    placeholder="Enter outstanding details or modifications..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-800 font-bold transition-all shadow-sm" 
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={addVehicle}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-855 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-slate-900/10"
                  >
                    Confirm Vehicle
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowVForm(false); setVError('') }}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 bg-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setShowVForm(true)}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm bg-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Attach Vehicle Specification
              </button>
            )}
          </div>
        </Section>

        <div className="flex justify-end gap-3.5 pt-4">
          <Link 
            to="/staff/customers" 
            className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 bg-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-855 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-md shadow-slate-900/10 hover:shadow-slate-900/20"
          >
            {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {submitting ? 'Registering...' : 'Register Customer'}
          </button>
        </div>
      </form>
    </div>
  )
}