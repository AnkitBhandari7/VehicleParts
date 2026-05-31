import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { getRole, getToken } from './services/auth'

// Auth
import Login  from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ChangePassword from './pages/auth/ChangePassword'


// Admin
import AdminDashboard   from './pages/admin/AdminDashboard'
import FinancialReport  from './pages/financial/FinancialReport'
import NotificationsPage from './pages/admin/NotificationsPage'
import StaffDirectory   from './pages/staff/StaffDirectory'

// Staff
import CreateInvoice     from './pages/staff/CreateInvoice'
import CustomerViewPage  from './pages/staff/CustomerViewPage'
import CustomerReportsPage from './pages/staff/CustomerReportsPage'
import AppointmentsStaffPage from './pages/staff/AppointmentsStaffPage'
import Inventory         from './pages/inventory/Inventory'
import SendInvoice       from './pages/staff/SendInvoice'

// F4 — Purchase Invoices
import InvoiceList           from './pages/invoices/InvoiceList'
import PurchaseInvoiceCreate from './pages/invoices/CreateInvoice'

// F5 — Vendors
import VendorList from './pages/vendors/VendorList'
import VendorForm from './pages/vendors/VendorForm'

// F6 — Customers
import RegisterCustomer from './pages/customers/RegisterCustomer'
import CustomerList     from './pages/customers/CustomerList'
import CustomerDetail   from './pages/customers/CustomerDetail'

// Customer portal
import AppointmentsPage from './pages/customer/AppointmentsPage'
import PartRequestsPage from './pages/customer/PartRequestsPage'
import ReviewsPage      from './pages/customer/ReviewsPage'
import PurchaseHistory  from './pages/customer/PurchaseHistory'
import LoyaltyProgram   from './pages/customer/LoyaltyProgram'
import ProfilePage      from './pages/customer/ProfilePage'

/** Redirect the root path to the correct home for the logged-in role */
function RoleHome() {
  const token = getToken()
  const role  = getRole()
  if (!token) return <Navigate to="/login" replace />
  if (role === 'Admin')    return <Navigate to="/admin/dashboard" replace />
  if (role === 'Staff')    return <Navigate to="/staff/customers"  replace />
  if (role === 'Customer') return <Navigate to="/customer/profile" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route path="/" element={<Layout />}>
        {/* Root → role-aware redirect */}
        <Route index element={<RoleHome />} />

        {/* ── Admin-only routes ─────────────────────────────────────────── */}
        <Route path="admin/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/financial" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <FinancialReport />
          </ProtectedRoute>
        } />
        <Route path="admin/staff" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <StaffDirectory />
          </ProtectedRoute>
        } />
        <Route path="admin/notifications" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/* ── Admin + Staff shared routes ───────────────────────────────── */}
        <Route path="staff/inventory" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="staff/invoices" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <InvoiceList />
          </ProtectedRoute>
        } />
        <Route path="staff/invoices/create" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <PurchaseInvoiceCreate />
          </ProtectedRoute>
        } />
        <Route path="staff/vendors" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <VendorList />
          </ProtectedRoute>
        } />
        <Route path="staff/vendors/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <VendorForm />
          </ProtectedRoute>
        } />
        <Route path="staff/vendors/:id/edit" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <VendorForm />
          </ProtectedRoute>
        } />

        {/* Customers (F6 register + F10 search) — Admin & Staff */}
        <Route path="staff/customers" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <CustomerList />
          </ProtectedRoute>
        } />
        <Route path="staff/customers/register" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <RegisterCustomer />
          </ProtectedRoute>
        } />
        <Route path="staff/customers/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <CustomerDetail />
          </ProtectedRoute>
        } />

        {/* ── Staff-only routes ─────────────────────────────────────────── */}
        <Route path="staff/sell" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <CreateInvoice />
          </ProtectedRoute>
        } />
        <Route path="staff/customer-view" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <CustomerViewPage />
          </ProtectedRoute>
        } />
        <Route path="staff/customer-reports" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <CustomerReportsPage />
          </ProtectedRoute>
        } />
        <Route path="staff/appointments" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <AppointmentsStaffPage />
          </ProtectedRoute>
        } />
        <Route path="staff/send-invoice" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <SendInvoice />
          </ProtectedRoute>
        } />

        {/* ── Customer-only routes ──────────────────────────────────────── */}
        <Route path="customer/profile" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="customer/appointments" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <AppointmentsPage />
          </ProtectedRoute>
        } />
        <Route path="customer/part-requests" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <PartRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="customer/reviews" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <ReviewsPage />
          </ProtectedRoute>
        } />
        <Route path="customer/history" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <PurchaseHistory />
          </ProtectedRoute>
        } />
        <Route path="customer/loyalty" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <LoyaltyProgram />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}
