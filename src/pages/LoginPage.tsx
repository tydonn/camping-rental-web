import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TentIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { firstFieldErrors } from '@/api/client'
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
      const fieldMap = firstFieldErrors(error)
      setErrors(fieldMap)
      if (!Object.keys(fieldMap).length && error instanceof Error) {
        setFormError(error.message)
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
          <CardTitle className="text-xl">Masuk ke Camping Rental</CardTitle>
          <CardDescription>Masuk untuk menyewa alat camping favoritmu.</CardDescription>
        </CardHeader>
        <CardContent>
          {from && (
            <Alert variant="info" className="mb-4">
              <AlertDescription>Silakan masuk terlebih dahulu untuk melanjutkan.</AlertDescription>
            </Alert>
          )}
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
