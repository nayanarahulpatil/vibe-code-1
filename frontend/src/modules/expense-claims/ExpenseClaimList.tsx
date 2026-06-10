import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAppSelector } from '../../store/hooks'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { DRAFT: 'badge-draft', SUBMITTED: 'badge-submitted', UNDER_REVIEW: 'badge-under-review', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', PAYMENT_INITIATED: 'badge-under-review', REIMBURSED: 'badge-paid' }
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status?.replace(/_/g, ' ')}</span>
}

export default function ExpenseClaimList() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')
  const { user } = useAppSelector((s) => s.auth)
  const [modal, setModal] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null)
  const [notes, setNotes] = useState('')

  const isPrivileged = user?.roles?.some((r: string) => ['FINANCE_EXECUTIVE', 'SYSTEM_ADMIN', 'AUDITOR'].includes(r))

  const { data, isLoading } = useQuery({
    queryKey: ['my-expense-claims', filter, isPrivileged],
    queryFn: () => {
      const endpoint = isPrivileged ? '/expense-claims' : '/expense-claims/my';
      return api.get(`${endpoint}${filter !== 'all' ? `?status=${filter}` : ''}`).then((r) => r.data)
    },
  })

  const submitMut = useMutation({
    mutationFn: (id: string) => api.patch(`/expense-claims/${id}/submit`),
    onSuccess: () => { toast.success('Expense claim submitted!'); qc.invalidateQueries({ queryKey: ['my-expense-claims'] }) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const approveMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => api.patch(`/expense-claims/${id}/approve`, { notes }),
    onSuccess: () => { toast.success('✅ Expense claim approved!'); qc.invalidateQueries({ queryKey: ['my-expense-claims'] }); setModal(null) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.patch(`/expense-claims/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Expense claim rejected'); qc.invalidateQueries({ queryKey: ['my-expense-claims'] }); setModal(null) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const claims = data?.data || data || []

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Expense Claims</h1>
          <p>{isPrivileged ? 'Review and process employee expense claims' : 'Submit and track your expense reimbursements'}</p>
        </div>
        {!isPrivileged && (
          <button className="btn btn-primary" onClick={() => navigate('/expense-claims/new')}>💳 New Claim</button>
        )}
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
                <tr>
                  <th>Claim #</th>
                  {isPrivileged && <th>Employee</th>}
                  <th>Trip</th>
                  <th>Total Amount</th>
                  <th>Flagged</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((ec: any) => {
                  const flaggedCount = ec.lineItems?.filter((li: any) => li.isPolicyFlagged).length || 0
                  return (
                    <tr key={ec.id}>
                      <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{ec.claimNumber}</code></td>
                      {isPrivileged && (
                        <td>
                          <div className="text-sm font-medium">{ec.employee?.firstName} {ec.employee?.lastName}</div>
                          <div className="text-xs text-muted">{ec.employee?.department}</div>
                        </td>
                      )}
                      <td className="text-sm">{ec.travelRequest?.destination || '—'}</td>
                      <td className="font-semibold">₹{Number(ec.totalAmount).toLocaleString()}</td>
                      <td>
                        {flaggedCount > 0
                          ? <span className="badge badge-rejected">⚠️ {flaggedCount} flagged</span>
                          : <span className="badge badge-approved">✓ Clean</span>}
                      </td>
                      <td><StatusBadge status={ec.status} /></td>
                      <td className="text-muted text-sm">{ec.submittedAt ? new Date(ec.submittedAt).toLocaleDateString() : '—'}</td>
                      <td>
                        {ec.status === 'DRAFT' && ec.employeeId === user?.id && (
                          <button className="btn btn-primary btn-sm" onClick={() => submitMut.mutate(ec.id)}>Submit</button>
                        )}
                        {isPrivileged && ec.status === 'SUBMITTED' && (
                          <div className="flex gap-2">
                            <button className="btn btn-success btn-sm" onClick={() => { setModal({ type: 'approve', id: ec.id }); setNotes('') }}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setModal({ type: 'reject', id: ec.id }); setNotes('') }}>✗ Reject</button>
                          </div>
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

      {/* Action Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.type === 'approve' ? '✅ Approve Expense Claim' : '❌ Reject Expense Claim'}</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">{modal.type === 'approve' ? 'Notes (optional)' : 'Rejection Reason *'}</label>
              <textarea className="form-control" rows={3} placeholder={modal.type === 'approve' ? 'Add notes for this approval...' : 'Provide a reason for rejection...'} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                className={`btn ${modal.type === 'approve' ? 'btn-success' : 'btn-danger'}`}
                disabled={modal.type === 'reject' && !notes}
                onClick={() => {
                  if (modal.type === 'approve') approveMut.mutate({ id: modal.id, notes })
                  else rejectMut.mutate({ id: modal.id, reason: notes })
                }}
              >
                {modal.type === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
