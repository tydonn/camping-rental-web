import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getEquipment } from '../api/catalog'
import { useAuth } from '../hooks/useAuth'
import { useApiQuery } from '../hooks/useApiQuery'
import { useEquipmentAvailability } from '../hooks/useEquipmentAvailability'
import { Alert, Field, PageLoader, Spinner } from '../components/ui'
import { addDaysISO, formatIDR, inclusiveDays, resolvePhotoUrl, todayISO } from '../utils/format'
import type { Equipment } from '../types'

interface CheckoutState {
  equipmentId: number
  quantity: number
  startDate: string
  endDate: string
}

export default function EquipmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const detail = useApiQuery<Equipment>(() => getEquipment(id ?? ''), [id])
  const equipment = detail.data

  const today = todayISO()
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(addDaysISO(today, 1))
  const [quantity, setQuantity] = useState(1)

  const availability = useEquipmentAvailability(id ?? '')

  function handleStartChange(value: string) {
    setStartDate(value)
    if (value > endDate) setEndDate(addDaysISO(value, 1))
    availability.reset()
  }

  function handleEndChange(value: string) {
    setEndDate(value < startDate ? startDate : value)
    availability.reset()
  }

  function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void availability.check(startDate, endDate, quantity)
  }

  function handleBook() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    navigate('/booking/checkout', {
      state: {
        equipmentId: Number(id),
        quantity,
        startDate,
        endDate,
      } satisfies CheckoutState,
    })
  }

  if (detail.loadingFirst) return <PageLoader label="Memuat detail alat..." />
  if (detail.error || !equipment) {
    return (
      <div className="empty-state">
        <h2>Alat tidak ditemukan</h2>
        <p>{detail.error ?? 'Alat yang Anda cari tidak tersedia.'}</p>
        <Link to="/katalog" className="btn btn-primary">
          Kembali ke katalog
        </Link>
      </div>
    )
  }

  const days = inclusiveDays(startDate, endDate)
  const photoUrl = resolvePhotoUrl(equipment.photo)
  const maxQuantity = Math.max(equipment.stock, 1)
  const canBook =
    availability.result?.is_available === true && quantity <= availability.result.available

  return (
    <div>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/katalog">Katalog</Link> <span>/</span> <span>{equipment.name}</span>
      </nav>

      <div className="detail-layout">
        <div className="card detail-photo-wrap">
          {photoUrl ? (
            <img src={photoUrl} alt={equipment.name} className="detail-photo" />
          ) : (
            <div className="equipment-photo placeholder detail-placeholder" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="72" height="72">
                <path
                  d="M12 4L3 19h18L12 4zm0 6l4.2 7H7.8L12 10z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="detail-info">
          {equipment.category && <span className="chip">{equipment.category.name}</span>}
          <h1>{equipment.name}</h1>
          <p className="detail-price">{formatIDR(equipment.price_per_day)} / hari</p>
          <p className={`badge ${equipment.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
            {equipment.stock > 0 ? `Stok tersedia: ${equipment.stock}` : 'Stok habis'}
          </p>
          {equipment.description && (
            <div className="detail-description">
              <h2>Deskripsi</h2>
              <p>{equipment.description}</p>
            </div>
          )}
        </div>

        <div className="card booking-box">
          <h2>Cek Ketersediaan</h2>
          <form onSubmit={handleCheck}>
            <Field label="Tanggal mulai" htmlFor="start-date">
              <input
                id="start-date"
                className="input"
                type="date"
                min={today}
                value={startDate}
                onChange={(event) => handleStartChange(event.target.value)}
                required
              />
            </Field>
            <Field label="Tanggal selesai" htmlFor="end-date">
              <input
                id="end-date"
                className="input"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) => handleEndChange(event.target.value)}
                required
              />
            </Field>
            <p className="field-hint">Durasi sewa: {days} hari</p>
            <Field label="Jumlah" htmlFor="quantity">
              <input
                id="quantity"
                className="input"
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(event) => {
                  const value = Math.max(1, Math.min(maxQuantity, Number(event.target.value)))
                  setQuantity(value)
                  availability.reset()
                }}
                required
              />
            </Field>
            <button
              type="submit"
              className="btn btn-outline btn-block"
              disabled={availability.loading || days === 0}
            >
              {availability.loading ? <Spinner size={16} /> : 'Cek Ketersediaan'}
            </button>
          </form>

          <div className="availability-result" aria-live="polite">
            {availability.error && <Alert kind="error">{availability.error}</Alert>}
            {availability.result && (
              <>
                {availability.result.is_available ? (
                  <Alert kind="success">
                    Tersedia! Sisa {availability.result.available} unit untuk rentang tanggal ini.
                  </Alert>
                ) : (
                  <Alert kind="warning">
                    Stok tidak cukup ({availability.result.available} unit tersisa). Silakan pilih
                    jumlah lebih kecil atau rentang tanggal lain.
                  </Alert>
                )}
                <dl className="availability-meta">
                  <div>
                    <dt>Total stok</dt>
                    <dd>{availability.result.stock}</dd>
                  </div>
                  <div>
                    <dt>Sudah dibooking</dt>
                    <dd>{availability.result.booked}</dd>
                  </div>
                  <div>
                    <dt>Tersedia</dt>
                    <dd>{availability.result.available}</dd>
                  </div>
                  <div>
                    <dt>Estimasi biaya</dt>
                    <dd>{formatIDR(Number(equipment.price_per_day) * quantity * days)}</dd>
                  </div>
                </dl>
              </>
            )}
          </div>

          <button type="button" className="btn btn-primary btn-block" disabled={!canBook} onClick={handleBook}>
            {user ? 'Booking Sekarang' : 'Masuk untuk Booking'}
          </button>
          {!canBook && !availability.error && !availability.loading && (
            <p className="field-hint center-text">Lakukan pengecekan ketersediaan terlebih dahulu.</p>
          )}
        </div>
      </div>
    </div>
  )
}
