import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestPart, getPartRequests } from "../../services/f13Service";
import { getCurrentCustomerId } from "../../services/auth";

export default function PartRequestsPage() {
  const navigate = useNavigate();
  const customerId = getCurrentCustomerId();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    partName: "",
    quantity: "",
    notes: "",
  });

  // Guard: if no customerId, session is stale — force re-login
  useEffect(() => {
    if (!customerId) {
      localStorage.clear();
      navigate("/login");
    }
  }, []);

  const loadRequests = async () => {
    if (!customerId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getPartRequests(customerId);
      setRequests(res.data);
    } catch (err) {
      setError("Could not load part requests. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      await requestPart({
        customerId: customerId,
        partName: form.partName,
        quantity: Number(form.quantity),
        notes: form.notes,
      });
      setSuccessMsg("Part request submitted successfully.");
      setForm({ partName: "", quantity: "", notes: "" });
      loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit part request. Check your input and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 bg-slate-50/50 min-h-screen pb-12 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Part Requests</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
          Request unavailable components and tracking status of warehouse procurement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Request form */}
        <div className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm lg:col-span-1">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            Request a Part
          </h2>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 text-xs text-rose-700 font-bold flex gap-2 items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-rose-500">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs text-emerald-700 font-bold flex gap-2 items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-emerald-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Part Name
              </label>
              <input
                type="text"
                name="partName"
                value={form.partName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-700 font-medium"
                placeholder="e.g. Brake Pad Set..."
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-700 font-medium"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-700 font-medium resize-none"
                placeholder="Specify brand, variant compatibility details..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Request list */}
        <div className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            My Part Requests
          </h2>

          {loading ? (
            <div className="p-16 text-center text-slate-450 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <div className="w-4.5 h-4.5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
              Loading part requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium italic">
              No part requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-transparent text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80">
                    <th className="px-6 py-4.5">ID</th>
                    <th className="px-6 py-4.5">Part Name</th>
                    <th className="px-6 py-4.5">Quantity</th>
                    <th className="px-6 py-4.5">Notes</th>
                    <th className="px-6 py-4.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r.partRequestID} className="hover:bg-slate-50/40 transition-colors duration-200">
                      <td className="px-6 py-4.5 font-extrabold text-slate-900">#{r.partRequestID}</td>
                      <td className="px-6 py-4.5 font-extrabold text-slate-800">{r.partName}</td>
                      <td className="px-6 py-4.5 text-slate-550 font-semibold">{r.quantity}</td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium max-w-[180px] truncate">{r.notes || "—"}</td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider
                          ${r.status === 'Approved' || r.status === 'Procured'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                            : r.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-150'
                            : 'bg-rose-50 text-rose-700 border-rose-150'
                          }
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'Approved' || r.status === 'Procured' ? 'bg-emerald-500' :
                            r.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}