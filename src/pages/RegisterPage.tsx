import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { firstFieldErrors, toApiError } from '../api/client'
import { Alert, Field } from '../components/ui'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Konfirmasi password tidak cocok.' })
      return
    }
    setSubmitting(true)
    setErrors({})
    setFormError(null)
    try {
      await register({ ...form, email: form.email.trim() })
      navigate('/katalog', { replace: true })
    } catch (error) {
      const fieldMap = firstFieldErrors(error)
      setErrors(fieldMap)
      if (!Object.keys(fieldMap).length) {
        setFormError(toApiError(error).message)
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Daftar</h1>
        <p className="muted">Buat akun pelanggan untuk mulai menyewa alat.</p>

        {formError && <Alert kind="error">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Nama Lengkap" htmlFor="name" error={errors.name}>
            <input
              id="name"
              className="input"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              required
            />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} hint="Minimal 8 karakter.">
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
            />
          </Field>
          <Field
            label="Konfirmasi Password"
            htmlFor="password_confirmation"
            error={errors.password_confirmation}
          >
            <input
              id="password_confirmation"
              className="input"
              type="password"
              autoComplete="new-password"
              value={form.password_confirmation}
              onChange={update('password_confirmation')}
              required
            />
          </Field>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}
