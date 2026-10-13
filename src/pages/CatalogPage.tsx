import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listCategoriesForFilter, listEquipment } from '@/api/catalog'
import EquipmentCard from '@/components/EquipmentCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field } from '@/components/shared/form-field'
import { SkeletonGrid } from '@/components/shared/page-loader'
import { EmptyState } from '@/components/shared/empty-state'
import { DataPagination } from '@/components/shared/data-pagination'
import { Figure, PageHeader, Rule } from '@/components/shared/ledger'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { Category, Equipment, EquipmentSortField, Paginated, SortDirection } from '@/types'
import { CircleAlertIcon, SlidersHorizontalIcon } from 'lucide-react'

const sortOptions: { value: `${EquipmentSortField}:${SortDirection}`; label: string }[] = [
  { value: 'name:asc', label: 'Nama (A-Z)' },
  { value: 'name:desc', label: 'Nama (Z-A)' },
  { value: 'price_per_day:asc', label: 'Harga termurah' },
  { value: 'price_per_day:desc', label: 'Harga termahal' },
]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryIdState] = useState<string>(
    () => searchParams.get('category_id') ?? 'all',
  )
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortValue, setSortValue] = useState<`${EquipmentSortField}:${SortDirection}`>('name:asc')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const setCategoryId = (value: string) => {
    setCategoryIdState(value)
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('category_id')
    else next.set('category_id', value)
    setSearchParams(next, { replace: true })
  }

  const [sortField, sortDir] = sortValue.split(':') as [EquipmentSortField, SortDirection]

  const catalog = useApiQuery<Paginated<Equipment>>(
    () =>
      listEquipment({
        search: search || undefined,
        category_id: categoryId === 'all' ? undefined : Number(categoryId),
        available_only: availableOnly || undefined,
        sort_by: sortField,
        sort_dir: sortDir,
        page,
        per_page: 12,
      }),
    [search, categoryId, availableOnly, sortField, sortDir, page],
  )

  const categoriesQuery = useApiQuery<Category[]>(
    () => listCategoriesForFilter().catch(() => []),
    [],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const items = catalog.data?.data ?? []
  const lastPage = catalog.data?.meta.last_page ?? 1
  const total = catalog.data?.meta.total ?? 0

  return (
    <div className="pt-2">
        <PageHeader
          title="Katalog Alat Camping"
          description="Temukan tenda, carrier, dan perlengkapan outdoor lainnya."
          action={
            !catalog.loadingFirst && !catalog.error ? (
              <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
                <Figure>{String(total).padStart(2, '0')}</Figure> alat
              </p>
            ) : null
          }
        />
        <Rule />

        <div className="grid items-start gap-x-10 lg:grid-cols-[15rem_1fr]">
          <aside className="py-8 lg:sticky lg:top-20" aria-label="Filter katalog">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              className="flex w-full items-center justify-between border-b border-rule pb-3 font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase lg:pointer-events-none"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontalIcon className="size-3.5" />
                Filter
              </span>
              <span className="lg:hidden">{filterOpen ? 'Tutup' : 'Buka'}</span>
            </button>

            <div className={`mt-5 space-y-5 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
              <Field label="Cari alat" htmlFor="catalog-search">
                <Input
                  id="catalog-search"
                  type="search"
                  placeholder="mis. tenda, carrier..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </Field>

              <Field label="Kategori" htmlFor="catalog-category">
                <Select
                  value={categoryId}
                  onValueChange={(value) => {
                    setCategoryId(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger id="catalog-category" className="w-full">
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {(categoriesQuery.data ?? []).map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Urutkan" htmlFor="catalog-sort">
                <Select
                  value={sortValue}
                  onValueChange={(value) => {
                    setSortValue(value as typeof sortValue)
                    setPage(1)
                  }}
                >
                  <SelectTrigger id="catalog-sort" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="border-t border-rule pt-5">
                <Label className="cursor-pointer text-xs normal-case">
                  <Checkbox
                    id="catalog-available"
                    checked={availableOnly}
                    onCheckedChange={(checked) => {
                      setAvailableOnly(checked === true)
                      setPage(1)
                    }}
                  />
                  Hanya alat dengan stok
                </Label>
              </div>
            </div>
          </aside>

          <section className="py-8" aria-label="Daftar alat">
            {catalog.loadingFirst ? (
              <SkeletonGrid count={8} />
            ) : catalog.error ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>Gagal memuat</AlertTitle>
                <AlertDescription>{catalog.error}</AlertDescription>
              </Alert>
            ) : items.length === 0 ? (
              <EmptyState
                title="Alat tidak ditemukan"
                description="Coba ubah kata kunci pencarian atau filter kategori."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {items.map((item) => (
                    <EquipmentCard key={item.id} equipment={item} />
                  ))}
                </div>
                <DataPagination page={page} lastPage={lastPage} onChange={setPage} />
              </>
            )}
          </section>
        </div>
      </div>
  )
}