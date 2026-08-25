import { useState } from 'react'
import { CheckCheckIcon, CircleAlertIcon, PackageCheckIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { confirmPickup, listAdminBookings, processReturn } from '@/api/admin'
import { toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookingBadge } from '@/components/shared/status-badges'
import { EmptyState } from '@/components/shared/empty-state'
import { DataPagination } from '@/components/shared/data-pagination'
import { PageLoader } from '@/components/shared/page-loader'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { Booking, BookingStatus, Paginated } from '@/types'
import { formatIDR, formatRange } from '@/utils/format'

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
    setBusyBookingId(booking.id)
    try {
      await confirmPickup(booking.id)
      toast.success(`Pengambilan booking #${booking.id} dikonfirmasi. Stok telah diperbarui.`)
      setTick((value) => value + 1)
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setBusyBookingId(null)
    }
  }

  const handleProcessReturn = async (booking: Booking) => {
    setBusyBookingId(booking.id)
    try {
      await processReturn(booking.id)
      toast.success(`Pengembalian booking #${booking.id} selesai. Stok telah dikembalikan.`)
      setTick((value) => value + 1)
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setBusyBookingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Kelola Booking</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Konfirmasi peminjaman untuk booking berstatus <strong>Dibayar</strong>, dan proses
          pengembalian untuk yang sedang dipinjam.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter status booking">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter(filter.value)
              setPage(1)
            }}
          >
            {filter.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto gap-1.5 text-muted-foreground"
          onClick={() => setTick((value) => value + 1)}
        >
          <RefreshCwIcon /> Muat Ulang
        </Button>
      </div>

      {query.error && (
        <Alert variant="destructive" className="mb-4">
          <CircleAlertIcon />
          <AlertDescription>{query.error}</AlertDescription>
        </Alert>
      )}

      {query.loadingFirst ? (
        <PageLoader label="Memuat daftar booking..." />
      ) : !query.error && bookings.length === 0 ? (
        <EmptyState title="Tidak ada booking" description="Belum ada booking dengan filter ini." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="bg-muted/60 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Booking</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Penyewa</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Periode</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Alat</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Total</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-bold">#{booking.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">User #{booking.user_id}</td>
                    <td className="px-4 py-3">
                      {formatRange(booking.start_date, booking.end_date)}
                      <span className="block text-xs text-muted-foreground">
                        {booking.duration_days} hari
                      </span>
                    </td>
                    <td className="max-w-48 px-4 py-3">
                      {booking.items.map((item) => (
                        <span key={item.id} className="block truncate text-xs text-muted-foreground">
                          {item.equipment?.name ?? `Alat #${item.equipment_id}`} &times;
                          {item.quantity}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatIDR(booking.total_amount)}</td>
                    <td className="px-4 py-3">
                      <BookingBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {busyBookingId === booking.id ? (
                          <span className="text-xs text-muted-foreground">Memproses...</span>
                        ) : booking.status === 'paid' ? (
                          <Button size="sm" onClick={() => void handleConfirmPickup(booking)}>
                            <PackageCheckIcon data-icon="inline-start" />
                            Konfirmasi Pengambilan
                          </Button>
                        ) : booking.status === 'confirmed' ? (
                          <Button size="sm" onClick={() => void handleProcessReturn(booking)}>
                            <CheckCheckIcon data-icon="inline-start" />
                            Proses Pengembalian
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">&ndash;</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataPagination
            page={page}
            lastPage={query.data?.meta.last_page ?? 1}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
