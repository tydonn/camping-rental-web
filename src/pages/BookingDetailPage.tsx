import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  HandCoinsIcon,
  InfoIcon,
  PackageCheckIcon,
  SendIcon,
} from 'lucide-react'
import { getBooking, reportPayment } from '@/api/bookings'
import { firstFieldErrors, toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field } from '@/components/shared/form-field'
import { EmptyState } from '@/components/shared/empty-state'
import { BookingBadge, PaymentBadge } from '@/components/shared/status-badges'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { Booking, Payment, PaymentMethod } from '@/types'
import { formatDateTime, formatIDR, formatRange } from '@/utils/format'
import { paymentMethodLabels } from '@/utils/constants'

const REPORTED_PAYMENTS_KEY = 'camping-rental-reported-payments'

function loadReportedPayments(bookingId: number): Payment[] {
  try {
    const raw = localStorage.getItem(REPORTED_PAYMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, Payment[]>
    return parsed[String(bookingId)] ?? []
  } catch {
    return []
  }
}

function saveReportedPayment(bookingId: number, payment: Payment) {
  const existing = loadReportedPayments(bookingId)
  localStorage.setItem(
    REPORTED_PAYMENTS_KEY,
    JSON.stringify({ [String(bookingId)]: [...existing, payment] }),
  )
}

const timelineSteps = [
  { status: 'pending', label: 'Menunggu Pembayaran' },
  { status: 'paid', label: 'Dibayar' },
  { status: 'confirmed', label: 'Diambil / Dipinjam' },
  { status: 'completed', label: 'Selesai' },
] as const

export default function BookingDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const justCreated = Boolean((location.state as { justCreated?: boolean } | null)?.justCreated)

  const [tick, setTick] = useState(0)
  const query = useApiQuery<Booking>(() => getBooking(id ?? ''), [id, tick])
  const booking = query.data

  const [method, setMethod] = useState<PaymentMethod>('transfer')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const reportedPayments = useMemo(
    () => (id ? loadReportedPayments(Number(id)) : []),
    // tick intentionally included: recompute after each refresh so new reports appear
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, tick],
  )

  useEffect(() => {
    if (!booking || !['pending', 'paid'].includes(booking.status)) return
    const interval = setInterval(() => setTick((value) => value + 1), 15_000)
    return () => clearInterval(interval)
  }, [booking])

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!booking) return
    setSubmitting(true)
    setPaymentError(null)
    setPaymentSuccess(null)
    try {
      const payment = await reportPayment(booking.id, {
        method,
        note: note.trim() || undefined,
      })
      saveReportedPayment(booking.id, payment)
      setPaymentSuccess(
        `Laporan pembayaran #${payment.id} terkirim. Menunggu verifikasi admin (1x24 jam).`,
      )
      setNote('')
      setTick((value) => value + 1)
    } catch (error) {
      const fieldMap = firstFieldErrors(error)
      setPaymentError(
        Object.values(fieldMap)[0] ?? toApiError(error).message ?? 'Gagal mengirim laporan.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (query.loadingFirst) {
    return (
      <div className="space-y-5">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (query.error || !booking) {
    return (
      <EmptyState
        title="Booking tidak ditemukan"
        description={query.error ?? 'Booking tidak tersedia atau bukan milik Anda.'}
        action={
          <Button asChild className="mt-3">
            <Link to="/booking/riwayat">Ke Riwayat Booking</Link>
          </Button>
        }
      />
    )
  }

  const activeStepIndex =
    booking.status === 'cancelled'
      ? -1
      : timelineSteps.findIndex((step) => step.status === booking.status)

  return (
    <div className="space-y-5">
      <nav
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/booking/riwayat" className="hover:text-foreground hover:underline">
          Riwayat Booking
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Booking #{booking.id}</span>
      </nav>

      {justCreated && (
        <Alert variant="success">
          <CircleCheckIcon />
          <AlertDescription>
            Booking berhasil dibuat! Silakan lakukan pembayaran lalu laporkan di bawah ini.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Booking #{booking.id}</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Dibuat {formatDateTime(booking.created_at)}
            </p>
          </div>
          <BookingBadge status={booking.status} />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timeline */}
          <ol
            className={`flex gap-3 max-md:flex-col ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}
            aria-label="Status pemesanan"
          >
            {timelineSteps.map((step, index) => {
              const done = index <= activeStepIndex && booking.status !== 'cancelled'
              const current = index === activeStepIndex
              return (
                <li key={step.status} className="flex items-center gap-2.5 max-md:flex-row">
                  <span
                    aria-hidden="true"
                    className={[
                      'grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                      done
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-card text-transparent',
                      current ? 'ring-4 ring-primary/20' : '',
                    ].join(' ')}
                  >
                    <CheckIcon className="size-3.5" />
                  </span>
                  <span
                    className={[
                      'text-xs font-semibold sm:text-sm',
                      done ? 'text-foreground' : 'text-muted-foreground',
                      index < timelineSteps.length - 1 ? '' : '',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                  {index < timelineSteps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`hidden h-0.5 w-full min-w-10 flex-1 sm:block ${
                        index < activeStepIndex ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </li>
              )
            })}
          </ol>

          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-muted px-3 py-2">
              <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Tanggal sewa
              </dt>
              <dd className="font-bold">{formatRange(booking.start_date, booking.end_date)}</dd>
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
              <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Durasi
              </dt>
              <dd className="font-bold">{booking.duration_days} hari</dd>
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
              <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Total biaya
              </dt>
              <dd className="font-bold">{formatIDR(booking.total_amount)}</dd>
            </div>
          </dl>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Alat</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Kategori</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Jumlah</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {booking.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 font-medium">
                      {item.equipment ? (
                        <Link to={`/katalog/${item.equipment.id}`} className="hover:text-primary hover:underline">
                          {item.equipment.name}
                        </Link>
                      ) : (
                        `Alat #${item.equipment_id}`
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {item.equipment?.category?.name ?? '-'}
                    </td>
                    <td className="px-4 py-2.5">{item.quantity} unit</td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      {formatIDR(item.subtotal)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40">
                  <td colSpan={3} className="px-4 py-2.5 text-right font-bold">Total</td>
                  <td className="px-4 py-2.5 text-right font-extrabold text-primary">
                    {formatIDR(booking.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {booking.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoinsIcon className="size-5 text-primary" /> Pembayaran
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Lakukan pembayaran sesuai total tagihan, kemudian laporkan melalui formulir berikut.
              Admin akan memverifikasi pembayaran Anda.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentSuccess && (
              <Alert variant="success">
                <CircleCheckIcon />
                <AlertDescription>{paymentSuccess}</AlertDescription>
              </Alert>
            )}
            {paymentError && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{paymentError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <Field label="Metode pembayaran" htmlFor="payment-method">
                <Select
                  value={method}
                  onValueChange={(value) => setMethod(value as PaymentMethod)}
                >
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((value) => (
                      <SelectItem key={value} value={value}>
                        {paymentMethodLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {method === 'transfer' && (
                <Alert variant="info">
                  <InfoIcon />
                  <AlertDescription>
                    Transfer ke BCA 1234567890 a.n. Camping Rental senilai{' '}
                    <strong>{formatIDR(booking.total_amount)}</strong>. Cantumkan nomor booking #
                    {booking.id} pada catatan.
                  </AlertDescription>
                </Alert>
              )}
              {method === 'qris' && (
                <Alert variant="info">
                  <InfoIcon />
                  <AlertDescription>
                    Scan QRIS yang tersedia di kantor kami atau hubungi admin untuk menerima kode
                    QRIS senilai <strong>{formatIDR(booking.total_amount)}</strong>.
                  </AlertDescription>
                </Alert>
              )}
              {method === 'cash' && (
                <Alert variant="info">
                  <InfoIcon />
                  <AlertDescription>
                    Lakukan pembayaran tunai di lokasi pengambilan alat senilai{' '}
                    <strong>{formatIDR(booking.total_amount)}</strong>.
                  </AlertDescription>
                </Alert>
              )}

              <Field
                label="Catatan (opsional)"
                htmlFor="payment-note"
                hint="mis. nama bank pengirim, waktu transfer, atau nomor referensi."
              >
                <Textarea
                  id="payment-note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={1000}
                />
              </Field>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <SendIcon data-icon="inline-start" />
                {submitting
                  ? 'Mengirim...'
                  : `Laporkan Pembayaran ${formatIDR(booking.total_amount)}`}
              </Button>
            </form>

            {reportedPayments.length > 0 && (
              <div className="rounded-lg border p-3.5">
                <h3 className="mb-2 text-sm font-bold">Laporan pembayaran terkirim</h3>
                <ul className="space-y-2">
                  {reportedPayments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm"
                    >
                      <span>
                        #{payment.id} &middot; {paymentMethodLabels[payment.method]} &middot;{' '}
                        {payment.paid_at ? formatDateTime(payment.paid_at) : '-'}
                      </span>
                      <PaymentBadge status={payment.status} />
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Halaman ini otomatis diperbarui setiap 15 detik saat menunggu verifikasi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {booking.status === 'paid' && (
        <Card>
          <CardContent className="flex items-start gap-3">
            <PackageCheckIcon className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="font-bold">Pembayaran Terverifikasi</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Pembayaran Anda telah dikonfirmasi admin. Booking akan diproses pada jadwal
                pengambilan; halaman ini diperbarui otomatis setiap 15 detik.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {(booking.status === 'confirmed' || booking.status === 'completed') && (
        <Alert variant={booking.status === 'confirmed' ? 'success' : 'default'}>
          <CircleCheckIcon />
          <AlertTitle>{booking.status === 'confirmed' ? 'Alat Sedang Dipinjam' : 'Sewa Selesai'}</AlertTitle>
          <AlertDescription>
            {booking.status === 'confirmed'
              ? 'Selamat berkemah! Kembalikan alat sesuai jadwal agar tidak ada biaya tambahan.'
              : 'Terima kasih telah menggunakan layanan Camping Rental.'}
          </AlertDescription>
        </Alert>
      )}

      {booking.status === 'cancelled' && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>Booking ini telah dibatalkan.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
