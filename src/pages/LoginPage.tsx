import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { firstFieldErrors } from '../api/client'
import { Alert, Field } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError(null)
    try {
      const user = await login(email.trim(), password)
      navigate(from ?? (user.role === 'admin' ? '/admin/bookings' : '/katalog'), { replace: true })
    } catch (error) {
      setErrors(firstFieldErrors(error))
      if (!Object.keys(firstFieldErrors(error)).length && error instanceof Error) {
        setFormError(error.message)
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Masuk</h1>
        <p className="muted">Masuk untuk menyewa alat camping favoritmu.</p>

        {from && (
          <Alert kind="info">Silakan masuk terlebih dahulu untuk melanjutkan.</Alert>
        )}
        {formError && <Alert kind="error">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  )
}
