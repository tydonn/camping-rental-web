import { useState } from 'react'
import {
  CheckCheckIcon,
  CircleAlertIcon,
  InfoIcon,
  MailIcon,
  PackageCheckIcon,
  PhoneIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { confirmPickup, listAdminBookings, processReturn } from '@/api/admin'
import { toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)

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
      toast.success(`Pengambilan booking ${booking.id} dikonfirmasi. Stok telah diperbarui.`)
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
      toast.success(`Pengembalian booking ${booking.id} selesai. Stok telah dikembalikan.`)
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
            <table className="w-full min-w-[780px] text-sm">
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
                    <td className="px-4 py-3 font-bold">{booking.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div>
                          <span className="font-semibold text-foreground">
                            {booking.user?.name ?? `User ${booking.user_id}`}
                          </span>
                          {booking.user?.phone_number && (
                            <span className="block text-xs text-muted-foreground">
                              {booking.user.phone_number}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Detail penyewa booking ${booking.id}`}
                          onClick={() => setDetailBooking(booking)}
                        >
                          <InfoIcon />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatRange(booking.start_date, booking.end_date)}
                      <span className="block text-xs text-muted-foreground">
                        {booking.duration_days} hari
                      </span>
                    </td>
                    <td className="max-w-48 px-4 py-3">
                      {booking.items.map((item) => (
                        <span key={item.id} className="block truncate text-xs text-muted-foreground">
                          {item.equipment?.name ?? `Alat ${item.equipment_id}`} &times;
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
                          <Button size="sm" className="gap-1.5 px-2 sm:px-4" onClick={() => void handleConfirmPickup(booking)}>
                            <PackageCheckIcon data-icon="inline-start" className="sm:hidden" />
                            <span className="hidden sm:inline">Konfirmasi Pengambilan</span>
                            <span className="sm:hidden">Ambil</span>
                          </Button>
                        ) : booking.status === 'confirmed' ? (
                          <Button size="sm" className="gap-1.5 px-2 sm:px-4" onClick={() => void handleProcessReturn(booking)}>
                            <CheckCheckIcon data-icon="inline-start" className="sm:hidden" />
                            <span className="hidden sm:inline">Proses Pengembalian</span>
                            <span className="sm:hidden">Kembali</span>
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

      <Dialog open={detailBooking !== null} onOpenChange={(open) => !open && setDetailBooking(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detail Penyewa</DialogTitle>
            <DialogDescription>
              Kontak pemilik booking {detailBooking ? detailBooking.id : ''}.
            </DialogDescription>
          </DialogHeader>

          {detailBooking && (
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-bold">Nama</h3>
                  <p className="mt-0.5 text-muted-foreground">
                    {detailBooking.user?.name ?? `User ${detailBooking.user_id}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-bold">Email</h3>
                  {detailBooking.user?.email ? (
                    <a
                      href={`mailto:${detailBooking.user.email}`}
                      className="mt-0.5 block text-muted-foreground hover:text-primary hover:underline"
                    >
                      {detailBooking.user.email}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-muted-foreground">&ndash;</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-bold">Nomor HP</h3>
                  {detailBooking.user?.phone_number ? (
                    <a
                      href={`tel:${detailBooking.user.phone_number.replace(/[^+\d]/g, '')}`}
                      className="mt-0.5 block text-muted-foreground hover:text-primary hover:underline"
                    >
                      {detailBooking.user.phone_number}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-muted-foreground">&ndash;</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
