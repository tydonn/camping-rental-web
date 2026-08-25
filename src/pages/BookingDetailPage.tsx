import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getBooking, reportPayment } from '../api/bookings'
import { firstFieldErrors, toApiError } from '../api/client'
import {
  Alert,
  BookingBadge,
  Field,
  PageLoader,
  PaymentBadge,
  Spinner,
} from '../components/ui'
import { useApiQuery } from '../hooks/useApiQuery'
import type { Booking, Payment, PaymentMethod } from '../types'
import { formatDateTime, formatIDR, formatRange } from '../utils/format'
import { paymentMethodLabels } from '../utils/constants'

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

  if (query.loadingFirst) return <PageLoader label="Memuat detail booking..." />
  if (query.error || !booking) {
    return (
      <div className="empty-state">
        <h2>Booking tidak ditemukan</h2>
        <p>{query.error ?? 'Booking tidak tersedia atau bukan milik Anda.'}</p>
        <Link to="/booking/riwayat" className="btn btn-primary">
          Ke Riwayat Booking
        </Link>
      </div>
    )
  }

  const activeStepIndex =
    booking.status === 'cancelled'
      ? -1
      : timelineSteps.findIndex((step) => step.status === booking.status)

  return (
    <div className="booking-detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/booking/riwayat">Riwayat Booking</Link> <span>/</span>{' '}
        <span>Booking #{booking.id}</span>
      </nav>

      {justCreated && (
        <Alert kind="success">
          Booking berhasil dibuat! Silakan lakukan pembayaran lalu laporkan di bawah ini.
        </Alert>
      )}

      <div className="card booking-summary-card">
        <div className="booking-summary-head">
          <div>
            <h1>Booking #{booking.id}</h1>
            <p className="muted">Dibuat {formatDateTime(booking.created_at)}</p>
          </div>
          <BookingBadge status={booking.status} />
        </div>

        <ol className="timeline" aria-label="Status pemesanan">
          {timelineSteps.map((step, index) => (
            <li
              key={step.status}
              className={`timeline-step ${index <= activeStepIndex ? 'done' : ''} ${
                index === activeStepIndex ? 'current' : ''
              }`}
            >
              <span className="timeline-dot" aria-hidden="true" />
              <span className="timeline-label">{step.label}</span>
            </li>
          ))}
        </ol>

        <dl className="availability-meta">
          <div>
            <dt>Tanggal sewa</dt>
            <dd>{formatRange(booking.start_date, booking.end_date)}</dd>
          </div>
          <div>
            <dt>Durasi</dt>
            <dd>{booking.duration_days} hari</dd>
          </div>
          <div>
            <dt>Total biaya</dt>
            <dd>{formatIDR(booking.total_amount)}</dd>
          </div>
        </dl>

        <table className="table">
          <thead>
            <tr>
              <th scope="col">Alat</th>
              <th scope="col">Kategori</th>
              <th scope="col">Jumlah</th>
              <th scope="col" className="text-right">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {booking.items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.equipment ? (
                    <Link to={`/katalog/${item.equipment.id}`}>{item.equipment.name}</Link>
                  ) : (
                    `Alat #${item.equipment_id}`
                  )}
                </td>
                <td>{item.equipment?.category?.name ?? '-'}</td>
                <td>{item.quantity} unit</td>
                <td className="text-right">{formatIDR(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {booking.status === 'pending' && (
        <div className="card payment-section">
          <h2>Pembayaran</h2>
          <p className="muted">
            Lakukan pembayaran sesuai total tagihan, kemudian laporkan melalui formulir berikut.
            Admin akan memverifikasi pembayaran Anda.
          </p>

          {paymentSuccess && <Alert kind="success">{paymentSuccess}</Alert>}
          {paymentError && <Alert kind="error">{paymentError}</Alert>}

          <form onSubmit={handlePaymentSubmit}>
            <Field label="Metode pembayaran" htmlFor="payment-method">
              <select
                id="payment-method"
                className="input"
                value={method}
                onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              >
                {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((value) => (
                  <option key={value} value={value}>
                    {paymentMethodLabels[value]}
                  </option>
                ))}
              </select>
            </Field>
            {method === 'transfer' && (
              <Alert kind="info">
                Transfer ke BCA 1234567890 a.n. Camping Rental senilai{' '}
                <strong>{formatIDR(booking.total_amount)}</strong>. Cantumkan nomor booking #
                {booking.id} pada catatan.
              </Alert>
            )}
            {method === 'qris' && (
              <Alert kind="info">
                Scan QRIS yang tersedia di kantor kami atau hubungi admin untuk menerima kode QRIS
                senilai <strong>{formatIDR(booking.total_amount)}</strong>.
              </Alert>
            )}
            {method === 'cash' && (
              <Alert kind="info">
                Lakukan pembayaran tunai di lokasi pengambilan alat senilai{' '}
                <strong>{formatIDR(booking.total_amount)}</strong>.
              </Alert>
            )}
            <Field
              label="Catatan (opsional)"
              htmlFor="payment-note"
              hint="mis. nama bank pengirim, waktu transfer, atau nomor referensi."
            >
              <textarea
                id="payment-note"
                className="input"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={1000}
              />
            </Field>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? (
                <Spinner size={16} />
              ) : (
                `Laporkan Pembayaran ${formatIDR(booking.total_amount)}`
              )}
            </button>
          </form>

          {reportedPayments.length > 0 && (
            <div className="reported-payments">
              <h3>Laporan pembayaran terkirim</h3>
              <ul>
                {reportedPayments.map((payment) => (
                  <li key={payment.id}>
                    <span>
                      #{payment.id} &middot; {paymentMethodLabels[payment.method]} &middot;{' '}
                      {payment.paid_at ? formatDateTime(payment.paid_at) : '-'}
                    </span>
                    <PaymentBadge status={payment.status} />
                  </li>
                ))}
              </ul>
              <p className="field-hint">
                Halaman ini otomatis diperbarui setiap 15 detik saat menunggu verifikasi.
              </p>
            </div>
          )}
        </div>
      )}

      {booking.status === 'paid' && (
        <div className="card">
          <h2>Pembayaran Terverifikasi</h2>
          <p className="muted">
            Pembayaran Anda telah dikonfirmasi admin. Booking akan diproses pada jadwal pengambilan;
            halaman ini diperbarui otomatis setiap 15 detik.
          </p>
        </div>
      )}

      {(booking.status === 'confirmed' || booking.status === 'completed') && (
        <div className="card">
          <h2>{booking.status === 'confirmed' ? 'Alat Sedang Dipinjam' : 'Sewa Selesai'}</h2>
          <p className="muted">
            {booking.status === 'confirmed'
              ? 'Selamat berkemah! Kembalikan alat sesuai jadwal agar tidak ada biaya tambahan.'
              : 'Terima kasih telah menggunakan layanan Camping Rental.'}
          </p>
        </div>
      )}

      {booking.status === 'cancelled' && <Alert kind="warning">Booking ini telah dibatalkan.</Alert>}
    </div>
  )
}
