import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { login, clearError } from './authSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.firstName}!`)
      navigate('/')
    }
  }

  const fillDemo = (role: string) => {
    const demos: Record<string, [string, string]> = {
      admin:      ['admin@tems.com',      'Admin@123'],
      employee:   ['employee@tems.com',   'Emp@123'],
      manager:    ['manager@tems.com',    'Mgr@123'],
      finance:    ['finance@tems.com',    'Fin@123'],
      hr:         ['hr@tems.com',         'Hr@123'],
      compliance: ['compliance@tems.com', 'Comp@123'],
      auditor:    ['auditor@tems.com',    'Aud@123'],
    }
    if (demos[role]) { setEmail(demos[role][0]); setPassword(demos[role][1]) }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-badge">T</div>
          <h1>TEMS</h1>
          <p>Enterprise Travel & Expense Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="form-error mb-4" style={{ fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Demo Quick Login */}
        <div className="divider" />
        <p className="text-xs text-muted mb-3" style={{ textAlign: 'center' }}>Quick demo login</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {['employee', 'manager', 'finance', 'admin', 'auditor', 'compliance'].map((role) => (
            <button
              key={role}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemo(role)}
              style={{ textTransform: 'capitalize', justifyContent: 'flex-start' }}
            >
              <span style={{ fontSize: '0.65rem', background: 'var(--bg-elevated)', padding: '0.1rem 0.4rem', borderRadius: 4, marginRight: '0.25rem' }}>
                {role === 'employee' ? '👤' : role === 'manager' ? '👔' : role === 'finance' ? '💰' : role === 'admin' ? '⚙️' : role === 'auditor' ? '🔍' : '📋'}
              </span>
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
