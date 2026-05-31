import { useState, useEffect } from 'react'
import { getFullHistory } from '../../services/historyAPI'
import { getRole, getCurrentCustomerId } from '../../services/auth'

export default function PurchaseHistory() {
  const role = getRole() // 'Admin' | 'Staff' | 'Customer'
  const myId = getCurrentCustomerId()
  const isCustomer = role === 'Customer'

  const [customerId, setCustomerId] = useState(isCustomer ? myId : '')
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('purchases')

  async function fetchHistory(id) {
    setError('')
    setHistory(null)
    setLoading(true)
    try {
      const res = await getFullHistory(id)
      setHistory(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Customer history details could not be found.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-load for customers on mount
  useEffect(() => {
    if (isCustomer && myId) {
      fetchHistory(myId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (customerId) fetchHistory(customerId)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 bg-slate-50/50 min-h-screen pb-12 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Purchase & Service History</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
          Track transaction invoices, loyalty points applied, and detailed mechanics service logs
        </p>
      </div>

      {/* Admin/Staff Search Panel */}
      {!isCustomer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Search Customer History Profile
          </h3>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                required
                type="number"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter Customer ID..."
                className="pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-slate-50/50 focus:bg-white transition-all text-slate-700 font-medium"
              />
              <svg className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? 'Searching…' : 'Search Profile'}
            </button>
          </form>
          {error && (
            <div className="mt-3.5 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 text-xs text-rose-700 font-bold flex gap-2 items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-rose-500">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Customer role loading/error state */}
      {isCustomer && loading && (
        <div className="flex items-center gap-3 py-6 text-slate-500 font-semibold uppercase tracking-wider text-xs">
          <svg className="animate-spin h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Retrieving your transaction history...</span>
        </div>
      )}
      {isCustomer && error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3.5 text-xs text-rose-700 font-bold flex gap-2.5 items-center shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results panel */}
      {history && (
        <>
          {/* Customer Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Customer Name', value: history.customerName, icon: '👤', bg: 'bg-blue-50 text-blue-650' },
              { label: 'Total Revenue', value: `Rs. ${history.totalSpent?.toFixed(2)}`, icon: '💰', bg: 'bg-emerald-50 text-emerald-600' },
              { label: 'Total Visits',  value: `${history.totalVisits} visit(s)`, icon: '⚡', bg: 'bg-purple-50 text-purple-650' },
              { label: 'Purchases Info',value: `${history.purchaseHistory?.length} record(s)`, icon: '📦', bg: 'bg-amber-50 text-amber-650' },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200/85 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
                <div className={`p-3 rounded-xl ${card.bg} text-lg font-bold flex-shrink-0 shadow-sm border border-slate-100/50`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 truncate max-w-[160px]">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="flex bg-white p-1 border border-slate-200 rounded-2xl shadow-sm w-fit gap-1">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-4.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'purchases'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-450 hover:text-slate-700 bg-transparent'
              }`}
            >
              Purchase History ({history.purchaseHistory?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'services'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-450 hover:text-slate-700 bg-transparent'
              }`}
            >
              Service History ({history.serviceHistory?.length || 0})
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Purchase History Tab */}
            {activeTab === 'purchases' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Sales Representative</th>
                      <th className="px-6 py-4">Subtotal</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.purchaseHistory?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-medium italic">
                          No purchase history found.
                        </td>
                      </tr>
                    ) : (
                      history.purchaseHistory?.map((invoice) => (
                        <tr
                          key={invoice.invoiceID}
                          className="hover:bg-slate-50/40 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 font-extrabold text-slate-900">
                            #{invoice.invoiceID}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-550">{invoice.type}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-semibold">{invoice.staffName}</td>
                          <td className="px-6 py-4 text-slate-500 font-bold">
                            Rs. {invoice.subTotal?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            {invoice.loyaltyDiscountApplied ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wide">
                                -Rs. {invoice.discountAmount?.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-450 font-medium">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-slate-900">
                            Rs. {invoice.totalAmount?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider
                              ${invoice.isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                : 'bg-amber-50 text-amber-700 border-amber-150'
                              }
                            `}>
                              <span className={`w-1.5 h-1.5 rounded-full ${invoice.isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {invoice.isPaid ? 'Paid' : 'Credit'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Service History Tab */}
            {activeTab === 'services' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Appointment ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Service Description</th>
                      <th className="px-6 py-4">Vehicle Details</th>
                      <th className="px-6 py-4">Staff Assignment</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.serviceHistory?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 font-medium italic">
                          No service history found.
                        </td>
                      </tr>
                    ) : (
                      history.serviceHistory?.map((appt) => (
                        <tr
                          key={appt.appointmentID}
                          className="hover:bg-slate-50/40 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 font-extrabold text-slate-900">
                            #{appt.appointmentID}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-slate-550 font-semibold">{appt.timeSlot}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{appt.serviceDescription}</td>
                          <td className="px-6 py-4 text-slate-500">
                            <span className="font-extrabold text-slate-800 text-[11px] block">{appt.vehicleMake} {appt.vehicleModel}</span>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                              {appt.vehicleNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-semibold">{appt.staffName}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider
                              ${(appt.status === 'Completed' || appt.status === 'Confirmed')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                : appt.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-150'
                                : 'bg-rose-50 text-rose-700 border-rose-150'
                              }
                            `}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                (appt.status === 'Completed' || appt.status === 'Confirmed') ? 'bg-emerald-500' :
                                appt.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 text-xs text-slate-400 font-semibold">
              {activeTab === 'purchases'
                ? `Showing ${history.purchaseHistory?.length || 0} purchases`
                : `Showing ${history.serviceHistory?.length || 0} services`}
            </div>
          </div>
        </>
      )}
    </div>
  )
}