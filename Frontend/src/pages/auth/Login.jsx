import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../services/authAPI'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      const role = res.data.role || 'Staff'
      const emailLower = email.toLowerCase()
      localStorage.setItem('token',      res.data.token)
      localStorage.setItem('userName',   res.data.fullName || res.data.email)
      localStorage.setItem('role',       role)
      localStorage.setItem('customerId', res.data.customerId || '')

      if (role === 'Staff' && localStorage.getItem('pendingPasswordChange_' + emailLower) === 'true') {
        localStorage.setItem('tempStaffEmail', emailLower)
        navigate('/change-password')
      } else {
        if (role === 'Admin')         navigate('/admin/dashboard')
        else if (role === 'Staff')    navigate('/staff/customers')
        else                          navigate('/customer/appointments')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12 overflow-hidden bg-slate-900">
        <img 
          src="/login_car_bg.png" 
          alt="Login Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
        
        <div className="relative z-10 text-white">
          <h1 className="text-4xl font-bold mb-4">Precision Inventory Management.</h1>
          <p className="text-slate-200 text-lg mb-12 max-w-md leading-relaxed">
            The industrial-grade solution for modern warehouse operations and retail automotive chains.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-10 flex flex-col items-center">
            <img src="/logo.png" alt="Logo" className="h-10 mb-8" />
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email" required 
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required 
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-medium">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300" />
                Remember me
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}