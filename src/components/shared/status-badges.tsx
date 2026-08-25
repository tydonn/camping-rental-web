import { Badge } from '@/components/ui/badge'
import type { BookingStatus, PaymentStatus } from '@/types'

const bookingStatusMeta: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu Pembayaran',
    className:
      'border-amber-200 bg-amber-100/70 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300',
  },
  paid: {
    label: 'Dibayar',
    className:
      'border-sky-200 bg-sky-100/70 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300',
  },
  confirmed: {
    label: 'Sedang Dipinjam',
    className:
      'border-emerald-200 bg-emerald-100/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-muted text-muted-foreground',
  },
  cancelled: {
    label: 'Dibatalkan',
    className:
      'border-red-200 bg-red-100/70 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400',
  },
}

export function BookingBadge({ status }: { status: BookingStatus }) {
  const meta = bookingStatusMeta[status]
  return (
    <Badge variant="outline" className={meta?.className ?? 'bg-muted text-muted-foreground'}>
      {meta?.label ?? status}
    </Badge>
  )
}

const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
  pending: bookingStatusMeta.pending,
  verified: bookingStatusMeta.confirmed,
  rejected: bookingStatusMeta.cancelled,
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'Menunggu Verifikasi',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentStatusMeta[status]
  return (
    <Badge variant="outline" className={meta?.className}>
      {paymentStatusLabel[status] ?? status}
    </Badge>
  )
}
