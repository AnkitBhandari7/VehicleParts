import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitReview, getReviews } from "../../services/f13Service";
import { getCurrentCustomerId } from "../../services/auth";

export default function ReviewsPage() {
  const navigate = useNavigate();
  const customerId = getCurrentCustomerId();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    appointmentId: "",
    rating: "5",
    comment: "",
  });

  // Guard: if no customerId, session is stale — force re-login
  useEffect(() => {
    if (!customerId) {
      localStorage.clear();
      navigate("/login");
    }
  }, [customerId, navigate]);

  const loadReviews = async () => {
    if (!customerId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getReviews(customerId);
      setReviews(res.data || []);
    } catch (err) {
      setError("Could not load reviews. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadReviews();
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
      await submitReview({
        customerId: customerId,
        appointmentId: Number(form.appointmentId),
        rating: Number(form.rating),
        comment: form.comment,
      });
      setSuccessMsg("Review submitted successfully.");
      setForm({ appointmentId: "", rating: "5", comment: "" });
      loadReviews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit review. Check your input and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render star characters safely for a given rating. Bulletproof against NaN or null.
  const renderStars = (rating) => {
    const num = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    const full = "★".repeat(num);
    const empty = "☆".repeat(5 - num);
    return (
      <span className="flex gap-0.5 text-base">
        <span className="text-amber-400 font-sans">{full}</span>
        <span className="text-slate-200 font-sans">{empty}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 bg-slate-50/50 min-h-screen pb-12 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Reviews</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
          Share your feedback on recent service visits and browse your submitted testimonials
        </p>
      </div>

      {/* Two Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Submit a Review Card */}
        <div className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            Submit a Service Review
          </h3>

          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-xs text-rose-700 font-bold flex gap-2.5 items-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-rose-500">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-xs text-emerald-700 font-bold flex gap-2.5 items-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-emerald-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Appointment ID
              </label>
              <input
                type="number"
                name="appointmentId"
                value={form.appointmentId}
                onChange={handleChange}
                required
                placeholder="e.g. 1024"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Rating Assessment
              </label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-semibold cursor-pointer"
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                <option value="3">⭐⭐⭐ Average (3/5)</option>
                <option value="2">⭐⭐ Poor (2/5)</option>
                <option value="1">⭐ Very Poor (1/5)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Feedback Comment
              </label>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium resize-none"
                placeholder="Share your service experience, mechanic assistance quality, or spare part recommendations..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "Submitting review..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Right Column: My Reviews List */}
        <div className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
            My Testimonials History
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <svg className="animate-spin h-5 w-5 text-slate-900 mr-2.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading my testimonials...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">No reviews submitted yet</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Your submitted service reviews will list here for tracking.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev.serviceReviewID}
                  className="bg-slate-50/30 border border-slate-150 rounded-2xl p-4.5 relative shadow-sm hover:border-indigo-400 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {renderStars(rev.rating)}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                      Appointment ID: #{rev.appointmentID}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                  
                  {rev.createdAt && (
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-3 text-right">
                      Reviewed on: {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}