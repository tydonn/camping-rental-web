import { useState } from 'react'
import { CheckCircle2Icon, CircleAlertIcon, CircleXIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { listAdminPayments, rejectPayment, verifyPayment } from '@/api/admin'
import { toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/shared/empty-state'
import { DataPagination } from '@/components/shared/data-pagination'
import { PageLoader } from '@/components/shared/page-loader'
import { PaymentBadge } from '@/components/shared/status-badges'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { Paginated, Payment, PaymentStatus } from '@/types'
import { formatDateTime, formatIDR } from '@/utils/format'
import { paymentMethodLabels } from '@/utils/constants'

const statusFilters: { value: PaymentStatus | ''; label: string }[] = [
  { value: 'pending', label: 'Menunggu Verifikasi' },
  { value: 'verified', label: 'Terverifikasi' },
  { value: 'rejected', label: 'Ditolak' },
  { value: '', label: 'Semua' },
]

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('pending')
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0)

  const [busyId, setBusyId] = useState<number | null>(null)

  const query = useApiQuery<Paginated<Payment>>(
    () =>
      listAdminPayments({
        status: statusFilter === '' ? undefined : statusFilter,
        page,
      }),
    [statusFilter, page, tick],
  )

  const payments = query.data?.data ?? []

  const handleVerify = async (payment: Payment) => {
    setBusyId(payment.id)
    try {
      await verifyPayment(payment.id)
      toast.success(
        `Pembayaran ${payment.id} diverifikasi. Booking ${payment.booking_id} kini berstatus dibayar.`,
      )
      setTick((value) => value + 1)
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (payment: Payment) => {
    setBusyId(payment.id)
    try {
      await rejectPayment(payment.id)
      toast.info(`Pembayaran ${payment.id} ditolak. Pelanggan dapat melaporkan ulang.`)
      setTick((value) => value + 1)
    } catch (error) {
      toast.error(toApiError(error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Verifikasi Pembayaran</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Periksa laporan pembayaran pelanggan. Verifikasi akan mengubah booking menjadi{' '}
          <strong>Dibayar</strong>.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter status pembayaran">
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
        <PageLoader label="Memuat daftar pembayaran..." />
      ) : !query.error && payments.length === 0 ? (
        <EmptyState
          title="Tidak ada pembayaran"
          description="Belum ada laporan pembayaran dengan filter ini."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-muted/60 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-2.5 font-semibold">ID</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Booking</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Metode</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Jumlah</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Catatan</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Dilaporkan</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-bold">{payment.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.booking_id}</td>
                    <td className="px-4 py-3">{paymentMethodLabels[payment.method] ?? payment.method}</td>
                    <td className="px-4 py-3 font-semibold">{formatIDR(payment.amount)}</td>
                    <td className="max-w-56 px-4 py-3 text-xs break-words text-muted-foreground">
                      {payment.note || <span>&ndash;</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {payment.paid_at ? formatDateTime(payment.paid_at) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {busyId === payment.id ? (
                          <span className="text-xs text-muted-foreground">Memproses...</span>
                        ) : payment.status === 'pending' ? (
                          <>
                            <Button size="sm" className="gap-1.5 px-2 sm:px-4" onClick={() => void handleVerify(payment)}>
                              <CheckCircle2Icon data-icon="inline-start" className="sm:hidden" />
                              <span className="hidden sm:inline">Verifikasi</span>
                              <span className="sm:hidden">OK</span>
                            </Button>
                            <Button variant="destructive" size="sm" className="px-2 sm:px-4" onClick={() => void handleReject(payment)}>
                              <CircleXIcon data-icon="inline-start" className="sm:hidden" />
                              Tolak
                            </Button>
                          </>
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
