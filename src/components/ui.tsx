import type { ReactNode } from 'react'
import type { BookingStatus, PaymentStatus } from '../types'

export function Spinner({ size = 20 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />
}

export function PageLoader({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="page-loader" role="status">
      <Spinner size={28} />
      <span>{label}</span>
    </div>
  )
}

export function InlineLoader({ label = 'Memuat...' }: { label?: string }) {
  return (
    <span className="inline-loader">
      <Spinner size={14} /> {label}
    </span>
  )
}

type AlertKind = 'error' | 'success' | 'info' | 'warning'

export function Alert({ kind = 'info', children }: { kind?: AlertKind; children: ReactNode }) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : undefined}>
      {children}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

const bookingStatusMeta: Record<BookingStatus, { label: string; tone: string }> = {
  pending: { label: 'Menunggu Pembayaran', tone: 'warning' },
  paid: { label: 'Dibayar', tone: 'info' },
  confirmed: { label: 'Sedang Dipinjam', tone: 'success' },
  completed: { label: 'Selesai', tone: 'muted' },
  cancelled: { label: 'Dibatalkan', tone: 'danger' },
}

export function BookingBadge({ status }: { status: BookingStatus }) {
  const meta = bookingStatusMeta[status] ?? { label: status, tone: 'muted' }
  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>
}

const paymentStatusMeta: Record<PaymentStatus, { label: string; tone: string }> = {
  pending: { label: 'Menunggu Verifikasi', tone: 'warning' },
  verified: { label: 'Terverifikasi', tone: 'success' },
  rejected: { label: 'Ditolak', tone: 'danger' },
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentStatusMeta[status] ?? { label: status, tone: 'muted' }
  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
        <path
          d="M3 7l2-4h6l2 4M13 7l2-4h6l2 4M5 7h16l-1.5 12.5a2 2 0 01-2 1.5H8.5a2 2 0 01-2-1.5L5 7z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function Pagination({
  page,
  lastPage,
  onChange,
}: {
  page: number
  lastPage: number
  onChange: (page: number) => void
}) {
  if (lastPage <= 1) return null
  const pages: number[] = []
  const from = Math.max(1, page - 2)
  const to = Math.min(lastPage, from + 4)
  for (let i = from; i <= to; i += 1) pages.push(i)

  return (
    <nav className="pagination" aria-label="Navigasi halaman">
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Sebelumnya
      </button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          className={`btn btn-sm ${number === page ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
      >
        Berikutnya
      </button>
    </nav>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
