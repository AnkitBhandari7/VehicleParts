import { useState, useEffect } from 'react'
import { getFinancialSummary } from '../../services/financialAPI'

export default function FinancialReport() {
  const [reportType, setReportType] = useState('monthly') // 'daily', 'monthly', 'yearly', 'custom'
  
  // Date configuration states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  
  // Report data states
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Auto-load current month report on boot
  useEffect(() => {
    generateReport()
  }, [])

  // Calculate dates and request report
  async function generateReport() {
    setLoading(true)
    setError('')
    
    let from = ''
    let to = ''

    try {
      if (reportType === 'daily') {
        from = `${selectedDate}T00:00:00`
        to = `${selectedDate}T23:59:59`
      } 
      else if (reportType === 'monthly') {
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
        const mm = String(selectedMonth).padStart(2, '0')
        from = `${selectedYear}-${mm}-01T00:00:00`
        to = `${selectedYear}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59`
      } 
      else if (reportType === 'yearly') {
        from = `${selectedYear}-01-01T00:00:00`
        to = `${selectedYear}-12-31T23:59:59`
      } 
      else if (reportType === 'custom') {
        if (!startDate || !endDate) {
          setError('Please provide both start and end bounds.')
          setLoading(false)
          return
        }
        from = `${startDate}T00:00:00`
        to = `${endDate}T23:59:59`
      }

      // Fetch the single complete dataset
      const res = await getFinancialSummary(from, to)
      setReportData(res.data)
    } catch (err) {
      setError('Failed to generate statement. Verify that the server is online.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Trigger print view
  const handlePrint = () => {
    window.print()
  }

  // Formatter helpers
  const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (dStr) => dStr ? new Date(dStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen print:bg-white print:p-0">
      
      {/* Printable Overrides (CSS stylesheet) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Reports</h1>
        </div>
        
        <button 
          onClick={handlePrint}
          disabled={!reportData}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Statement
        </button>
      </div>

      {/* Filter and Generator Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 mb-8 no-print">
        <h3 className="font-extrabold text-slate-800 text-sm mb-4">Report Generator Criteria</h3>
        
        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          
          {/* Report scope type */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Report Scope</label>
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'yearly', label: 'Yearly' },
                { id: 'custom', label: 'Custom' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReportType(tab.id)}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reportType === tab.id 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope details inputs */}
          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Daily Picker */}
            {reportType === 'daily' && (
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            )}

            {/* Monthly Selectors */}
            {reportType === 'monthly' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[
                      { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' },
                      { v: 4, n: 'April' }, { v: 5, n: 'May' }, { v: 6, n: 'June' },
                      { v: 7, n: 'July' }, { v: 8, n: 'August' }, { v: 9, n: 'September' },
                      { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' }
                    ].map(m => (
                      <option key={m.v} value={m.v}>{m.n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Year</label>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Yearly Selector */}
            {reportType === 'yearly' && (
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Calendar Pickers */}
            {reportType === 'custom' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none bg-slate-50/50"
                  />
                </div>
              </>
            )}

          </div>

          {/* Trigger button */}
          <div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-6 py-2.5 font-bold text-xs transition-colors shadow-md shadow-blue-500/10"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </span>
              ) : 'Generate Financial Report'}
            </button>
          </div>

        </div>

      </div>

      {/* Main Statement Presentation Container */}
      {reportData && (
        <div className="print-section space-y-8">
          
          {/* Statement Header info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                reportType === 'daily' ? 'bg-blue-50 text-blue-700' :
                reportType === 'monthly' ? 'bg-purple-50 text-purple-700' :
                reportType === 'yearly' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {reportType} financial statement
              </span>
              <h2 className="text-xl font-black text-slate-800 mt-2.5">
                Financial Report Overview
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Statement Date Range: <span className="text-slate-600 font-bold">{formatDate(reportData.fromDate)}</span> to <span className="text-slate-600 font-bold">{formatDate(reportData.toDate)}</span>
              </p>
            </div>
            
            <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Volume</p>
              <p className="text-3xl font-black text-emerald-600 mt-0.5">{money(reportData.summary?.totalRevenue)}</p>
            </div>
          </div>

          {/* Key Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* TOTAL REVENUE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{money(reportData.summary?.totalRevenue)}</p>
              <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Collection conversion rate: 85%</p>
            </div>

            {/* INVOICE VOLUME BREAKDOWN */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billing Statements</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{reportData.summary?.totalInvoices} Invoices</p>
              
              <div className="flex items-center gap-1 mt-3">
                <div className="h-2 flex-1 bg-emerald-500 rounded-l-full" title="Paid" style={{ width: `${(reportData.summary?.paidInvoices / (reportData.summary?.totalInvoices || 1)) * 100}%` }} />
                <div className="h-2 flex-1 bg-amber-500 rounded-r-full" title="Unpaid" style={{ width: `${(reportData.summary?.unpaidInvoices / (reportData.summary?.totalInvoices || 1)) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold mt-1.5">
                <span className="text-emerald-600">{reportData.summary?.paidInvoices} Paid</span>
                <span className="text-amber-500">{reportData.summary?.unpaidInvoices} Unpaid</span>
              </div>
            </div>

            {/* AVG TICKET VALUE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Ticket Size</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{money(reportData.summary?.averageInvoiceValue)}</p>
              <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[65%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Ticket target: Rs. 100k</p>
            </div>

            {/* DISTINCT BUYERS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distinct Buyer Accounts</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{reportData.summary?.totalCustomers} Customers</p>
              <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[75%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Client retention: 75%</p>
            </div>

          </div>

          {/* Breakdown Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Revenue breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-sm">Revenue Flow Breakdown</h3>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Financial Interval</th>
                      <th className="px-6 py-4">Total Revenue</th>
                      <th className="px-6 py-4">Invoice Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.monthlyRevenue?.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-slate-400 font-medium italic">
                          No revenue activity recorded in this date range.
                        </td>
                      </tr>
                    ) : (
                      reportData.monthlyRevenue?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {row.monthName} {row.year}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-emerald-600">
                            {money(row.revenue)}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-bold">
                            {row.invoiceCount} invoices
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top performing parts */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-sm">Top Selling Products</h3>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Component Item</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Volume</th>
                      <th className="px-6 py-4">Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.topParts?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400 font-medium italic">
                          No product sales recorded in this date range.
                        </td>
                      </tr>
                    ) : (
                      reportData.topParts?.map((part, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-extrabold text-slate-800">
                            {part.partName}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200/30">
                              {part.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-bold">
                            {part.totalQuantitySold} units
                          </td>
                          <td className="px-6 py-4 font-extrabold text-emerald-600">
                            {money(part.totalRevenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
