import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['FLIGHTS', 'HOTEL', 'MEALS', 'LOCAL_TRANSPORT', 'FUEL', 'CONFERENCE_FEE', 'VISA', 'INTERNET', 'MISCELLANEOUS']

export default function ExpenseClaimForm() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [claimId, setClaimId] = useState<string | null>(null)
  const [travelRequestId, setTravelRequestId] = useState('')
  const [lineItem, setLineItem] = useState({ category: '', description: '', amount: '', expenseDate: '' })

  // Fetch my approved travel requests (eligible for expense claim)
  const { data: travels } = useQuery({
    queryKey: ['approved-travels'],
    queryFn: () => api.get('/travel-requests/my?status=APPROVED').then((r) => r.data),
  })

  const createClaimMut = useMutation({
    mutationFn: () => api.post('/expense-claims', { travelRequestId }),
    onSuccess: (res) => { setClaimId(res.data.id); setStep(2); toast.success('Expense claim created. Add your expenses.') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const addItemMut = useMutation({
    mutationFn: () => api.post(`/expense-claims/${claimId}/line-items`, lineItem),
    onSuccess: (res) => {
      const item = res.data
      if (item.isPolicyFlagged) {
        toast.error(`⚠️ Policy flag: ${item.flagReason}`, { duration: 6000 })
      } else {
        toast.success('Line item added!')
      }
      setLineItem({ category: '', description: '', amount: '', expenseDate: '' })
      qc.invalidateQueries({ queryKey: ['claim-detail', claimId] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add line item'),
  })

  const submitMut = useMutation({
    mutationFn: () => api.patch(`/expense-claims/${claimId}/submit`),
    onSuccess: () => { toast.success('Expense claim submitted for review!'); navigate('/expense-claims') },
  })

  const { data: claim } = useQuery({
    queryKey: ['claim-detail', claimId],
    queryFn: () => claimId ? api.get(`/expense-claims/${claimId}`).then((r) => r.data) : null,
    enabled: !!claimId,
  })

  const travelList = travels?.data || travels || []

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>New Expense Claim</h1>
          <p>Step {step} of 3: {step === 1 ? 'Select Trip' : step === 2 ? 'Add Expenses' : 'Review & Submit'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {/* Step 1: Select Trip */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: 560 }}>
          <h3 className="font-semibold mb-4">Select Approved Trip</h3>
          {!travelList.length ? (
            <div className="empty-state">
              <p>✈️</p>
              <h3>No approved trips</h3>
              <p className="text-sm">You need an approved travel request before submitting expenses</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label required">Travel Request</label>
                <select className="form-control" value={travelRequestId} onChange={(e) => setTravelRequestId(e.target.value)} required>
                  <option value="">Select a trip...</option>
                  {travelList.map((tr: any) => (
                    <option key={tr.id} value={tr.id}>{tr.requestNumber} — {tr.destination} ({tr.departureDate})</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary w-full" disabled={!travelRequestId || createClaimMut.isPending} onClick={() => createClaimMut.mutate()}>
                {createClaimMut.isPending ? 'Creating...' : 'Create Expense Claim →'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Add Line Items */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Add Item Form */}
          <div className="card">
            <h3 className="font-semibold mb-4">Add Expense Item</h3>
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select className="form-control" value={lineItem.category} onChange={(e) => setLineItem((l) => ({ ...l, category: e.target.value }))}>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Description</label>
              <input className="form-control" placeholder="Brief description..." value={lineItem.description} onChange={(e) => setLineItem((l) => ({ ...l, description: e.target.value }))} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Amount (₹)</label>
                <input type="number" className="form-control" placeholder="0" value={lineItem.amount} onChange={(e) => setLineItem((l) => ({ ...l, amount: e.target.value }))} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label required">Expense Date</label>
                <input type="date" className="form-control" value={lineItem.expenseDate} onChange={(e) => setLineItem((l) => ({ ...l, expenseDate: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary w-full" disabled={!lineItem.category || !lineItem.amount || !lineItem.expenseDate || addItemMut.isPending} onClick={() => addItemMut.mutate()}>
              ➕ Add Item
            </button>
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="font-semibold mb-4">Expense Summary</h3>
            {claim?.lineItems?.length ? (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  {claim.lineItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between" style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div className="text-sm font-medium">{item.category.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-muted">{item.description}</div>
                        {item.isPolicyFlagged && <div className="text-xs" style={{ color: 'var(--warning)' }}>⚠️ {item.flagReason}</div>}
                      </div>
                      <div className="font-semibold" style={{ color: item.isPolicyFlagged ? 'var(--warning)' : 'var(--text-primary)' }}>
                        ₹{Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between" style={{ padding: '0.75rem 0', borderTop: '2px solid var(--border)' }}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">₹{Number(claim.totalAmount).toLocaleString()}</span>
                </div>
                <button className="btn btn-primary w-full mt-4" onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
                  {submitMut.isPending ? 'Submitting...' : '🚀 Submit for Review'}
                </button>
              </>
            ) : (
              <div className="empty-state">
                <p>📋</p>
                <h3>No items added yet</h3>
                <p className="text-sm">Add your expense items on the left</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
