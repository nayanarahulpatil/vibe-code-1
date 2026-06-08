import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../services/api'

export default function ReportList() {
  const { data: spendByDept } = useQuery({ queryKey: ['rpt-spend-dept'], queryFn: () => api.get('/reports/spend-by-department').then((r) => r.data) })
  const { data: violations } = useQuery({ queryKey: ['rpt-violations'], queryFn: () => api.get('/reports/policy-violations').then((r) => r.data) })
  const { data: aging } = useQuery({ queryKey: ['rpt-aging'], queryFn: () => api.get('/reports/reimbursement-aging').then((r) => r.data) })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports</h1>
          <p>Operational analytics and financial reports</p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
        {/* Spend by Department */}
        <div className="card">
          <h3 className="font-semibold mb-4">💰 Travel Spend by Department (30 days)</h3>
          {spendByDept?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={spendByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Total Spend']} />
                <Bar dataKey="totalSpend" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><h3>No data available</h3></div>}
        </div>

        {/* Policy Violations */}
        <div className="card">
          <h3 className="font-semibold mb-4">⚠️ Policy Violations (30 days)</h3>
          {violations?.length ? (
            <div className="table-wrapper" style={{ maxHeight: 250, overflow: 'auto' }}>
              <table className="table">
                <thead><tr><th>Claim</th><th>Employee</th><th>Flagged Items</th></tr></thead>
                <tbody>
                  {violations.slice(0, 8).map((ec: any) => (
                    <tr key={ec.id}>
                      <td><code style={{ color: 'var(--warning)', fontSize: '0.75rem' }}>{ec.claimNumber}</code></td>
                      <td className="text-sm">{ec.employee?.firstName} {ec.employee?.lastName}</td>
                      <td><span className="badge badge-rejected">{ec.lineItems?.filter((li: any) => li.isPolicyFlagged).length} violations</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty-state"><h3>No violations found 🎉</h3><p className="text-sm">All expenses are compliant with policy</p></div>}
        </div>
      </div>

      {/* Reimbursement Aging */}
      <div className="card">
        <h3 className="font-semibold mb-4">⏱️ Reimbursement Aging — Approved Claims Awaiting Payment</h3>
        {aging?.length ? (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Claim #</th><th>Employee</th><th>Dept.</th><th>Amount</th><th>Approved On</th><th>Days Pending</th></tr></thead>
              <tbody>
                {aging.map((ec: any) => {
                  const daysPending = Math.floor((Date.now() - new Date(ec.approvedAt).getTime()) / 86400000)
                  return (
                    <tr key={ec.id}>
                      <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{ec.claimNumber}</code></td>
                      <td>{ec.employee?.firstName} {ec.employee?.lastName}</td>
                      <td className="text-muted text-sm">{ec.employee?.department}</td>
                      <td className="font-semibold">₹{Number(ec.approvedAmount || ec.totalAmount).toLocaleString()}</td>
                      <td className="text-sm">{ec.approvedAt ? new Date(ec.approvedAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className="badge" style={{ background: daysPending > 3 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: daysPending > 3 ? 'var(--danger)' : 'var(--success)', border: `1px solid ${daysPending > 3 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                          {daysPending} days
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state"><h3>No aging items</h3><p className="text-sm">All approved claims have been reimbursed</p></div>}
      </div>
    </div>
  )
}
