import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useAppSelector } from '../../store/hooks'
import { useNavigate } from 'react-router-dom'

export default function EmployeeDashboard() {
  const { user } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => api.get('/dashboard/employee').then((r) => r.data),
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome, {user?.firstName} 👋</h1>
          <p>Here's a summary of your travel and expense activity</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/travel-requests/new')}>✈️ New Travel Request</button>
          <button className="btn btn-primary" onClick={() => navigate('/expense-claims/new')}>💳 New Expense Claim</button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="kpi-grid">
        {[
          { label: 'Travel Requests', value: data?.myTravel?.length || 0, icon: '✈️', color: 'primary' },
          { label: 'Expense Claims', value: data?.myExpenses?.length || 0, icon: '💳', color: 'accent' },
          { label: 'Reimbursements', value: data?.myReimb?.length || 0, icon: '💰', color: 'success' },
          { label: 'Pending Actions', value: (data?.myTravel?.filter((t: any) => t.status === 'SUBMITTED')?.length || 0), icon: '⏳', color: 'warning' },
        ].map((kpi) => (
          <div key={kpi.label} className={`kpi-card ${kpi.color}`}>
            <div className="kpi-label">{kpi.icon} {kpi.label}</div>
            <div className="kpi-value">{isLoading ? '—' : kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Travel Requests */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Travel Requests</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/travel-requests')}>View All →</button>
        </div>
        {isLoading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : !data?.myTravel?.length ? (
          <div className="empty-state">
            <p>✈️</p>
            <h3>No travel requests yet</h3>
            <p className="text-sm">Submit your first travel request to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Ref</th><th>Destination</th><th>Departure</th><th>Status</th></tr></thead>
              <tbody>
                {data.myTravel.slice(0, 5).map((tr: any) => (
                  <tr key={tr.id}>
                    <td><code style={{ color: 'var(--primary-light)' }}>{tr.requestNumber}</code></td>
                    <td>{tr.destination}</td>
                    <td>{tr.departureDate}</td>
                    <td><StatusBadge status={tr.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Expense Claims */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Expense Claims</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/expense-claims')}>View All →</button>
        </div>
        {isLoading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : !data?.myExpenses?.length ? (
          <div className="empty-state">
            <p>💳</p>
            <h3>No expense claims yet</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Claim #</th><th>Amount</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                {data.myExpenses.slice(0, 5).map((ec: any) => (
                  <tr key={ec.id}>
                    <td><code style={{ color: 'var(--accent)' }}>{ec.claimNumber}</code></td>
                    <td className="font-semibold">₹{Number(ec.totalAmount).toLocaleString()}</td>
                    <td><StatusBadge status={ec.status} /></td>
                    <td className="text-muted text-sm">{ec.submittedAt ? new Date(ec.submittedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'badge-draft', SUBMITTED: 'badge-submitted', UNDER_REVIEW: 'badge-under-review',
    APPROVED: 'badge-approved', REJECTED: 'badge-rejected', CANCELLED: 'badge-cancelled',
    PAYMENT_INITIATED: 'badge-under-review', REIMBURSED: 'badge-paid',
  }
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status?.replace(/_/g, ' ')}</span>
}
