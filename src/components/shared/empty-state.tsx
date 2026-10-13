import type { ReactNode } from 'react'
import { TentIcon } from 'lucide-react'

/**
 * Keadaan kosong sebagai bidang kosong pada lembar ledger: rata kiri, tanpa
 * garis putus-putus, tanpa ikon besar di tengah. Judul membawa keadaan,
 * bukan ilustrasi.
 */
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
    <div className="border border-dashed border-rule px-5 py-10">
      <div className="flex items-start gap-3">
        <TentIcon className="mt-0.5 size-4 shrink-0 text-rule-strong" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}