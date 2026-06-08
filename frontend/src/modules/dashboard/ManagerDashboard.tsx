import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const { data: summary } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: () => api.get('/dashboard/manager').then((r) => r.data),
  })
  const { data: pending } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => api.get('/travel-requests/pending-approvals').then((r) => r.data),
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Manager Dashboard</h1>
          <p>Review and approve team travel requests</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/travel-requests/new')}>✈️ My Travel</button>
          <button className="btn btn-primary" onClick={() => navigate('/approvals')}>✅ Approval Queue</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card warning">
          <div className="kpi-label">⏳ Pending Approvals</div>
          <div className="kpi-value">{summary?.pendingApprovals ?? '—'}</div>
          <div className="kpi-change">Requires your action</div>
        </div>
        <div className="kpi-card primary">
          <div className="kpi-label">📋 Team Requests (30d)</div>
          <div className="kpi-value">{pending?.length ?? '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Pending Team Travel Approvals</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/approvals')}>View Queue →</button>
        </div>
        {!pending?.length ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem' }}>✅</p>
            <h3>No pending approvals</h3>
            <p className="text-sm">All travel requests have been reviewed</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Request #</th><th>Employee</th><th>Destination</th><th>Est. Cost</th><th>Submitted</th><th>Action</th></tr></thead>
              <tbody>
                {pending.slice(0, 10).map((tr: any) => (
                  <tr key={tr.id}>
                    <td><code style={{ color: 'var(--primary-light)' }}>{tr.requestNumber}</code></td>
                    <td>{tr.employee?.firstName} {tr.employee?.lastName}</td>
                    <td>{tr.destination}</td>
                    <td className="font-semibold">₹{Number(tr.estimatedCost).toLocaleString()}</td>
                    <td className="text-muted text-sm">{tr.submittedAt ? new Date(tr.submittedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => navigate('/approvals')}>✓ Review</button>
                      </div>
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
