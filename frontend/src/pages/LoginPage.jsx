import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { LoadingState } from '../components/ui/LoadingState'
import { StatusMessage } from '../components/ui/StatusMessage'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('Admin Login')

  const navigate = useNavigate()
  const location = useLocation()
  const { authenticated, loading, login } = useAuth()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  if (loading) {
    return <LoadingState label="Preparing login" />
  }

  if (authenticated) {
    return <Navigate replace to="/dashboard" />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      await login(credentials)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container page-stack page-stack--narrow">
      <section className="login-card">
        <div className="section-intro section-intro--centered">
          <span className="section-intro__badge">Administrator Login</span>
          <h1>Sign in to manage portal content</h1>
          <p>Teacher tools, uploads, and the question paper editor live here.</p>
        </div>

        <StatusMessage tone="error">{message}</StatusMessage>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="username">
            <span>Username</span>
            <input
              autoComplete="username"
              id="username"
              name="username"
              onChange={(event) =>
                setCredentials((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="Enter username"
              required
              type="text"
              value={credentials.username}
            />
          </label>

          <label className="form-field" htmlFor="password">
            <span>Password</span>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={(event) =>
                setCredentials((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Enter password"
              required
              type="password"
              value={credentials.password}
            />
          </label>

          <button className="button button--full" disabled={submitting} type="submit">
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  )
}
