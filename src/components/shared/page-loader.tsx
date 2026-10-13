import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function PageLoader({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground" role="status">
      <Spinner className="size-7" />
      <span>{label}</span>
    </div>
  )
}

export function InlineLoader({ label = 'Memuat...' }: { label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground')}>
      <Spinner className="size-3.5" /> {label}
    </span>
  )
}

/** Baris daftar:cemia thumbnail, nama, dan angka. Cermin bentuk baris ledger. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-rule py-4">
      <Skeleton className="size-12 shrink-0 rounded-[2px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-4 w-20 shrink-0" />
    </div>
  )
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Memuat data">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  )
}

/** Grid kartu untuk katalog: baris foto + nama + angka harga dan stok. */
export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="status" aria-label="Memuat data">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden border border-rule">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}