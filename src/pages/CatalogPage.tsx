import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { listCategoriesForFilter, listEquipment } from '../api/catalog'
import EquipmentCard from '../components/EquipmentCard'
import { Alert, EmptyState, Field, PageLoader, Pagination } from '../components/ui'
import { useApiQuery } from '../hooks/useApiQuery'
import type { Category, Equipment, Paginated, SortDirection, EquipmentSortField } from '../types'

const sortOptions: { value: `${EquipmentSortField}:${SortDirection}`; label: string }[] = [
  { value: 'name:asc', label: 'Nama (A-Z)' },
  { value: 'name:desc', label: 'Nama (Z-A)' },
  { value: 'price_per_day:asc', label: 'Harga termurah' },
  { value: 'price_per_day:desc', label: 'Harga termahal' },
]

export default function CatalogPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortValue, setSortValue] = useState<`${EquipmentSortField}:${SortDirection}`>('name:asc')
  const [page, setPage] = useState(1)

  const [sortField, sortDir] = sortValue.split(':') as [EquipmentSortField, SortDirection]

  const catalog = useApiQuery<Paginated<Equipment>>(
    () =>
      listEquipment({
        search: search || undefined,
        category_id: categoryId === '' ? undefined : categoryId,
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

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setCategoryId(event.target.value === '' ? '' : Number(event.target.value))
    setPage(1)
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Katalog Alat Camping</h1>
        <p className="muted">Temukan tenda, carrier, dan perlengkapan outdoor lainnya.</p>
      </div>

      <div className="catalog-layout">
        <aside className="card filter-panel">
          <h2>Filter</h2>
          <Field label="Cari alat" htmlFor="catalog-search">
            <input
              id="catalog-search"
              className="input"
              type="search"
              placeholder="mis. tenda, carrier..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </Field>
          <Field label="Kategori" htmlFor="catalog-category">
            <select
              id="catalog-category"
              className="input"
              value={categoryId === '' ? '' : String(categoryId)}
              onChange={handleCategoryChange}
            >
              <option value="">Semua kategori</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Urutkan" htmlFor="catalog-sort">
            <select
              id="catalog-sort"
              className="input"
              value={sortValue}
              onChange={(event) => {
                setSortValue(event.target.value as typeof sortValue)
                setPage(1)
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => {
                setAvailableOnly(event.target.checked)
                setPage(1)
              }}
            />
            Hanya tampilkan alat dengan stok
          </label>
        </aside>

        <section aria-label="Daftar alat">
          {catalog.error && <Alert kind="error">{catalog.error}</Alert>}
          {catalog.loadingFirst ? (
            <PageLoader label="Memuat katalog..." />
          ) : !catalog.error && items.length === 0 ? (
            <EmptyState
              title="Alat tidak ditemukan"
              description="Coba ubah kata kunci pencarian atau filter kategori."
            />
          ) : (
            <>
              <div className="equipment-grid">
                {items.map((item) => (
                  <EquipmentCard key={item.id} equipment={item} />
                ))}
              </div>
              <Pagination page={page} lastPage={lastPage} onChange={setPage} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
