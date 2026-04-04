import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { AuthState } from '../store/authStore'

const SignupPage = () => {
  const navigate = useNavigate()
  const signup = useAuthStore((state: AuthState) => state.signup)
  const status = useAuthStore((state: AuthState) => state.status)
  const error = useAuthStore((state: AuthState) => state.error)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      setFormError('Please accept the terms to continue.')
      return
    }

    try {
      await signup({ name, email, password })
      navigate('/dashboard')
    } catch (submitError) {
      if (submitError instanceof Error) {
        setFormError(submitError.message)
      } else {
        setFormError('Unable to create your account. Please try again.')
      }
    }
  }

  return (
    <section className="auth-card" aria-label="Sign up">
      <div className="auth-header">
        <p className="eyebrow">Start free</p>
        <h1>Create your HabitTrack account.</h1>
        <p className="section-sub">Build consistency with gentle guidance.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          Username
          <input
            className="input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          Confirm password
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          I agree to the terms and privacy policy
        </label>
        {(formError || error) && (
          <p className="form-error">{formError ?? error}</p>
        )}
        <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link className="link" to="/login">Log in</Link>
      </p>
    </section>
  )
}

export default SignupPage
