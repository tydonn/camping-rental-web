import { useState } from 'react'
import { confirmPickup, listAdminBookings, processReturn } from '../../api/admin'
import { toApiError } from '../../api/client'
import { Alert, BookingBadge, EmptyState, InlineLoader, PageLoader, Pagination } from '../../components/ui'
import { useApiQuery } from '../../hooks/useApiQuery'
import type { Booking, BookingStatus, Paginated } from '../../types'
import { formatIDR, formatRange } from '../../utils/format'

const statusFilters: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'confirmed', label: 'Dipinjam' },
  { value: 'completed', label: 'Selesai' },
]

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0)

  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null)

  const query = useApiQuery<Paginated<Booking>>(
    () =>
      listAdminBookings({
        status: statusFilter === '' ? undefined : statusFilter,
        page,
      }),
    [statusFilter, page, tick],
  )

  const bookings = query.data?.data ?? []

  const handleConfirmPickup = async (booking: Booking) => {
    if (
      !window.confirm(`Konfirmasi pengambilan booking #${booking.id}? Stok alat akan berkurang.`)
    )
      return
    setBusyBookingId(booking.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      await confirmPickup(booking.id)
      setActionSuccess(`Pengambilan booking #${booking.id} dikonfirmasi. Stok telah diperbarui.`)
      setTick((value) => value + 1)
    } catch (error) {
      setActionError(toApiError(error).message)
    } finally {
      setBusyBookingId(null)
    }
  }

  const handleProcessReturn = async (booking: Booking) => {
    if (
      !window.confirm(
        `Proses pengembalian booking #${booking.id}? Stok akan ditambahkan kembali.`,
      )
    )
      return
    setBusyBookingId(booking.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      await processReturn(booking.id)
      setActionSuccess(`Pengembalian booking #${booking.id} selesai. Stok telah dikembalikan.`)
      setTick((value) => value + 1)
    } catch (error) {
      setActionError(toApiError(error).message)
    } finally {
      setBusyBookingId(null)
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Kelola Booking</h1>
        <p className="muted">
          Konfirmasi peminjaman untuk booking berstatus <strong>Dibayar</strong>, dan proses
          pengembalian untuk yang sedang dipinjam.
        </p>
      </div>

      <div className="chip-filter" role="group" aria-label="Filter status booking">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`btn btn-sm ${statusFilter === filter.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setStatusFilter(filter.value)
              setPage(1)
            }}
          >
            {filter.label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm refresh-btn"
          onClick={() => setTick((value) => value + 1)}
        >
          Muat Ulang
        </button>
      </div>

      {actionError && <Alert kind="error">{actionError}</Alert>}
      {actionSuccess && <Alert kind="success">{actionSuccess}</Alert>}
      {query.error && <Alert kind="error">{query.error}</Alert>}

      {query.loadingFirst ? (
        <PageLoader label="Memuat daftar booking..." />
      ) : !query.error && bookings.length === 0 ? (
        <EmptyState title="Tidak ada booking" description="Belum ada booking dengan filter ini." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table card-table">
              <thead>
                <tr>
                  <th scope="col">Booking</th>
                  <th scope="col">Penyewa</th>
                  <th scope="col">Periode</th>
                  <th scope="col">Alat</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td data-label="Booking">
                      <strong>#{booking.id}</strong>
                    </td>
                    <td data-label="Penyewa">User #{booking.user_id}</td>
                    <td data-label="Periode">
                      {formatRange(booking.start_date, booking.end_date)}
                      <span className="muted table-subtext">{booking.duration_days} hari</span>
                    </td>
                    <td data-label="Alat">
                      {booking.items.map((item) => (
                        <span key={item.id} className="table-subtext">
                          {item.equipment?.name ?? `Alat #${item.equipment_id}`} &times;
                          {item.quantity}
                        </span>
                      ))}
                    </td>
                    <td data-label="Total">{formatIDR(booking.total_amount)}</td>
                    <td data-label="Status">
                      <BookingBadge status={booking.status} />
                    </td>
                    <td className="text-right row-actions" data-label="Aksi">
                      {busyBookingId === booking.id ? (
                        <InlineLoader />
                      ) : booking.status === 'paid' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => void handleConfirmPickup(booking)}
                        >
                          Konfirmasi Pengambilan
                        </button>
                      ) : booking.status === 'confirmed' ? (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => void handleProcessReturn(booking)}
                        >
                          Proses Pengembalian
                        </button>
                      ) : (
                        <span className="muted">&ndash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} lastPage={query.data?.meta.last_page ?? 1} onChange={setPage} />
        </>
      )}
    </div>
  )
}
