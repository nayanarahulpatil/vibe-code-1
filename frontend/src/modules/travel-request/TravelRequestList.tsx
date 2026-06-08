import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { DRAFT: 'badge-draft', SUBMITTED: 'badge-submitted', UNDER_REVIEW: 'badge-under-review', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', CANCELLED: 'badge-cancelled' }
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status?.replace(/_/g, ' ')}</span>
}

export default function TravelRequestList() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['my-travel-requests', filter],
    queryFn: () => api.get(`/travel-requests/my${filter !== 'all' ? `?status=${filter}` : ''}`).then((r) => r.data),
  })

  const submitMut = useMutation({
    mutationFn: (id: string) => api.patch(`/travel-requests/${id}/submit`),
    onSuccess: () => { toast.success('Travel request submitted!'); qc.invalidateQueries({ queryKey: ['my-travel-requests'] }) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submit failed'),
  })

  const cancelMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.patch(`/travel-requests/${id}/cancel`, { reason }),
    onSuccess: () => { toast.success('Travel request cancelled'); qc.invalidateQueries({ queryKey: ['my-travel-requests'] }) },
  })

  const requests = data?.data || data || []

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Travel Requests</h1>
          <p>Manage your business travel requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/travel-requests/new')}>✈️ New Request</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
        {['all', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((f) => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 300 }} />
        ) : !requests.length ? (
          <div className="empty-state">
            <p style={{ fontSize: '2.5rem' }}>✈️</p>
            <h3>No travel requests found</h3>
            <p className="text-sm">Click "New Request" to create your first travel request</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/travel-requests/new')}>Create Travel Request</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Request #</th><th>Destination</th><th>Purpose</th>
                  <th>Departure</th><th>Est. Cost</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((tr: any) => (
                  <tr key={tr.id}>
                    <td><code style={{ color: 'var(--primary-light)', fontSize: '0.8rem' }}>{tr.requestNumber}</code></td>
                    <td><strong>{tr.destination}</strong><br /><span className="text-xs text-muted">{tr.origin} →</span></td>
                    <td className="text-sm">{tr.purpose?.replace(/_/g, ' ')}</td>
                    <td className="text-sm">{tr.departureDate}</td>
                    <td className="font-semibold">₹{Number(tr.estimatedCost).toLocaleString()}</td>
                    <td><StatusBadge status={tr.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        {tr.status === 'DRAFT' && (
                          <button className="btn btn-primary btn-sm" onClick={() => submitMut.mutate(tr.id)}>Submit</button>
                        )}
                        {['DRAFT', 'SUBMITTED'].includes(tr.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelMut.mutate({ id: tr.id, reason: 'Cancelled by employee' })}>Cancel</button>
                        )}
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
