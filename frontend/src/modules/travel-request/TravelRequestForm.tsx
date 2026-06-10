import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PURPOSES = ['CLIENT_ENGAGEMENT', 'AUDIT', 'TRAINING', 'CONFERENCE', 'INTERNAL_MEETING', 'SITE_VISIT', 'OTHER']

function Field({ label, value, onChange, type = 'text', required = false, ...props }: any) {
  return (
    <div className="form-group">
      <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
      <input
        type={type}
        className="form-control"
        value={value || ''}
        onChange={onChange}
        required={required}
        {...props}
      />
    </div>
  )
}

export default function TravelRequestForm() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    destination: '', origin: '', purpose: '', purposeDescription: '',
    departureDate: '', returnDate: '', estimatedCost: '', advanceRequired: false, advanceAmount: '', notes: '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/travel-requests', data),
    onSuccess: () => {
      toast.success('Travel request created successfully!')
      qc.invalidateQueries({ queryKey: ['my-travel-requests'] })
      navigate('/travel-requests')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create request'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      estimatedCost: form.estimatedCost === '' ? 0 : Number(form.estimatedCost),
      advanceAmount: form.advanceRequired && form.advanceAmount !== '' ? Number(form.advanceAmount) : 0,
    }
    mutation.mutate(payload)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>New Travel Request</h1>
          <p>Submit a travel request for manager approval</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          {/* Trip Details */}
          <h3 className="font-semibold mb-4" style={{ color: 'var(--primary-light)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trip Details</h3>
          <div className="form-grid">
            <Field
              label="Origin City"
              value={form.origin}
              onChange={(e: any) => setForm((f) => ({ ...f, origin: e.target.value }))}
              required
              placeholder="e.g. Mumbai"
            />
            <Field
              label="Destination City"
              value={form.destination}
              onChange={(e: any) => setForm((f) => ({ ...f, destination: e.target.value }))}
              required
              placeholder="e.g. Delhi"
            />
          </div>
          <div className="form-grid">
            <Field
              label="Departure Date"
              value={form.departureDate}
              onChange={(e: any) => setForm((f) => ({ ...f, departureDate: e.target.value }))}
              type="date"
              required
            />
            <Field
              label="Return Date"
              value={form.returnDate}
              onChange={(e: any) => setForm((f) => ({ ...f, returnDate: e.target.value }))}
              type="date"
              required
            />
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label className="form-label required">Travel Purpose</label>
            <select className="form-control" value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} required>
              <option value="">Select purpose...</option>
              {PURPOSES.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Purpose Description</label>
            <textarea className="form-control" rows={3} placeholder="Describe the business purpose of this trip..." value={form.purposeDescription} onChange={(e) => setForm((f) => ({ ...f, purposeDescription: e.target.value }))} />
          </div>

          {/* Financials */}
          <h3 className="font-semibold mb-4 mt-4" style={{ color: 'var(--primary-light)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Details</h3>
          <div className="form-grid">
            <Field
              label="Estimated Total Cost (₹)"
              value={form.estimatedCost}
              onChange={(e: any) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
              type="number"
              required
              placeholder="0"
              min="0"
            />
            <div className="form-group">
              <label className="form-label">Advance Required</label>
              <div className="flex items-center gap-2" style={{ height: 40, paddingTop: '0.5rem' }}>
                <input type="checkbox" id="advanceRequired" checked={form.advanceRequired} onChange={(e) => setForm((f) => ({ ...f, advanceRequired: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                <label htmlFor="advanceRequired" style={{ cursor: 'pointer' }}>I need a travel advance</label>
              </div>
            </div>
          </div>
          {form.advanceRequired && (
            <Field
              label="Advance Amount (₹)"
              value={form.advanceAmount}
              onChange={(e: any) => setForm((f) => ({ ...f, advanceAmount: e.target.value }))}
              type="number"
              placeholder="0"
              min="0"
            />
          )}

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea className="form-control" rows={2} placeholder="Any additional information..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="divider" />
          <div className="flex gap-3 justify-between">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : '💾 Create Travel Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
