import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function PolicyRuleList() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', ruleType: '', category: '', limitAmount: '', scope: 'ALL', isActive: true })

  const { data: rules, isLoading } = useQuery({
    queryKey: ['policy-rules'],
    queryFn: () => api.get('/policy-rules').then((r) => r.data),
  })

  const createMut = useMutation({
    mutationFn: () => api.post('/policy-rules', form),
    onSuccess: () => { toast.success('Policy rule created!'); qc.invalidateQueries({ queryKey: ['policy-rules'] }); setModal(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/policy-rules/${id}/toggle`, { isActive }),
    onSuccess: () => { toast.success('Rule updated'); qc.invalidateQueries({ queryKey: ['policy-rules'] }) },
  })

  const RULE_TYPES = ['AMOUNT_LIMIT', 'DAILY_LIMIT', 'ADVANCE_NOTICE_DAYS', 'RECEIPT_REQUIRED', 'DUPLICATE_DETECTION']
  const CATEGORIES = ['FLIGHTS', 'HOTEL', 'MEALS', 'LOCAL_TRANSPORT', 'CONFERENCE_FEE', 'VISA', 'MISCELLANEOUS']

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Policy Rules</h1>
          <p>Configure expense policy rules and spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>➕ Add Rule</button>
      </div>

      <div className="card">
        {isLoading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Rule Name</th><th>Type</th><th>Category</th><th>Limit</th><th>Scope</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {rules?.map((rule: any) => (
                  <tr key={rule.id}>
                    <td>
                      <div className="font-medium text-sm">{rule.name}</div>
                      {rule.description && <div className="text-xs text-muted">{rule.description}</div>}
                    </td>
                    <td><span className="badge badge-submitted" style={{ fontSize: '0.65rem' }}>{rule.ruleType?.replace(/_/g, ' ')}</span></td>
                    <td className="text-sm text-muted">{rule.category || 'All Categories'}</td>
                    <td className="font-semibold">{rule.limitAmount ? `₹${Number(rule.limitAmount).toLocaleString()}` : rule.limitDays ? `${rule.limitDays} days` : '—'}</td>
                    <td className="text-sm text-muted">{rule.scope}</td>
                    <td><span className={`badge ${rule.isActive ? 'badge-approved' : 'badge-cancelled'}`}>{rule.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button
                        className={`btn btn-sm ${rule.isActive ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggleMut.mutate({ id: rule.id, isActive: !rule.isActive })}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">➕ New Policy Rule</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-group"><label className="form-label required">Rule Name</label><input className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Rule Type</label>
                <select className="form-control" value={form.ruleType} onChange={(e) => setForm((f) => ({ ...f, ruleType: e.target.value }))}>
                  <option value="">Select type...</option>
                  {RULE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Limit Amount (₹)</label><input type="number" className="form-control" value={form.limitAmount} onChange={(e) => setForm((f) => ({ ...f, limitAmount: e.target.value }))} /></div>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!form.name || !form.ruleType || createMut.isPending} onClick={() => createMut.mutate()}>
                {createMut.isPending ? 'Creating...' : '✓ Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
