import type { BookingStatus, PaymentStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Status adalah data kategorikal, bukan chrome, jadi warnanya dipertahankan.
 * Yang berubah adalah bentuknya: label mono, tajam, dan selalu berpasangan
 * dengan teks status — jadi makna tidak pernah hanya lewat warna.
 */
const bookingStatusMeta: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu Pembayaran', className: 'border-amber-300/70 bg-amber-50 text-amber-900' },
  paid: { label: 'Dibayar', className: 'border-sky-300/70 bg-sky-50 text-sky-900' },
  confirmed: { label: 'Sedang Dipinjam', className: 'border-emerald-300/70 bg-emerald-50 text-emerald-900' },
  completed: { label: 'Selesai', className: 'border-rule bg-muted text-muted-foreground' },
  cancelled: { label: 'Dibatalkan', className: 'border-red-300/70 bg-red-50 text-red-800' },
}

export function BookingBadge({ status }: { status: BookingStatus }) {
  const meta = bookingStatusMeta[status] ?? { label: status, className: 'border-rule bg-muted text-muted-foreground' }
  return (
    <Badge variant="outline" className={cn('font-mono text-[0.6875rem] tracking-[0.1em] uppercase', meta.className)}>
      {meta.label}
    </Badge>
  )
}

const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu Verifikasi', className: 'border-amber-300/70 bg-amber-50 text-amber-900' },
  verified: { label: 'Terverifikasi', className: 'border-emerald-300/70 bg-emerald-50 text-emerald-900' },
  rejected: { label: 'Ditolak', className: 'border-red-300/70 bg-red-50 text-red-800' },
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta =
    paymentStatusMeta[status] ?? { label: status, className: 'border-rule bg-muted text-muted-foreground' }
  return (
    <Badge variant="outline" className={cn('font-mono text-[0.6875rem] tracking-[0.1em] uppercase', meta.className)}>
      {meta.label}
    </Badge>
  )
}

/** Label stok untuk kartu katalog dan baris tabel. */
export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge variant="outline" className="border-primary/40 font-mono text-[0.6875rem] tracking-[0.1em] text-primary uppercase">
        Kosong
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-rule bg-muted font-mono text-[0.6875rem] tracking-[0.1em] text-muted-foreground uppercase">
      {String(stock).padStart(2, '0')} tersedia
    </Badge>
  )
}