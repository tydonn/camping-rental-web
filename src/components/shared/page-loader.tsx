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

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-xl border bg-card p-3">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div className="w-full space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-56 max-w-full" />
        <Skeleton className="h-3 w-40 max-w-full" />
      </div>
      <Skeleton className="h-8 w-20 shrink-0" />
    </div>
  )
}
