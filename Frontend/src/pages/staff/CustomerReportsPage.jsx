import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getRegularCustomers,
  getHighSpenders,
  getPendingCredits,
} from "../../services/customerReportService";

const TABS = [
  { key: "regulars", label: "Regular Clients" },
  { key: "spenders", label: "High Spenders" },
  { key: "credits", label: "Pending Credits" },
];

export default function CustomerReportsPage() {
  const [activeTab, setActiveTab] = useState("regulars");
  const [topCount, setTopCount] = useState(10);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Load the report for the active tab.
  const loadReport = async () => {
    setLoading(true);
    setError("");
    setRows([]);
    try {
      let res;
      if (activeTab === "regulars") {
        res = await getRegularCustomers(topCount);
      } else if (activeTab === "spenders") {
        res = await getHighSpenders(topCount);
      } else {
        res = await getPendingCredits();
      }
      setRows(res.data);
    } catch (err) {
      setError("Could not load report. Ensure the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever the tab or topCount changes.
  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, topCount]);

  // Aggregate stats for dashboard cards based on row data
  const totalReportClients = rows.length;
  const highestValueRow = rows[0];
  const aggregateRevenue = rows.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
  const aggregateVisits = rows.reduce((acc, curr) => acc + (curr.totalVisits || 0), 0);
  const totalCreditDebt = rows.reduce((acc, curr) => acc + (curr.creditBalance || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Analytics</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
            Review detailed reports on regulars, high spenders, and pending credit balances
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 border border-slate-200 rounded-2xl shadow-sm w-fit gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-450 hover:text-slate-700 bg-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards Dashboard above Report */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/50 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Rows Count</p>
            <p className="text-xl font-black text-slate-900 mt-1">{loading ? "..." : `${totalReportClients} Customer(s)`}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-650 border border-emerald-100/50 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Representative</p>
            <p className="text-xl font-black text-slate-900 mt-1 truncate max-w-[190px]">
              {loading ? "..." : highestValueRow ? `${highestValueRow.firstName} ${highestValueRow.lastName}` : "None"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-650 border border-blue-100/50 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Volume Tally</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {loading ? "..." : 
                activeTab === 'regulars' ? `${aggregateVisits} Visit(s)` : 
                activeTab === 'spenders' ? money(aggregateRevenue) : 
                money(totalCreditDebt)
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 text-xs text-rose-700 font-bold flex gap-3 items-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-rose-550">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Report table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Unified Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-100 gap-3">
          <h3 className="font-extrabold text-slate-800 text-base">
            {activeTab === 'regulars' ? 'Regular Clients Log' : activeTab === 'spenders' ? 'Spenders Board' : 'Unpaid Credit Accounts'}
          </h3>
          
          {activeTab !== "credits" && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 shadow-sm">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Show Max</label>
              <select
                value={topCount}
                onChange={(e) => setTopCount(Number(e.target.value))}
                className="border-none rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-none focus:ring-0 bg-transparent text-slate-800 cursor-pointer"
              >
                <option value={5}>5 Records</option>
                <option value={10}>10 Records</option>
                <option value={25}>25 Records</option>
                <option value={50}>50 Records</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-450 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <div className="w-4.5 h-4.5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            Compiling Reports...
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center bg-white">
            <svg className="mx-auto h-12 w-12 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-3.5 text-xs font-black text-slate-900 uppercase tracking-wider">No analytical records on file</h3>
            <p className="mt-1 text-xs text-slate-400 font-semibold leading-relaxed">
              We couldn't retrieve any records for this reporting filter category.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-8 py-5 w-[10%] text-center">Rank</th>
                <th className="px-6 py-5 w-[30%]">Customer Profile</th>
                <th className="px-6 py-5 w-[20%]">Primary Contact</th>
                {activeTab === "regulars" && (
                  <th className="px-6 py-5 w-[25%]">Visit Frequency</th>
                )}
                {activeTab === "spenders" && (
                  <th className="px-6 py-5 w-[25%]">Revenue Contribution</th>
                )}
                {activeTab === "credits" && (
                  <th className="px-6 py-5 w-[25%]">Credit Portfolio</th>
                )}
                <th className="px-8 py-5 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c, idx) => {
                const name = `${c.firstName} ${c.lastName}`.trim()
                const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
                
                // Color logic for top 3 ranks
                const rankStyles = [
                  'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-100/50', // #1 Gold
                  'bg-slate-100 text-slate-600 border-slate-200 shadow-slate-100/50',  // #2 Silver
                  'bg-orange-100 text-orange-700 border-orange-200 shadow-orange-100/50' // #3 Bronze
                ][idx] || 'bg-slate-50 text-slate-400 border-slate-100'

                return (
                  <tr
                    key={c.customerID}
                    className="group hover:bg-blue-50/30 transition-all duration-300"
                  >
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-[11px] font-black border transition-transform group-hover:scale-110 ${rankStyles}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/60 flex items-center justify-center text-slate-700 text-xs font-black shadow-sm flex-shrink-0 group-hover:border-blue-200 transition-colors">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          {name ? (
                            <>
                              <p className="font-black text-slate-900 text-sm tracking-tight truncate group-hover:text-blue-700 transition-colors">{name}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wide">ID: #CUST-{String(c.customerID).padStart(4, '0')}</p>
                            </>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-black tracking-wide uppercase">ID: #CUST-{String(c.customerID).padStart(4, '0')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-700 text-xs">{c.phone || "—"}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate">{c.email || "No email on file"}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-6">
                      {activeTab === "regulars" && (
                        <span className="inline-flex items-center px-4 py-2 border border-blue-100 rounded-2xl text-[10px] font-black text-blue-700 bg-blue-50/40 uppercase tracking-widest shadow-sm">
                          {c.totalVisits} visit(s) logged
                        </span>
                      )}
                      {activeTab === "spenders" && (
                        <span className="inline-flex items-center px-4 py-2 border border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-700 bg-emerald-50/40 uppercase tracking-widest shadow-sm">
                          {money(c.totalSpent)} total
                        </span>
                      )}
                      {activeTab === "credits" && (
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex items-center px-4 py-2 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-700 bg-rose-50/40 uppercase tracking-widest shadow-sm w-fit">
                            {money(c.creditBalance)} due
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-wider w-fit
                            ${c.creditStatus === 'Suspended' ? 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-200' :
                              c.creditStatus === 'Overdue' ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-200' :
                              'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                            }
                          `}>
                            {c.creditStatus}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <Link 
                        to={`/staff/customers/${c.customerID}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-wider hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
                      >
                        Profile
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}