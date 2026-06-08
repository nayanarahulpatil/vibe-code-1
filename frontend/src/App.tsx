import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import LoginPage from './modules/auth/LoginPage'
import AppLayout from './components/layout/AppLayout'
import EmployeeDashboard from './modules/dashboard/EmployeeDashboard'
import ManagerDashboard from './modules/dashboard/ManagerDashboard'
import FinanceDashboard from './modules/dashboard/FinanceDashboard'
import KPIDashboard from './modules/dashboard/KPIDashboard'
import TravelRequestList from './modules/travel-request/TravelRequestList'
import TravelRequestForm from './modules/travel-request/TravelRequestForm'
import ExpenseClaimList from './modules/expense-claims/ExpenseClaimList'
import ExpenseClaimForm from './modules/expense-claims/ExpenseClaimForm'
import ApprovalQueue from './modules/approvals/ApprovalQueue'
import ReimbursementQueue from './modules/reimbursement/ReimbursementQueue'
import AuditLogViewer from './modules/audit/AuditLogViewer'
import ReportList from './modules/reports/ReportList'
import UserManagement from './modules/admin/UserManagement'
import PolicyRuleList from './modules/policy/PolicyRuleList'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { token, user } = useAppSelector((s) => s.auth)
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.some((r) => user?.roles?.includes(r))) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function RoleHome() {
  const { user } = useAppSelector((s) => s.auth)
  const roles = user?.roles || []
  if (roles.includes('MANAGER')) return <ManagerDashboard />
  if (roles.includes('FINANCE_EXECUTIVE')) return <FinanceDashboard />
  if (roles.includes('SYSTEM_ADMIN')) return <KPIDashboard />
  return <EmployeeDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<RoleHome />} />
          <Route path="kpi" element={<ProtectedRoute roles={['SYSTEM_ADMIN','FINANCE_EXECUTIVE','COMPLIANCE_OFFICER','HR_ADMIN']}><KPIDashboard /></ProtectedRoute>} />
          <Route path="travel-requests" element={<TravelRequestList />} />
          <Route path="travel-requests/new" element={<TravelRequestForm />} />
          <Route path="expense-claims" element={<ExpenseClaimList />} />
          <Route path="expense-claims/new" element={<ExpenseClaimForm />} />
          <Route path="approvals" element={<ProtectedRoute roles={['MANAGER','FINANCE_EXECUTIVE','SYSTEM_ADMIN']}><ApprovalQueue /></ProtectedRoute>} />
          <Route path="reimbursements" element={<ProtectedRoute roles={['FINANCE_EXECUTIVE','SYSTEM_ADMIN']}><ReimbursementQueue /></ProtectedRoute>} />
          <Route path="audit-logs" element={<ProtectedRoute roles={['AUDITOR','SYSTEM_ADMIN','COMPLIANCE_OFFICER']}><AuditLogViewer /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={['FINANCE_EXECUTIVE','SYSTEM_ADMIN','AUDITOR']}><ReportList /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute roles={['SYSTEM_ADMIN','HR_ADMIN']}><UserManagement /></ProtectedRoute>} />
          <Route path="admin/policies" element={<ProtectedRoute roles={['COMPLIANCE_OFFICER','SYSTEM_ADMIN']}><PolicyRuleList /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
