import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getEquipment } from '../api/catalog'
import { createBooking } from '../api/bookings'
import { firstFieldErrors, toApiError } from '../api/client'
import { Alert, PageLoader } from '../components/ui'
import { useApiQuery } from '../hooks/useApiQuery'
import { formatIDR, inclusiveDays } from '../utils/format'
import type { Equipment } from '../types'

interface CheckoutState {
  equipmentId: number
  quantity: number
  startDate: string
  endDate: string
}

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as CheckoutState | null

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const equipmentId = state?.equipmentId ?? null
  const detail = useApiQuery<Equipment | null>(
    async () => (equipmentId === null ? null : getEquipment(equipmentId)),
    [equipmentId],
  )
  const equipment = detail.data

  if (detail.loadingFirst && equipmentId !== null) {
    return <PageLoader label="Menyiapkan checkout..." />
  }

  if (!state || !equipment) {
    return (
      <div className="empty-state">
        <h2>Data booking tidak lengkap</h2>
        <p>Pilih alat dan rentang tanggal sewa terlebih dahulu dari halaman detail.</p>
        <Link to="/katalog" className="btn btn-primary">
          Ke Katalog
        </Link>
      </div>
    )
  }

  const days = inclusiveDays(state.startDate, state.endDate)
  const total = Number(equipment.price_per_day) * state.quantity * days

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const booking = await createBooking({
        start_date: state.startDate,
        end_date: state.endDate,
        items: [{ equipment_id: state.equipmentId, quantity: state.quantity }],
      })
      navigate(`/booking/riwayat/${booking.id}`, { state: { justCreated: true }, replace: true })
    } catch (err) {
      const mapped = firstFieldErrors(err)
      setFieldErrors(mapped)
      setError(toApiError(err).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout-page">
      <div className="page-heading">
        <h1>Checkout Booking</h1>
        <p className="muted">Periksa pesanan Anda sebelum membuat booking.</p>
      </div>

      {error && fieldErrors.items === undefined && <Alert kind="error">{error}</Alert>}

      <div className="checkout-layout">
        <form className="card checkout-form" onSubmit={handleSubmit}>
          <h2>Konfirmasi Booking</h2>
          <p className="muted">
            Setelah booking dibuat, Anda akan diarahkan ke halaman pembayaran untuk melaporkan
            pembayaran dan menunggu verifikasi admin.
          </p>
          {fieldErrors.start_date && <Alert kind="error">{fieldErrors.start_date}</Alert>}
          {fieldErrors.end_date && <Alert kind="error">{fieldErrors.end_date}</Alert>}
          {fieldErrors.items && <Alert kind="error">{fieldErrors.items}</Alert>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || days === 0}>
            {submitting ? 'Membuat booking...' : 'Buat Booking'}
          </button>
        </form>

        <aside className="card order-summary">
          <h2>Ringkasan Pesanan</h2>
          <div className="summary-item">
            <div>
              <strong>{equipment.name}</strong>
              {equipment.category && (
                <span className="chip">{equipment.category.name}</span>
              )}
              <p className="muted">
                {formatIDR(equipment.price_per_day)} &times; {state.quantity} unit &times; {days} hari
              </p>
            </div>
            <span>{formatIDR(total)}</span>
          </div>
          <dl className="availability-meta">
            <div>
              <dt>Tanggal mulai</dt>
              <dd>{state.startDate}</dd>
            </div>
            <div>
              <dt>Tanggal selesai</dt>
              <dd>{state.endDate}</dd>
            </div>
            <div>
              <dt>Durasi</dt>
              <dd>{days} hari</dd>
            </div>
          </dl>
          <div className="summary-total">
            <strong>Total</strong>
            <strong>{formatIDR(total)}</strong>
          </div>
          <Link to={`/katalog/${equipment.id}`} className="link-plain">
            &larr; Ubah tanggal atau jumlah
          </Link>
        </aside>
      </div>
    </div>
  )
}
