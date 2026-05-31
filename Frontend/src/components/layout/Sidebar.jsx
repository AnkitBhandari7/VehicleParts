import { NavLink } from 'react-router-dom'
import { getUserName, getRole, logout } from '../../services/auth'
import logo from '../../assets/logo.png'

const adminLinks = [
  { label: 'Dashboard',        path: '/admin/dashboard'     },
  { label: 'Financial Report', path: '/admin/financial'     },
  { label: 'Staff Management', path: '/admin/staff'         },
]

const staffLinks = [
  { label: 'Parts Inventory',   path: '/staff/inventory'        },
  { label: 'Purchase Invoices', path: '/staff/invoices'         },
  { label: 'Vendor Management', path: '/staff/vendors'          },
  { label: 'Customers',         path: '/staff/customers'        },
  { label: 'Sell Parts',        path: '/staff/sell'             },
  { label: 'Customer History', path: '/staff/customer-view'    },
  { label: 'Customer Reports',  path: '/staff/customer-reports' },
  { label: 'Appointments',      path: '/staff/appointments'     },
  { label: 'Send Invoice',      path: '/staff/send-invoice'     },
]

const customerLinks = [
  { label: 'Profile & Vehicles', path: '/customer/profile'      },
  { label: 'Appointments',       path: '/customer/appointments'  },
  { label: 'Part Requests',      path: '/customer/part-requests' },
  { label: 'Reviews',            path: '/customer/reviews'       },
  { label: 'Purchase History',   path: '/customer/history'       },
  { label: 'Loyalty Program',    path: '/customer/loyalty'       },
]

const ADMIN_STAFF_LABELS  = ['Parts Inventory', 'Purchase Invoices', 'Vendor Management', 'Customers']
const STAFF_ONLY_LABELS   = ['Customers', 'Sell Parts', 'Customer History', 'Customer Reports', 'Appointments', 'Send Invoice']

function NavGroup({ title, links }) {
  if (!links || links.length === 0) return null
  return (
    <div className="mb-2">
      <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {title}
      </p>
      {links.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const userName = getUserName() || 'User'
  const role     = getRole()     || ''

  const showAdminSection    = role === 'Admin'
  const showCustomerSection = role === 'Customer'

  const filteredStaffLinks = staffLinks.filter(link => {
    if (role === 'Admin')  return ADMIN_STAFF_LABELS.includes(link.label)
    if (role === 'Staff')  return STAFF_ONLY_LABELS.includes(link.label)
    return false
  })

  return (
    <div className="w-56 min-h-screen bg-gray-900 flex flex-col">
      {/* Brand */}
      <div className="px-3 py-4 border-b border-gray-800 flex items-center justify-center">
        <img src={logo} alt="AutoParts Pro Logo" className="w-full max-h-24 object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {showAdminSection              && <NavGroup title="Admin"      links={adminLinks}          />}
        {filteredStaffLinks.length > 0 && (
          <NavGroup
            title={role === 'Admin' ? 'Back Office' : 'Staff'}
            links={filteredStaffLinks}
          />
        )}
        {showCustomerSection           && <NavGroup title="Customer"   links={customerLinks}       />}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-gray-300 text-xs font-semibold truncate mb-0.5">{userName}</p>
        <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-3">{role}</p>
        <button
          onClick={logout}
          className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
