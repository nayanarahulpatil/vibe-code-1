import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { DRAFT: 'badge-draft', SUBMITTED: 'badge-submitted', UNDER_REVIEW: 'badge-under-review', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', PAYMENT_INITIATED: 'badge-under-review', REIMBURSED: 'badge-paid' }
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status?.replace(/_/g, ' ')}</span>
}

export default function ExpenseClaimList() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['my-expense-claims', filter],
    queryFn: () => api.get(`/expense-claims/my${filter !== 'all' ? `?status=${filter}` : ''}`).then((r) => r.data),
  })

  const submitMut = useMutation({
    mutationFn: (id: string) => api.patch(`/expense-claims/${id}/submit`),
    onSuccess: () => { toast.success('Expense claim submitted!'); qc.invalidateQueries({ queryKey: ['my-expense-claims'] }) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const claims = data?.data || data || []

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Expense Claims</h1>
          <p>Submit and track your expense reimbursements</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/expense-claims/new')}>💳 New Claim</button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REIMBURSED', 'REJECTED'].map((f) => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 300 }} />
        ) : !claims.length ? (
          <div className="empty-state">
            <p style={{ fontSize: '2.5rem' }}>💳</p>
            <h3>No expense claims found</h3>
            <p className="text-sm">Submit your post-trip expenses for reimbursement</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/expense-claims/new')}>Create Expense Claim</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Claim #</th><th>Trip</th><th>Total Amount</th><th>Flagged</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {claims.map((ec: any) => {
                  const flaggedCount = ec.lineItems?.filter((li: any) => li.isPolicyFlagged).length || 0
                  return (
                    <tr key={ec.id}>
                      <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{ec.claimNumber}</code></td>
                      <td className="text-sm">{ec.travelRequest?.destination || '—'}</td>
                      <td className="font-semibold">₹{Number(ec.totalAmount).toLocaleString()}</td>
                      <td>
                        {flaggedCount > 0
                          ? <span className="badge badge-rejected">⚠️ {flaggedCount}</span>
                          : <span className="badge badge-approved">✓</span>}
                      </td>
                      <td><StatusBadge status={ec.status} /></td>
                      <td className="text-muted text-sm">{ec.submittedAt ? new Date(ec.submittedAt).toLocaleDateString() : '—'}</td>
                      <td>
                        {ec.status === 'DRAFT' && (
                          <button className="btn btn-primary btn-sm" onClick={() => submitMut.mutate(ec.id)}>Submit</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
