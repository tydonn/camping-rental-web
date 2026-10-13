import type { ReactNode } from 'react'
import { ruleStyle } from '@/hooks/useLedgerDraw'

/**
 * Kosakata bersama untuk dunia "rental ledger".
 *
 * Aturannya: satu garis margin merah oksida di tepi kiri setiap section,
 * setiap field ditutup garis 1px, angka selalu monospace, tidak ada shadow,
 * tidak ada radius besar.
 */

/** Section dengan garis margin di tepi kiri. Ison di-`id` dan `className`. */
export function Sheet({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="relative mx-auto w-full max-w-6xl pr-4 pl-8 sm:pr-6 sm:pl-12">
        <div
          aria-hidden="true"
          className="rule-draw-y absolute inset-y-0 left-4 w-px bg-primary sm:left-6"
        />
        {children}
      </div>
    </section>
  )
}

/** Garis horizontal 1px yang tergambar dari margin saat masuk viewport. */
export function Rule({ delay = 0, className = '' }: { delay?: number; className?: string }) {
  return <div data-draw style={ruleStyle(delay)} className={`rule-draw h-px w-full bg-rule ${className}`} />
}

/** Garis margin vertikal; hanya untuk section yang butuh Byronan. */
export function MarginRule({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rule-draw-y absolute inset-y-0 left-4 w-px bg-primary sm:left-6 ${className}`}
    />
  )
}

/** Label kolom: mono, uppercase, kecil. Untuk header tabel dan nama field. */
export function LedgerLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase ${className}`}
    >
      {children}
    </span>
  )
}

/** Figure: angka monospace dengan lebar digit selaras. */
export function Figure({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{children}</span>
}

/** Judul halaman + keterangan opsional + aksi opsional, di atas garis. */
export function PageHeader({
  title,
  description,
  action,
  className = '',
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-balance">{title}</h1>
        {description && (
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
