import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const email = localStorage.getItem('tempStaffEmail') || ''

  async function handlePasswordChange(e) {
    e.preventDefault()
    setError('')
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      // 1. Fetch all staff to find the matching staff record
      const staffRes = await api.get('/api/admin/staff')
      const matchingStaff = staffRes.data.find(
        (s) => s.email.toLowerCase() === email.toLowerCase()
      )

      if (!matchingStaff) {
        setError('Staff member record not found.')
        setLoading(false)
        return
      }

      // 2. Call updateStaff endpoint to change the password
      await api.put(`/api/admin/staff/${matchingStaff.staffID}`, {
        ...matchingStaff,
        password: newPassword,
      })

      // 3. Clear pending flag and temp email
      localStorage.removeItem(`pendingPasswordChange_${email.toLowerCase()}`)
      localStorage.removeItem('tempStaffEmail')
      setSuccess(true)

      setTimeout(() => {
        navigate('/staff/customers')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 opacity-90 pointer-events-none" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 z-10">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
            🎉 Password updated successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <input
              required
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              required
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Change Password & Login
          </button>
        </form>
      </div>
    </div>
  )
}
