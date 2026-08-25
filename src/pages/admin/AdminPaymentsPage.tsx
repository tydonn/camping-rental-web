import { useState } from 'react'
import { listAdminPayments, rejectPayment, verifyPayment } from '../../api/admin'
import { toApiError } from '../../api/client'
import {
  Alert,
  EmptyState,
  InlineLoader,
  PageLoader,
  Pagination,
  PaymentBadge,
} from '../../components/ui'
import { useApiQuery } from '../../hooks/useApiQuery'
import type { Paginated, Payment, PaymentStatus } from '../../types'
import { formatDateTime, formatIDR } from '../../utils/format'
import { paymentMethodLabels } from '../../utils/constants'

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

  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
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
    if (
      !window.confirm(
        `Verifikasi pembayaran #${payment.id} untuk booking #${payment.booking_id}?`,
      )
    )
      return
    setBusyId(payment.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      await verifyPayment(payment.id)
      setActionSuccess(
        `Pembayaran #${payment.id} diverifikasi. Booking #${payment.booking_id} kini berstatus dibayar.`,
      )
      setTick((value) => value + 1)
    } catch (error) {
      setActionError(toApiError(error).message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (payment: Payment) => {
    if (!window.confirm(`Tolak pembayaran #${payment.id}? Pelanggan dapat melaporkan ulang.`))
      return
    setBusyId(payment.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      await rejectPayment(payment.id)
      setActionSuccess(`Pembayaran #${payment.id} ditolak.`)
      setTick((value) => value + 1)
    } catch (error) {
      setActionError(toApiError(error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Verifikasi Pembayaran</h1>
        <p className="muted">
          Periksa laporan pembayaran pelanggan. Verifikasi akan mengubah booking menjadi{' '}
          <strong>Dibayar</strong>.
        </p>
      </div>

      <div className="chip-filter" role="group" aria-label="Filter status pembayaran">
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
        <PageLoader label="Memuat daftar pembayaran..." />
      ) : !query.error && payments.length === 0 ? (
        <EmptyState
          title="Tidak ada pembayaran"
          description="Belum ada laporan pembayaran dengan filter ini."
        />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table card-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Booking</th>
                  <th scope="col">Metode</th>
                  <th scope="col">Jumlah</th>
                  <th scope="col">Catatan</th>
                  <th scope="col">Dilaporkan</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td data-label="ID">
                      <strong>#{payment.id}</strong>
                    </td>
                    <td data-label="Booking">#{payment.booking_id}</td>
                    <td data-label="Metode">
                      {paymentMethodLabels[payment.method] ?? payment.method}
                    </td>
                    <td data-label="Jumlah">{formatIDR(payment.amount)}</td>
                    <td data-label="Catatan" className="note-cell">
                      {payment.note || <span className="muted">&ndash;</span>}
                    </td>
                    <td data-label="Dilaporkan">
                      {payment.paid_at ? formatDateTime(payment.paid_at) : '-'}
                    </td>
                    <td data-label="Status">
                      <PaymentBadge status={payment.status} />
                    </td>
                    <td className="text-right row-actions" data-label="Aksi">
                      {busyId === payment.id ? (
                        <InlineLoader />
                      ) : payment.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => void handleVerify(payment)}
                          >
                            Verifikasi
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => void handleReject(payment)}
                          >
                            Tolak
                          </button>
                        </>
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
