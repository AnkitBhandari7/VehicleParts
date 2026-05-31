import { useState, useEffect } from 'react'
import { getLoyaltySummary, checkDiscountEligibility } from '../../services/loyaltyAPI'
import { getRole, getCurrentCustomerId } from '../../services/auth'

export default function LoyaltyProgram() {
  const role       = getRole()        // 'Admin' | 'Staff' | 'Customer'
  const myId       = getCurrentCustomerId()
  const isCustomer = role === 'Customer'

  // For Admin/Staff: search field
  const [searchId,  setSearchId]  = useState('')
  // The ID we actually query (auto-set for customers, entered for admin/staff)
  const [queryId,   setQueryId]   = useState(isCustomer ? myId : '')

  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  // Discount checker
  const [subTotal,        setSubTotal]        = useState('')
  const [discountResult,  setDiscountResult]  = useState(null)
  const [checkingDiscount, setCheckingDiscount] = useState(false)

  // Auto-load for customers on mount
  useEffect(() => {
    if (isCustomer && myId) fetchSummary(myId)
  }, [])

  async function fetchSummary(id) {
    setError(''); setSummary(null); setDiscountResult(null); setLoading(true)
    try {
      const res = await getLoyaltySummary(id)
      setSummary(res.data)
      setQueryId(id)
    } catch (err) {
      setError(err.response?.data?.message || 'Customer not found.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchId) fetchSummary(searchId)
  }

  async function handleCheckDiscount(e) {
    e.preventDefault()
    setCheckingDiscount(true); setDiscountResult(null)
    try {
      const res = await checkDiscountEligibility(queryId, subTotal)
      setDiscountResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check discount.')
    } finally {
      setCheckingDiscount(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 bg-slate-50/50 min-h-screen pb-12 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Loyalty Program</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
          Verify points ledger and check purchase-order discount thresholds
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50/35 border border-indigo-100 rounded-2xl p-5 mb-6 flex gap-4 items-start shadow-sm">
        <div>
          <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            How the Loyalty Program Works
          </h3>
          <p className="text-indigo-900 text-xs font-medium leading-relaxed mt-1">
            Customers automatically receive a <strong className="font-extrabold">10% discount</strong> on any single
            purchase where the subtotal exceeds <strong className="font-extrabold">Rs. 5,000</strong>. The discount is
            applied automatically when creating a sale invoice.
          </p>
        </div>
      </div>

      {/* Admin/Staff: Search box */}
      {!isCustomer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Search Customer Loyalty Profile
          </h3>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                required
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
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

      {/* Customer: loading/error state */}
      {isCustomer && loading && (
        <div className="flex items-center gap-3 py-6 text-slate-500 font-semibold uppercase tracking-wider text-xs">
          <svg className="animate-spin h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading loyalty credentials…</span>
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

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {[
              { label: 'Customer',       value: summary.customerName, icon: '👤', bg: 'bg-blue-50 text-blue-650' },
              { label: 'Total Spent',    value: `Rs. ${summary.totalSpent?.toFixed(2)}`, icon: '💰', bg: 'bg-emerald-50 text-emerald-600' },
              { label: 'Loyalty Points', value: `${summary.loyaltyPoints} pts`, icon: '', bg: 'bg-purple-50 text-purple-650' },
              { label: 'Credit Status',  value: summary.creditStatus, icon: '⚡', bg: 'bg-amber-50 text-amber-650' },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200/85 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
                {card.icon && (
                  <div className={`p-3 rounded-xl ${card.bg} text-lg font-bold flex-shrink-0 shadow-sm border border-slate-100/50`}>
                    {card.icon}
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 truncate max-w-[160px]">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount Checker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Check Discount Eligibility
            </h3>
            <form onSubmit={handleCheckDiscount} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  required
                  type="number"
                  value={subTotal}
                  onChange={(e) => setSubTotal(e.target.value)}
                  placeholder="Enter subtotal amount..."
                  className="pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-slate-50/50 focus:bg-white transition-all text-slate-700 font-medium"
                />
                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs font-bold font-sans">Rs.</span>
              </div>
              <button
                type="submit"
                disabled={checkingDiscount}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {checkingDiscount ? 'Checking…' : 'Check Discount'}
              </button>
            </form>

            {discountResult && (
              <div className={`mt-5 p-5 rounded-2xl border animation-fade-in ${
                discountResult.isEligibleForDiscount
                  ? 'bg-emerald-50/20 border-emerald-150'
                  : 'bg-amber-50/20 border-amber-150'
              }`}>
                <p className={`font-bold text-xs flex gap-2 items-center uppercase tracking-wider ${
                  discountResult.isEligibleForDiscount ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  <span>{discountResult.isEligibleForDiscount ? '✅' : '⚠️'}</span>
                  <span>{discountResult.message}</span>
                </p>
                {discountResult.isEligibleForDiscount && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {[
                      { label: 'Subtotal Amount', value: `Rs. ${discountResult.subTotal?.toFixed(2)}`, bg: 'text-slate-900' },
                      { label: 'Discount Applied (10%)', value: `-Rs. ${discountResult.discountAmount?.toFixed(2)}`, bg: 'text-emerald-600 font-extrabold' },
                      { label: 'Final Net Amount', value: `Rs. ${discountResult.finalAmount?.toFixed(2)}`, bg: 'text-slate-900 font-black' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className={`text-sm ${stat.bg}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loyalty Transactions */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Loyalty Transaction History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4.5">Transaction ID</th>
                    <th className="px-6 py-4.5">Invoice ID</th>
                    <th className="px-6 py-4.5">Reason</th>
                    <th className="px-6 py-4.5">Points Earned</th>
                    <th className="px-6 py-4.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-medium italic">
                        No loyalty transactions found.
                      </td>
                    </tr>
                  ) : (
                    summary.transactions?.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/40 transition-colors duration-200">
                        <td className="px-6 py-4.5 font-extrabold text-slate-900">#{t.id}</td>
                        <td className="px-6 py-4.5 font-semibold text-slate-555">#{t.invoiceID}</td>
                        <td className="px-6 py-4.5 text-slate-500 font-medium">{t.reason}</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wide">
                            +{t.pointsEarned} pts
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 text-xs text-slate-400 font-semibold">
              Showing {summary.transactions?.length || 0} transactions
            </div>
          </div>
        </>
      )}
    </div>
  )
}