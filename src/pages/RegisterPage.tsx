import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TentIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { firstFieldErrors, toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field } from '@/components/shared/form-field'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Konfirmasi password tidak cocok.' })
      return
    }
    const phoneNumber = form.phone_number.trim()
    if (phoneNumber && !/^[0-9\s()+-]{1,20}$/.test(phoneNumber)) {
      setErrors({
        phone_number: 'Nomor HP hanya boleh berisi angka, spasi, +, -, ( ) dan maksimal 20 karakter.',
      })
      return
    }
    setSubmitting(true)
    setErrors({})
    setFormError(null)
    try {
      await register({
        ...form,
        email: form.email.trim(),
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
      })
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
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span className="mx-auto mb-1 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <TentIcon className="size-5.5" />
          </span>
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <CardDescription>Daftar sebagai pelanggan untuk mulai menyewa alat.</CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Nama Lengkap" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Nama Anda"
                value={form.name}
                onChange={update('name')}
                required
              />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={update('email')}
                required
              />
            </Field>
            <Field
              label="Nomor HP (opsional)"
              htmlFor="phone_number"
              error={errors.phone_number}
              hint="mis. 0812-3456-7890, maksimal 20 karakter."
            >
              <Input
                id="phone_number"
                type="tel"
                autoComplete="tel"
                placeholder="081234567890"
                value={form.phone_number}
                onChange={update('phone_number')}
                maxLength={20}
              />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              error={errors.password}
              hint="Minimal 8 karakter."
            >
              <Input
                id="password"
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
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={update('password_confirmation')}
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
