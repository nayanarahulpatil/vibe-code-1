import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', employeeId: '', department: '', designation: '', location: '', password: 'Temp@123' })

  const { data, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  })

  const createMut = useMutation({
    mutationFn: () => api.post('/users', form),
    onSuccess: () => { toast.success('User created!'); qc.invalidateQueries({ queryKey: ['all-users'] }); setModal(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const deactivateMut = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/deactivate`),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries({ queryKey: ['all-users'] }) },
  })

  const users = (data?.data || []).filter((u: any) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.department}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>User Management</h1>
          <p>Manage employee accounts and roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>➕ Add User</button>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <input className="form-control" placeholder="🔍 Search by name, email, or department..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {isLoading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Designation</th><th>Location</th><th>Roles</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                        <div>
                          <div className="text-sm font-medium">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.employeeId}</code></td>
                    <td className="text-sm">{u.department || '—'}</td>
                    <td className="text-sm text-muted">{u.designation || '—'}</td>
                    <td className="text-sm">{u.location || '—'}</td>
                    <td>
                      {u.roles?.map((r: any) => (
                        <span key={r.name} className="badge badge-submitted" style={{ marginRight: 4, fontSize: '0.65rem' }}>{r.name}</span>
                      ))}
                    </td>
                    <td><span className={`badge ${u.isActive ? 'badge-approved' : 'badge-cancelled'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      {u.isActive && <button className="btn btn-danger btn-sm" onClick={() => deactivateMut.mutate(u.id)}>Deactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">➕ Add New User</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label required">First Name</label><input className="form-control" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label required">Last Name</label><input className="form-control" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label required">Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label required">Employee ID</label><input className="form-control" value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-control" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.email || !form.firstName}>
                {createMut.isPending ? 'Creating...' : '✓ Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
