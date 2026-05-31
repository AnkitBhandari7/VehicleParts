import { useState, useEffect } from "react";
import {
  getLowStockParts,
  notifyAdminLowStock,
  getOverdueCredits,
  sendCreditReminders,
} from "../../services/notificationService";

const ADMIN_USER_ID = 1;

export default function NotificationsPage() {
  const [lowStock, setLowStock] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notifyingStock, setNotifyingStock] = useState(false);
  const [notifyingCredit, setNotifyingCredit] = useState(false);
  const [stockMsg, setStockMsg] = useState("");
  const [creditMsg, setCreditMsg] = useState("");

  const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Never");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [stockRes, creditRes] = await Promise.all([
        getLowStockParts(),
        getOverdueCredits(),
      ]);
      setLowStock(stockRes.data);
      setOverdue(creditRes.data);
    } catch (err) {
      setError("Could not load notifications. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleNotifyStock = async () => {
    setStockMsg("");
    setNotifyingStock(true);
    try {
      await notifyAdminLowStock(ADMIN_USER_ID);
      setStockMsg("Low stock email alerts triggered and dispatched successfully.");
    } catch (err) {
      setStockMsg("Failed to dispatch low stock email alerts.");
    } finally {
      setNotifyingStock(false);
    }
  };

  const handleSendReminders = async () => {
    setCreditMsg("");
    setNotifyingCredit(true);
    try {
      await sendCreditReminders();
      setCreditMsg("Payment reminders sent to overdue customers successfully.");
    } catch (err) {
      setCreditMsg("Failed to send payment reminders.");
    } finally {
      setNotifyingCredit(false);
    }
  };

  // Computations for KPI cards
  const totalOutstandingDebt = overdue.reduce((sum, c) => sum + (c.creditBalance ?? 0), 0);
  const systemStanding = (lowStock.length > 0 || overdue.length > 0) ? "ACTION REQUIRED" : "GOOD";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      
      {/* Top Header Block */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Notifications</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Low stock Alert Full-Width Block */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Low Stock Parts Alert</h3>
          </div>
        </div>

        {stockMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-150 text-green-800 text-xs font-semibold rounded-lg">
            ✓ {stockMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading stock reports...</div>
          ) : lowStock.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">All components are fully stocked.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Part ID / Number</th>
                  <th className="px-6 py-4">Component Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4">Preferred Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map(p => (
                  <tr key={p.partID} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{p.partNumber}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200/30">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-bold">{p.lowStockThreshold} units</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.vendorName || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Overdue Credit Customers Full-Width Block */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Overdue Credit Customers</h3>
          </div>
        </div>

        {creditMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-150 text-green-800 text-xs font-semibold rounded-lg">
            ✓ {creditMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading ledger balances...</div>
          ) : overdue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold italic bg-white/50">
              All client accounts are currently in good credit standing.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Contact Phone</th>
                  <th className="px-6 py-4">Outstanding Balance</th>
                  <th className="px-6 py-4">Credit standing</th>
                  <th className="px-6 py-4">Last Notification Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdue.map(c => (
                  <tr key={c.customerID} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">#{c.customerID}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{c.firstName} {c.lastName}</td>
                    <td className="px-6 py-4 text-slate-500 font-bold">{c.phone}</td>
                    <td className="px-6 py-4 font-black text-rose-600">{money(c.creditBalance)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {c.creditStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-bold">{fmtDate(c.lastCreditReminderSent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}