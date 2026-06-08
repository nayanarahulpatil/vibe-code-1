import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function FinanceDashboard() {
  const navigate = useNavigate()
  const { data: claims, isLoading } = useQuery({
    queryKey: ['finance-claims'],
    queryFn: () => api.get('/expense-claims?status=SUBMITTED').then((r) => r.data),
  })
  const { data: reimbursements } = useQuery({
    queryKey: ['finance-reimb'],
    queryFn: () => api.get('/reimbursements').then((r) => r.data),
  })

  const totalPending = claims?.data?.reduce((acc: number, c: any) => acc + Number(c.totalAmount), 0) || 0
  const totalReimbursed = reimbursements?.data?.filter((r: any) => r.status === 'PAID')
    .reduce((acc: number, r: any) => acc + Number(r.amount), 0) || 0

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Finance Dashboard</h1>
          <p>Process expense claims and manage reimbursements</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/reports')}>📋 Reports</button>
          <button className="btn btn-primary" onClick={() => navigate('/reimbursements')}>💰 Reimbursements</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card warning">
          <div className="kpi-label">📋 Claims Pending Review</div>
          <div className="kpi-value">{claims?.total ?? '—'}</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">💰 Pending Payout</div>
          <div className="kpi-value">₹{(totalPending / 1000).toFixed(0)}K</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">✅ Reimbursed (Total)</div>
          <div className="kpi-value">₹{(totalReimbursed / 1000).toFixed(0)}K</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Claims Awaiting Finance Review</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/expense-claims')}>View All →</button>
        </div>
        {isLoading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : !claims?.data?.length ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem' }}>✅</p>
            <h3>No pending claims</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Claim #</th><th>Employee</th><th>Amount</th><th>Flagged Items</th><th>Submitted</th><th>Action</th></tr></thead>
              <tbody>
                {claims.data.slice(0, 8).map((ec: any) => (
                  <tr key={ec.id}>
                    <td><code style={{ color: 'var(--accent)' }}>{ec.claimNumber}</code></td>
                    <td>{ec.employee?.firstName} {ec.employee?.lastName}</td>
                    <td className="font-semibold">₹{Number(ec.totalAmount).toLocaleString()}</td>
                    <td>
                      {ec.lineItems?.filter((li: any) => li.isPolicyFlagged).length > 0
                        ? <span className="badge badge-rejected">⚠️ {ec.lineItems.filter((li: any) => li.isPolicyFlagged).length} flagged</span>
                        : <span className="badge badge-approved">✓ Clean</span>}
                    </td>
                    <td className="text-muted text-sm">{ec.submittedAt ? new Date(ec.submittedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/expense-claims')}>Review</button>
                    </td>
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
