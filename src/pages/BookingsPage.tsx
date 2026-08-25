import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyBookings } from '../api/bookings'
import { Alert, BookingBadge, EmptyState, PageLoader, Pagination } from '../components/ui'
import { useApiQuery } from '../hooks/useApiQuery'
import { formatIDR, formatRange } from '../utils/format'
import type { Booking, BookingStatus, Paginated } from '../types'

const statusFilters: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'confirmed', label: 'Sedang Dipinjam' },
  { value: 'completed', label: 'Selesai' },
]

export default function BookingsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')

  const bookingsQuery = useApiQuery<Paginated<Booking>>(
    () => listMyBookings({ page, per_page: 10 }),
    [page],
  )

  const bookings = bookingsQuery.data?.data ?? []
  const lastPage = bookingsQuery.data?.meta.last_page ?? 1
  const visible =
    statusFilter === '' ? bookings : bookings.filter((booking) => booking.status === statusFilter)

  return (
    <div>
      <div className="page-heading">
        <h1>Riwayat Booking</h1>
        <p className="muted">Semua booking yang pernah Anda buat beserta statusnya.</p>
      </div>

      <div className="chip-filter" role="group" aria-label="Filter status booking">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`btn btn-sm ${statusFilter === filter.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {bookingsQuery.error && <Alert kind="error">{bookingsQuery.error}</Alert>}

      {bookingsQuery.loadingFirst ? (
        <PageLoader label="Memuat riwayat booking..." />
      ) : !bookingsQuery.error && visible.length === 0 ? (
        <EmptyState
          title={statusFilter === '' ? 'Belum ada booking' : 'Tidak ada booking dengan status ini'}
          description="Jelajahi katalog dan buat booking pertama Anda."
          action={
            <Link to="/katalog" className="btn btn-primary">
              Lihat Katalog
            </Link>
          }
        />
      ) : (
        <>
          <ul className="booking-list">
            {visible.map((booking) => {
              const firstItem = booking.items[0]
              return (
                <li key={booking.id}>
                  <Link to={`/booking/riwayat/${booking.id}`} className="card booking-row">
                    <div className="booking-row-main">
                      <span className="booking-id">Booking #{booking.id}</span>
                      <strong>{formatRange(booking.start_date, booking.end_date)}</strong>
                      <span className="muted">
                        {firstItem
                          ? `${firstItem.equipment?.name ?? 'Alat'}${booking.items.length > 1 ? ` +${booking.items.length - 1} alat lain` : ''}`
                          : '-'}
                      </span>
                    </div>
                    <div className="booking-row-side">
                      <span className="booking-total">{formatIDR(booking.total_amount)}</span>
                      <BookingBadge status={booking.status} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
          <Pagination page={page} lastPage={lastPage} onChange={setPage} />
        </>
      )}
    </div>
  )
}
