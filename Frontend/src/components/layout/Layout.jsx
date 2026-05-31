import { Outlet, useNavigate, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getUserName, getRole } from '../../services/auth'

export default function Layout() {
  const navigate = useNavigate()
  const userName = getUserName() || 'Guest'
  const role = getRole() || ''

  const handleNotificationClick = () => {
    if (role?.toUpperCase() === 'ADMIN') {
      navigate('/admin/notifications')
    } else {
      alert("Notifications dashboard is only accessible to Administrators.")
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Modern Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 shadow-sm z-10">
          <div />

          <div className="flex items-center gap-5">
            {/* User Role Badge */}
            {role && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${role.toUpperCase() === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-150' : ''}
                ${role.toUpperCase() === 'STAFF' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : ''}
                ${role.toUpperCase() === 'CUSTOMER' ? 'bg-blue-50 text-blue-700 border border-blue-150' : ''}
              `}>
                {role}
              </span>
            )}

            {/* Interactive Notification Bell */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-all group"
              title="View Notifications"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification Badge Dot (Active for Admin role to notify them of items) */}
              {role?.toUpperCase() === 'ADMIN' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}