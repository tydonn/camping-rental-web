import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Figure } from '@/components/shared/ledger'

/** Navigasi halaman sebagai baris ledger: angka mono, state aktif memakai aksen. */
export function DataPagination({
  page,
  lastPage,
  onChange,
}: {
  page: number
  lastPage: number
  onChange: (page: number) => void
}) {
  if (lastPage <= 1) return null

  const from = Math.max(1, Math.min(page - 2, lastPage - 4))
  const to = Math.min(lastPage, Math.max(from + 4, page))
  const pages: number[] = []
  for (let i = from; i <= to; i += 1) pages.push(i)

  return (
    <nav className="mt-8 flex flex-wrap items-center gap-2 border-t border-rule pt-5" aria-label="Navigasi halaman">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeftIcon data-icon="inline-start" />
        Sebelumnya
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((number) => (
          <div key={number}>
            <Button
              variant={number === page ? 'default' : 'ghost'}
              size="icon-sm"
              aria-current={number === page ? 'page' : undefined}
              aria-label={`Halaman ${number}`}
              onClick={() => onChange(number)}
              className={cn('font-mono tabular-nums', number !== page && 'text-muted-foreground')}
            >
              <Figure>{String(number).padStart(2, '0')}</Figure>
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
        aria-label="Halaman berikutnya"
      >
        Berikutnya
        <ChevronRightIcon data-icon="inline-end" />
      </Button>
    </nav>
  )
}