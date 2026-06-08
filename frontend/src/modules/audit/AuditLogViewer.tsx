import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

export default function AuditLogViewer() {
  const [filters, setFilters] = useState({ userEmail: '', action: '', entityType: '', from: '', to: '' })
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)) })
      return api.get(`/audit-logs?${params}`).then((r) => r.data)
    },
  })

  const ACTION_COLORS: Record<string, string> = {
    LOGIN: '#6366f1', LOGOUT: '#94a3b8', CREATE: '#10b981', UPDATE: '#f59e0b',
    APPROVE: '#34d399', REJECT: '#f87171', SUBMIT: '#22d3ee', CANCEL: '#9ca3af',
    PAYMENT_COMPLETE: '#a5b4fc', PAYMENT_FAIL: '#fca5a5', POLICY_FLAG: '#fbbf24',
  }

  const logs = data?.data || []
  const total = data?.total || 0

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Log Viewer</h1>
          <p>Immutable trail of all system actions</p>
        </div>
        <div className="badge badge-approved">{total.toLocaleString()} Total Entries</div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="form-grid-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">User Email</label>
            <input className="form-control" placeholder="Filter by email..." value={filters.userEmail} onChange={(e) => setFilters((f) => ({ ...f, userEmail: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Action Type</label>
            <select className="form-control" value={filters.action} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}>
              <option value="">All Actions</option>
              {['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'SUBMIT', 'CANCEL', 'PAYMENT_INITIATE', 'PAYMENT_COMPLETE', 'PAYMENT_FAIL', 'POLICY_FLAG'].map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Entity Type</label>
            <select className="form-control" value={filters.entityType} onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}>
              <option value="">All Entities</option>
              {['TravelRequest', 'ExpenseClaim', 'Reimbursement', 'User', 'PolicyRule'].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary w-full" onClick={() => setFilters({ userEmail: '', action: '', entityType: '', from: '', to: '' })}>Clear Filters</button>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 400 }} />
        ) : !logs.length ? (
          <div className="empty-state"><p style={{ fontSize: '2rem' }}>🔍</p><h3>No audit logs found</h3></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Description</th><th>IP</th></tr></thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="text-sm">{log.userEmail || '—'}<br /><span className="text-xs text-muted">{log.roleName}</span></td>
                      <td>
                        <span className="badge" style={{ background: `${ACTION_COLORS[log.action] || '#94a3b8'}22`, color: ACTION_COLORS[log.action] || '#94a3b8', border: `1px solid ${ACTION_COLORS[log.action] || '#94a3b8'}44` }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-sm">{log.entityType && <><span style={{ color: 'var(--accent)' }}>{log.entityType}</span><br /><code className="text-xs text-muted">{log.entityRef}</code></>}</td>
                      <td className="text-sm" style={{ maxWidth: 300 }}>{log.description}</td>
                      <td className="text-xs text-muted">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span className="text-sm text-muted">Showing {logs.length} of {total} entries</span>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span className="btn btn-secondary btn-sm" style={{ cursor: 'default' }}>Page {page}</span>
                <button className="btn btn-secondary btn-sm" disabled={page * 50 >= total} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
