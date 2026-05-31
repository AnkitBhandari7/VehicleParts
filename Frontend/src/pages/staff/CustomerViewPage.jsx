import { useState } from "react";
import api from "../../services/api";
import {
  getCustomerDetails,
  getCustomerVehicles,
  getCustomerPurchaseHistory,
} from "../../services/customerViewService";
import { getAppointments } from "../../services/f13Service";
import { searchCustomers } from "../../services/customerService";

export default function CustomerViewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Format a number as currency.
  const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Format a date string for display.
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-");

  const loadCustomerData = async (id) => {
    setLoading(true);
    setCustomer(null);
    setVehicles([]);
    setHistory([]);
    setAppointments([]);
    setSearchResults([]);

    try {
      // Fetch profile first — if the customer doesn't exist, this 404s.
      const detailRes = await getCustomerDetails(id);
      setCustomer(detailRes.data);

      // Then fetch vehicles, history, and appointments in parallel.
      const [vehRes, histRes, apptRes] = await Promise.all([
        getCustomerVehicles(id),
        getCustomerPurchaseHistory(id),
        getAppointments(id).catch(() => ({ data: [] })), // Graceful degradation if backend endpoint missing
      ]);
      setVehicles(vehRes.data);
      setHistory(histRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No customer found with ID ${id}.`);
      } else {
        setError("Could not load customer details. Ensure the backend is active.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSearchResults([]);

    const q = searchQuery.trim();
    if (!q) {
      setError("Please enter a name, email, ID, or vehicle plate.");
      return;
    }

    // 1. Try as a direct ID first if it's numeric
    const id = Number(q);
    if (!isNaN(id) && id > 0) {
      await loadCustomerData(id);
      return;
    }

    // 2. Otherwise, search by name/email/etc.
    setLoading(true);
    try {
      // Fetch all customers and also search specifically by vehicle plate
      const [allRes, vehicleResults] = await Promise.all([
        api.get('/api/customer'),
        searchCustomers(q, 3).catch(() => []) // type 3 = vehicle plate
      ]);

      const all = allRes.data;
      const lowerQ = q.toLowerCase();
      
      // IDs of customers matching by vehicle search
      const vehicleCustomerIds = (vehicleResults || []).map(c => c.customerID || c.id);
      
      const filtered = all.filter(c => 
        c.firstName?.toLowerCase().includes(lowerQ) || 
        c.lastName?.toLowerCase().includes(lowerQ) || 
        c.email?.toLowerCase().includes(lowerQ) || 
        c.phone?.includes(q) ||
        String(c.customerID).includes(q) ||
        vehicleCustomerIds.includes(c.customerID)
      );

      if (filtered.length === 0) {
        setError(`No customers found matching "${q}".`);
      } else if (filtered.length === 1) {
        await loadCustomerData(filtered[0].customerID);
      } else {
        setSearchResults(filtered);
      }
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer History</h1>
        </div>
      </div>

      {/* Modern Search card bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow duration-300">
        <form onSubmit={handleSearch} className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter name, ID, email, or vehicle..."
              className="w-full sm:w-80 border border-slate-200 rounded-xl pl-4 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-800 font-bold transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Multiple matches found. Please select one:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map(c => (
                <button
                  key={c.customerID}
                  onClick={() => loadCustomerData(c.customerID)}
                  className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    {c.firstName?.[0]}{c.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.email || c.phone || `ID: #${c.customerID}`}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 flex-1 max-w-md animate-shake">
            ⚠️ {error}
          </div>
        )}
      </div>

      {customer && (
        <>
          {/* KPI Dashboard Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: 'TOTAL REVENUE',
                value: money(customer.totalSpent),
                color: 'text-emerald-600',
                bg: 'bg-emerald-50/30 border-emerald-100/50',
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                label: 'LOYALTY POINTS',
                value: `${customer.loyaltyPoints} PTS`,
                color: 'text-blue-600',
                bg: 'bg-blue-50/30 border-blue-100/50',
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )
              },
              {
                label: 'CREDIT BALANCE',
                value: money(customer.creditBalance),
                color: customer.creditBalance > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-800',
                bg: customer.creditBalance > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200/40',
                icon: (
                  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )
              },
              {
                label: 'ACTIVE VEHICLES',
                value: `${vehicles.length} VEHICLE(S)`,
                color: 'text-slate-900',
                bg: 'bg-slate-50 border-slate-200/40',
                icon: (
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16V10a2 2 0 00-2-2h-4v8" />
                  </svg>
                )
              }
            ].map((card, idx) => (
              <div key={idx} className={`bg-white border rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-350 ${card.bg}`}>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">{card.label}</p>
                  <p className={`text-xl font-black tracking-tight ${card.color}`}>{card.value}</p>
                </div>
                <div className="p-3 bg-white border border-slate-150 rounded-xl shadow-sm">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (spans 1) - Profile & Vehicles */}
            <div className="space-y-8">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6.5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between pb-4.5 border-b border-slate-100 mb-4.5">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Customer profile</h3>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-sm">
                    ID #{customer.customerID}
                  </span>
                </div>
                <div className="space-y-4">
                  <DetailRow label="Full Name" value={`${customer.firstName} ${customer.lastName}`} />
                  <DetailRow label="Phone Number" value={customer.phone} />
                  <DetailRow label="Email Address" value={customer.user?.email || "N/A"} />
                  <DetailRow label="Street Address" value={customer.address} />
                  <DetailRow label="Date of Birth" value={fmtDate(customer.dateOfBirth)} />
                  <DetailRow label="Joined Since" value={fmtDate(customer.registeredAt)} />
                  <DetailRow label="Total Visits" value={`${customer.totalVisits} visit(s)`} />
                  <DetailRow 
                    label="Credit Standing" 
                    value={
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
                        customer.creditStatus === 'Good' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-rose-50 text-rose-700 border-rose-150'
                      }`}>
                        {customer.creditStatus}
                      </span>
                    } 
                  />
                </div>
              </div>

              {/* Vehicles Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6.5 hover:shadow-md transition-all duration-300">
                <div className="pb-4.5 border-b border-slate-100 mb-4.5 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Registered Vehicles</h3>
                  <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{vehicles.length}</span>
                </div>
                {vehicles.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-250">No vehicle specifications registered under this account.</p>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((v) => (
                      <div key={v.vehicleID} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:shadow-sm transition-all duration-250">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-extrabold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                            {v.vehicleNumber}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{v.year}</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{v.make} {v.model}</p>
                        {v.vin && <p className="text-[9px] text-slate-400 font-mono mt-1.5 uppercase">VIN: {v.vin}</p>}
                        {v.color && <p className="text-[10px] text-slate-450 font-bold mt-1 uppercase">Color: {v.color}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (spans 2) - Service & Billing History */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Service History Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6.5 hover:shadow-md transition-all duration-300">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span>Service Appointments</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-550 border border-slate-200">
                    {appointments.length} Records
                  </span>
                </h3>
                {appointments.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold bg-slate-50 p-6 rounded-xl text-center border border-dashed border-slate-250">No appointment schedules are active or on file.</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                          <th className="px-5 py-3">Schedule Date</th>
                          <th className="px-5 py-3">Time Slot</th>
                          <th className="px-5 py-3">Vehicle Spec</th>
                          <th className="px-5 py-3">Service Details</th>
                          <th className="px-5 py-3">Status Tag</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-slate-800">
                        {appointments.map((a) => (
                          <tr key={a.appointmentID} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-bold text-slate-900">
                              {fmtDate(a.appointmentDate)}
                            </td>
                            <td className="px-5 py-3 text-slate-600 font-extrabold">{a.timeSlot}</td>
                            <td className="px-5 py-3 text-slate-700 font-extrabold uppercase">
                              {a.vehicleMake} {a.vehicleModel}
                            </td>
                            <td className="px-5 py-3 text-slate-600 max-w-xs truncate" title={a.serviceDescription}>
                              {a.serviceDescription}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider
                                ${a.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-150' : ''}
                                ${a.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : ''}
                                ${a.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : ''}
                                ${a.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-150' : ''}
                              `}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Purchase History Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6.5 hover:shadow-md transition-all duration-300">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span>Sales Ledger Invoices</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-550 border border-slate-200">
                    {history.length} Receipts
                  </span>
                </h3>
                {history.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold bg-slate-50 p-6 rounded-xl text-center border border-dashed border-slate-250">No transaction records on file for this customer.</p>
                ) : (
                  <div className="space-y-5">
                    {history.map((inv) => (
                      <div
                        key={inv.invoiceID}
                        className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 hover:bg-slate-50 transition-all hover:shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between mb-4.5 gap-2 pb-3 border-b border-slate-100">
                          <span className="font-black text-slate-800 text-xs uppercase tracking-wide">
                            Receipt ID: #INV-{String(inv.invoiceID).padStart(4,'0')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-450 bg-white px-3 py-1 rounded-full border border-slate-200 uppercase">
                            📅 {fmtDate(inv.createdAt)}
                          </span>
                        </div>

                        {/* Items Sub-table */}
                        {inv.items && inv.items.length > 0 && (
                          <div className="overflow-x-auto mb-4 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                            <table className="min-w-full text-left text-[11px] divide-y divide-slate-100">
                              <thead className="bg-slate-50">
                                <tr className="text-left font-bold text-slate-400 uppercase tracking-wider">
                                  <th className="px-3.5 py-2.5">Allocated Component</th>
                                  <th className="px-3.5 py-2.5 text-center">Quantity</th>
                                  <th className="px-3.5 py-2.5 text-right">SKU Unit Price</th>
                                  <th className="px-3.5 py-2.5 text-right">Sum total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-medium">
                                {inv.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="px-3.5 py-2.5 font-bold text-slate-850 uppercase">{item.partName}</td>
                                    <td className="px-3.5 py-2.5 text-center font-extrabold text-slate-900">{item.quantity}</td>
                                    <td className="px-3.5 py-2.5 text-right font-semibold">{money(item.unitPrice)}</td>
                                    <td className="px-3.5 py-2.5 text-right font-black text-slate-900">{money(item.lineTotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Totals & Status Tags */}
                        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2.5 text-[10px] text-slate-450 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-sm uppercase font-bold">
                          <span>Gross Subtotal: <strong className="text-slate-700">{money(inv.subTotal)}</strong></span>
                          <span className="text-rose-600">Discounts: <strong>{money(inv.discountAmount)}</strong></span>
                          <span className="text-xs font-black text-slate-900 normal-case">
                            Billed Amount: <strong className="text-indigo-650 text-sm font-black tracking-tight">{money(inv.totalAmount)}</strong>
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black border tracking-wider ${
                              inv.isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                                : "bg-rose-50 text-rose-700 border-rose-150"
                            }`}
                          >
                            {inv.isPaid ? "PAID" : "UNPAID"}
                          </span>
                          {inv.isCreditSale && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-150 tracking-wider">
                              CREDIT
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

// Side Profile Detail Row component
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0 text-xs">
      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{label}</span>
      <span className="text-slate-900 font-extrabold">{value ?? "-"}</span>
    </div>
  );
}