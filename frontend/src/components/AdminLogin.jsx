import React, { useContext, useEffect, useMemo, useState } from 'react'
import './Login.css'
import { AuthContext, LOGOUT_REASON_KEY } from '../auth/AuthProvider'

const statusFromReason = reason => {
  switch (reason) {
    case 'expired':
      return { tone: 'warning', title: 'Session expired', message: 'You were signed out after 30 minutes of inactivity. Please log in again to continue.' }
    case 'invalid-session':
      return { tone: 'error', title: 'Session ended on the server', message: 'Your previous session was closed. Re-enter your credentials to regain access.' }
    case 'manual':
      return { tone: 'info', title: 'Signed out successfully', message: 'You logged out of your admin workspace.' }
    case 'conflict':
      return { tone: 'info', title: 'Another session detected', message: 'You tried to sign in from multiple tabs. Finish the previous session or continue here.' }
    default:
      return null
  }
}

const AdminLogin = () => {
  const { login } = useContext(AuthContext)
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    try {
      const reason = localStorage.getItem(LOGOUT_REASON_KEY)
      if (reason) {
        const derived = statusFromReason(reason)
        if (derived) setStatus(derived)
        localStorage.removeItem(LOGOUT_REASON_KEY)
      }
    } catch (err) {
      // ignore hydration issues
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminId.trim(), password })
      })
      const payload = await res.json().catch(() => ({}))
      if (res.ok && payload?.token) {
        login(payload.token, payload.user)
        setStatus({ tone: 'success', title: 'Welcome back', message: 'Redirecting you to the dashboard…' })
        setTimeout(() => { window.location.hash = '#/' }, 350)
      } else if (res.status === 409) {
        setStatus({
          tone: 'warning',
          title: 'Active session detected',
          message: 'You are already signed in on another browser. Log out there or continue here.'
        })
      } else {
        setError(payload?.error || 'Invalid admin ID or password. Please try again.')
      }
    } catch (err) {
      setError('Unable to connect to the server. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusIcon = useMemo(() => {
    if (!status) return null
    const map = {
      success: '✅',
      warning: '⚠️',
      error: '⛔️',
      info: 'ℹ️'
    }
    return map[status.tone] || 'ℹ️'
  }, [status])

  return (
    <section className="admin-auth-landing">
      <div className="admin-auth-card compact">
        <div className="admin-auth-visual minimal">
          <span className="badge">Inventory platform</span>
          <h2>Secure admin access</h2>
          <p>Log in with your administrator credentials to review and manage customers, orders, suppliers, and expenses.</p>
        </div>

        <div className="admin-auth-panel">
          <div className="panel-heading">
            <span className="pill">Admin access</span>
            <h1>Login as an Admin User</h1>
            <p className="panel-subtitle">Use your company email to access the registration and inventory workspace.</p>
          </div>

          {status && (
            <div className={`session-alert session-alert--${status.tone}`}>
              <span className="session-alert__icon" aria-hidden="true">{statusIcon}</span>
              <div>
                <strong>{status.title}</strong>
                <p>{status.message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="session-alert session-alert--error">
              <span className="session-alert__icon" aria-hidden="true">⛔️</span>
              <div>
                <strong>Unable to sign in</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form className="admin-auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-field__label">Admin email</span>
              <span className="auth-input">
                <span className="auth-input__icon" aria-hidden="true">👤</span>
                <input
                  type="email"
                  name="adminId"
                  placeholder="jill.hop@xyz.com"
                  autoComplete="username"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Password</span>
              <span className="auth-input">
                <span className="auth-input__icon" aria-hidden="true">🔒</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </span>
            </label>

            <div className="form-actions">
              <button type="submit" className="auth-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Log in'}
              </button>
            </div>
          </form>

          <div className="auth-links">
            <a href="mailto:support@inventory.local?subject=Password%20reset%20request">Forgot your password?</a>
            <a href="mailto:support@inventory.local?subject=Need%20help%20signing%20in">Get help signing in</a>
          </div>

          <div className="auth-footer">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => window.location.assign('mailto:security@inventory.local?subject=Admin%20access%20request')}
            >
              Request new admin access
            </button>
            <p className="policy-text">By logging in you agree to the <a href="#/terms">Terms of use</a> and <a href="#/privacy">Privacy policy</a>.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminLogin
