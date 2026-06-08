import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { logout } from '../../modules/auth/authSlice'

const NAV_ITEMS = [
  { path: '/',               label: 'Dashboard',        icon: '📊', section: 'Overview',    roles: [] },
  { path: '/kpi',            label: 'KPI Dashboard',    icon: '📈', section: 'Overview',    roles: ['SYSTEM_ADMIN','FINANCE_EXECUTIVE','COMPLIANCE_OFFICER','HR_ADMIN'] },
  { path: '/travel-requests',label: 'Travel Requests',  icon: '✈️',  section: 'Requests',   roles: [] },
  { path: '/expense-claims', label: 'Expense Claims',   icon: '💳', section: 'Requests',   roles: [] },
  { path: '/approvals',      label: 'Approvals',        icon: '✅', section: 'Workflow',    roles: ['MANAGER','FINANCE_EXECUTIVE','SYSTEM_ADMIN'] },
  { path: '/reimbursements', label: 'Reimbursements',   icon: '💰', section: 'Workflow',    roles: ['FINANCE_EXECUTIVE','SYSTEM_ADMIN'] },
  { path: '/reports',        label: 'Reports',          icon: '📋', section: 'Analytics',  roles: ['FINANCE_EXECUTIVE','SYSTEM_ADMIN','AUDITOR'] },
  { path: '/audit-logs',     label: 'Audit Logs',       icon: '🔍', section: 'Compliance', roles: ['AUDITOR','SYSTEM_ADMIN','COMPLIANCE_OFFICER'] },
  { path: '/admin/users',    label: 'User Management',  icon: '👥', section: 'Admin',      roles: ['SYSTEM_ADMIN','HR_ADMIN'] },
  { path: '/admin/policies', label: 'Policy Rules',     icon: '📜', section: 'Admin',      roles: ['COMPLIANCE_OFFICER','SYSTEM_ADMIN'] },
]

export default function AppLayout() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const userRoles: string[] = user?.roles || []

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || item.roles.some((r) => userRoles.includes(r))
  )

  const sections = [...new Set(visibleItems.map((i) => i.section))]
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <span className="logo-text">TEMS</span>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {visibleItems.filter((i) => i.section === section).map((item) => (
                <div
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar avatar-sm">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-muted truncate">{userRoles[0]?.replace('_', ' ')}</div>
          </div>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={handleLogout} title="Logout">⇤</button>
        </div>
      </aside>

      {/* Header */}
      <header className="header">
        <div>
          <div className="header-title">
            {visibleItems.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className="header-subtitle">Enterprise Travel & Expense Management System</div>
        </div>
        <div className="header-actions">
          <div className="avatar">{initials}</div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
