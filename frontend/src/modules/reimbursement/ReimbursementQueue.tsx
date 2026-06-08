import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { QUEUED: 'badge-submitted', PAYMENT_INITIATED: 'badge-under-review', PAID: 'badge-paid', FAILED: 'badge-rejected', PROCESSING: 'badge-under-review' }
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status?.replace(/_/g, ' ')}</span>
}

export default function ReimbursementQueue() {
  const qc = useQueryClient()
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['approved-claims'],
    queryFn: () => api.get('/expense-claims?status=APPROVED').then((r) => r.data),
  })
  const { data: reimbursements } = useQuery({
    queryKey: ['all-reimbursements'],
    queryFn: () => api.get('/reimbursements').then((r) => r.data),
  })

  const initiateMut = useMutation({
    mutationFn: (expenseClaimId: string) => api.post('/reimbursements/initiate', { expenseClaimId }),
    onSuccess: () => { toast.success('💰 Reimbursement initiated successfully!'); qc.invalidateQueries(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const approvedClaims = claims?.data || []
  const allReimb = reimbursements?.data || []

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reimbursement Queue</h1>
          <p>Process approved expense claim payments</p>
        </div>
        <div className="badge badge-approved" style={{ padding: '0.5rem 1rem' }}>
          {approvedClaims.length} Awaiting Payment
        </div>
      </div>

      {/* Approved Claims — Ready for Payment */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">💳 Approved Claims — Ready for Payment</h2>
        {claimsLoading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : !approvedClaims.length ? (
          <div className="empty-state"><p style={{ fontSize: '2rem' }}>✅</p><h3>No claims awaiting payment</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Claim #</th><th>Employee</th><th>Amount</th><th>Approved</th><th>Action</th></tr></thead>
              <tbody>
                {approvedClaims.map((ec: any) => (
                  <tr key={ec.id}>
                    <td><code style={{ color: 'var(--accent)' }}>{ec.claimNumber}</code></td>
                    <td>{ec.employee?.firstName} {ec.employee?.lastName}</td>
                    <td className="font-bold" style={{ color: 'var(--success)' }}>₹{Number(ec.approvedAmount || ec.totalAmount).toLocaleString()}</td>
                    <td className="text-sm text-muted">{ec.approvedAt ? new Date(ec.approvedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => initiateMut.mutate(ec.id)} disabled={initiateMut.isPending}>
                        💸 Initiate Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="card">
        <h2 className="font-semibold mb-4">📋 Payment History</h2>
        {!allReimb.length ? (
          <div className="empty-state"><h3>No reimbursements processed yet</h3></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Ref #</th><th>Bank Ref</th><th>Amount</th><th>Status</th><th>Completed</th></tr></thead>
              <tbody>
                {allReimb.map((r: any) => (
                  <tr key={r.id}>
                    <td><code style={{ color: 'var(--primary-light)', fontSize: '0.8rem' }}>{r.reimbursementNumber}</code></td>
                    <td><code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.bankReference || '—'}</code></td>
                    <td className="font-semibold">₹{Number(r.amount).toLocaleString()}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-sm text-muted">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
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
