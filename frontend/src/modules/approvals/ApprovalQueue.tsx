import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ApprovalQueue() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null)
  const [comments, setComments] = useState('')

  const { data: pending, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => api.get('/travel-requests/pending-approvals').then((r) => r.data),
  })

  const approveMut = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) => api.patch(`/travel-requests/${id}/approve`, { comments }),
    onSuccess: () => { toast.success('✅ Travel request approved!'); qc.invalidateQueries({ queryKey: ['pending-approvals'] }); setModal(null) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.patch(`/travel-requests/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Travel request rejected'); qc.invalidateQueries({ queryKey: ['pending-approvals'] }); setModal(null) },
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Approval Queue</h1>
          <p>Review and action pending travel requests</p>
        </div>
        <div className="badge badge-submitted" style={{ padding: '0.5rem 1rem' }}>
          {pending?.length || 0} Pending
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 300 }} />
        ) : !pending?.length ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem' }}>✅</p>
            <h3>Queue is empty!</h3>
            <p className="text-sm">All travel requests have been reviewed</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Request #</th><th>Employee</th><th>Destination</th><th>Dates</th><th>Est. Cost</th><th>Purpose</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.map((tr: any) => (
                  <tr key={tr.id}>
                    <td><code style={{ color: 'var(--primary-light)', fontSize: '0.8rem' }}>{tr.requestNumber}</code></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">{tr.employee?.firstName?.[0]}{tr.employee?.lastName?.[0]}</div>
                        <div>
                          <div className="text-sm font-medium">{tr.employee?.firstName} {tr.employee?.lastName}</div>
                          <div className="text-xs text-muted">{tr.employee?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{tr.destination}</strong><br /><span className="text-xs text-muted">from {tr.origin}</span></td>
                    <td className="text-sm">{tr.departureDate} → {tr.returnDate}</td>
                    <td className="font-semibold">₹{Number(tr.estimatedCost).toLocaleString()}</td>
                    <td className="text-sm text-muted">{tr.purpose?.replace(/_/g, ' ')}</td>
                    <td className="text-sm text-muted">{tr.submittedAt ? new Date(tr.submittedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => { setModal({ type: 'approve', id: tr.id }); setComments('') }}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setModal({ type: 'reject', id: tr.id }); setComments('') }}>✗ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h3 className="modal-title">{modal.type === 'approve' ? '✅ Approve Travel Request' : '❌ Reject Travel Request'}</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">{modal.type === 'approve' ? 'Comments (optional)' : 'Rejection Reason *'}</label>
              <textarea className="form-control" rows={3} placeholder={modal.type === 'approve' ? 'Add any comments...' : 'Provide a reason for rejection...'} value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                className={`btn ${modal.type === 'approve' ? 'btn-success' : 'btn-danger'}`}
                disabled={modal.type === 'reject' && !comments}
                onClick={() => {
                  if (modal.type === 'approve') approveMut.mutate({ id: modal.id, comments })
                  else rejectMut.mutate({ id: modal.id, reason: comments })
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
