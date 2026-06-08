import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function KPIDashboard() {
  const { data: kpi, isLoading } = useQuery({
    queryKey: ['kpi-summary'],
    queryFn: () => api.get('/dashboard/kpi').then((r) => r.data),
  })
  const { data: spendData } = useQuery({
    queryKey: ['spend-by-dept'],
    queryFn: () => api.get('/reports/spend-by-department').then((r) => r.data),
  })

  if (isLoading) return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>KPI Dashboard</h1></div></div>
      <div className="kpi-grid">{Array(6).fill(0).map((_,i) => <div key={i} className="skeleton kpi-card" style={{ height: 120 }} />)}</div>
    </div>
  )

  const kpiItems = [
    { label: 'Total Employees', value: kpi?.users?.total || 0, color: 'primary', icon: '👥', change: `${kpi?.users?.adoptionRate || 0}% adoption` },
    { label: 'Travel Requests', value: kpi?.travelRequests?.total || 0, color: 'accent', icon: '✈️', change: `${kpi?.travelRequests?.pending || 0} pending` },
    { label: 'Expense Claims', value: kpi?.expenseClaims?.total || 0, color: 'warning', icon: '💳', change: `${kpi?.expenseClaims?.flagged || 0} flagged` },
    { label: 'Compliance Rate', value: `${kpi?.expenseClaims?.complianceRate || 0}%`, color: 'success', icon: '📋', change: 'Policy adherence' },
    { label: 'Total Spend', value: `₹${((kpi?.financials?.totalSpend || 0)/1000).toFixed(0)}K`, color: 'danger', icon: '💰', change: 'Claimed expenses' },
    { label: 'Reimbursed', value: `₹${((kpi?.financials?.totalReimbursed || 0)/1000).toFixed(0)}K`, color: 'primary', icon: '✅', change: 'Paid out' },
  ]

  const statusData = [
    { name: 'Approved', value: kpi?.travelRequests?.approved || 0 },
    { name: 'Pending', value: kpi?.travelRequests?.pending || 0 },
    { name: 'Other', value: Math.max(0, (kpi?.travelRequests?.total || 0) - (kpi?.travelRequests?.approved || 0) - (kpi?.travelRequests?.pending || 0)) },
  ]

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>KPI Dashboard</h1>
          <p>Real-time system metrics and performance indicators</p>
        </div>
        <div className="badge badge-approved" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          🔴 Live
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpiItems.map((kpi) => (
          <div key={kpi.label} className={`kpi-card ${kpi.color}`}>
            <div className="kpi-label">{kpi.icon} {kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-change">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
        {/* Spend by Department Bar Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">💰 Spend by Department</h3>
          {spendData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Spend']}
                />
                <Bar dataKey="totalSpend" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><h3>No data yet</h3><p className="text-sm">Submit expense claims to see departmental spend</p></div>
          )}
        </div>

        {/* Travel Request Status Pie */}
        <div className="card">
          <h3 className="font-semibold mb-4">✈️ Travel Request Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="card">
        <h3 className="font-semibold mb-4">🎯 KPI Targets vs Actuals</h3>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Adoption Rate', target: 95, actual: kpi?.kpis?.adoptionRate || 0, color: '#6366f1' },
            { label: 'Compliance Rate', target: 98, actual: kpi?.kpis?.complianceRate || 0, color: '#10b981' },
            { label: 'Digital Submission', target: 100, actual: 100, color: '#06b6d4' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.actual >= item.target ? 'var(--success)' : 'var(--warning)' }}>
                  {item.actual}% / {item.target}%
                </span>
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (item.actual / item.target) * 100)}%`, background: item.color, height: '100%', borderRadius: 999, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
