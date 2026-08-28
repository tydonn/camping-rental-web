import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyBookings } from '@/api/bookings'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { BookingBadge } from '@/components/shared/status-badges'
import { EmptyState } from '@/components/shared/empty-state'
import { DataPagination } from '@/components/shared/data-pagination'
import { SkeletonRow } from '@/components/shared/page-loader'
import { useApiQuery } from '@/hooks/useApiQuery'
import { formatIDR, formatRange } from '@/utils/format'
import type { Booking, BookingStatus, Paginated } from '@/types'
import { CircleAlertIcon } from 'lucide-react'

const statusFilters: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'confirmed', label: 'Sedang Dipinjam' },
  { value: 'completed', label: 'Selesai' },
]

function PaymentChip({ booking }: { booking: Booking }) {
  if (booking.status !== 'pending') return null
  const latest = booking.payments?.[0]
  if (!latest) return null
  if (latest.status === 'rejected') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-200 bg-red-100/70 px-2.5 py-0.5 text-[11px] font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400">
        Pembayaran ditolak &mdash; laporkan ulang
      </span>
    )
  }
  if (latest.status === 'pending') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/70 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
        Menunggu verifikasi admin
      </span>
    )
  }
  return null
}

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
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Riwayat Booking</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Semua booking yang pernah Anda buat beserta statusnya.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter status booking">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {bookingsQuery.error && (
        <Alert variant="destructive" className="mb-4">
          <CircleAlertIcon />
          <AlertDescription>{bookingsQuery.error}</AlertDescription>
        </Alert>
      )}

      {bookingsQuery.loadingFirst ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      ) : !bookingsQuery.error && visible.length === 0 ? (
        <EmptyState
          title={statusFilter === '' ? 'Belum ada booking' : 'Tidak ada booking dengan status ini'}
          description="Jelajahi katalog dan buat booking pertama Anda."
          action={
            <Button asChild className="mt-3">
              <Link to="/katalog">Lihat Katalog</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map((booking) => {
              const firstItem = booking.items[0]
              return (
                <li key={booking.id}>
                  <Link
                    to={`/booking/riwayat/${booking.id}`}
                    className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                        Booking {booking.id}
                      </span>
                      <p className="font-semibold">{formatRange(booking.start_date, booking.end_date)}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {firstItem
                          ? `${firstItem.equipment?.name ?? 'Alat'}${booking.items.length > 1 ? ` +${booking.items.length - 1} alat lain` : ''}`
                          : '-'}
                      </p>
                      <PaymentChip booking={booking} />
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span className="font-extrabold text-primary">
                        {formatIDR(booking.total_amount)}
                      </span>
                      <BookingBadge status={booking.status} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
          <DataPagination page={page} lastPage={lastPage} onChange={setPage} />
        </>
      )}
    </div>
  )
}
