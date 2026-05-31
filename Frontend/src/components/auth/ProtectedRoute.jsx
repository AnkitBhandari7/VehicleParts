import { Navigate } from 'react-router-dom'
import { getToken, getRole } from '../../services/auth'

/**
 * ProtectedRoute — wraps a route and enforces:
 *   1. Authentication (must have a token)
 *   2. Role authorization (if `allowedRoles` is provided, role must match)
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['Admin']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken()
  const role  = getRole()

  // Not logged in at all → go to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → redirect to their correct home
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'Admin')    return <Navigate to="/admin/dashboard" replace />
    if (role === 'Staff')    return <Navigate to="/staff/customers"  replace />
    if (role === 'Customer') return <Navigate to="/customer/profile" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
