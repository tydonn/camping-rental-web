import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

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
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
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
        </PaginationItem>
        {pages.map((number) => (
          <PaginationItem key={number}>
            <Button
              variant={number === page ? 'default' : 'ghost'}
              size="icon-sm"
              aria-current={number === page ? 'page' : undefined}
              onClick={() => onChange(number)}
              className={cn(number !== page && 'text-muted-foreground')}
            >
              {number}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
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
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
