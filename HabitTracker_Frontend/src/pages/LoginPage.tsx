import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { AuthState } from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state: AuthState) => state.login)
  const status = useAuthStore((state: AuthState) => state.status)
  const error = useAuthStore((state: AuthState) => state.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    try {
      await login({ email, password, remember })
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? '/dashboard'
      navigate(redirectTo)
    } catch (submitError) {
      if (submitError instanceof Error) {
        setFormError(submitError.message)
      } else {
        setFormError('Unable to login. Please try again.')
      }
    }
  }

  return (
    <section className="auth-card" aria-label="Login">
      <div className="auth-header">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to continue.</h1>
        <p className="section-sub">Pick up where you left off.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          Email
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          Password
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <div className="form-row">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <button className="link" type="button">
            Forgot password?
          </button>
        </div>
        {(formError || error) && (
          <p className="form-error">{formError ?? error}</p>
        )}
        <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <div className="social-row">
        <button className="btn btn-secondary" type="button">
          Google
        </button>
        <button className="btn btn-secondary" type="button">
          GitHub
        </button>
      </div>
      <p className="auth-switch">
        New here? <Link className="link" to="/signup">Create account</Link>
      </p>
    </section>
  )
}

export default LoginPage
