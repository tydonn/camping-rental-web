import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  createCategory,
  createEquipment,
  deleteCategory,
  deleteEquipment,
  listCategories,
  updateCategory,
  updateEquipment,
} from '../../api/admin'
import { listEquipment } from '../../api/catalog'
import { firstFieldErrors, toApiError } from '../../api/client'
import { Alert, EmptyState, Field, Modal, PageLoader, Pagination } from '../../components/ui'
import { useApiQuery } from '../../hooks/useApiQuery'
import type { Category, Equipment, Paginated } from '../../types'
import { formatIDR } from '../../utils/format'

interface EquipmentFormState {
  category_id: string
  name: string
  description: string
  price_per_day: string
  stock: string
  photo: string
}

const emptyForm: EquipmentFormState = {
  category_id: '',
  name: '',
  description: '',
  price_per_day: '',
  stock: '1',
  photo: '',
}

export default function AdminEquipmentPage() {
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0)

  const categoriesQuery = useApiQuery<Category[]>(() => listCategories(), [])
  const equipmentQuery = useApiQuery<Paginated<Equipment>>(
    () => listEquipment({ page, per_page: 12 }),
    [page, tick],
  )

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EquipmentFormState>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [modalError, setModalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [equipmentError, setEquipmentError] = useState<string | null>(null)

  const categories = categoriesQuery.data ?? []
  const items = equipmentQuery.data?.data ?? []

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newCategoryName.trim()) return
    setCategoryBusy(true)
    setCategoryError(null)
    try {
      await createCategory(newCategoryName.trim())
      setNewCategoryName('')
      categoriesQuery.reload()
    } catch (error) {
      setCategoryError(firstFieldErrors(error).name ?? toApiError(error).message)
    } finally {
      setCategoryBusy(false)
    }
  }

  const handleRenameCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingCategoryId === null || !editingCategoryName.trim()) return
    setCategoryBusy(true)
    setCategoryError(null)
    try {
      await updateCategory(editingCategoryId, editingCategoryName.trim())
      setEditingCategoryId(null)
      categoriesQuery.reload()
      setTick((value) => value + 1)
    } catch (error) {
      setCategoryError(firstFieldErrors(error).name ?? toApiError(error).message)
    } finally {
      setCategoryBusy(false)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return
    setCategoryBusy(true)
    setCategoryError(null)
    try {
      await deleteCategory(category.id)
      categoriesQuery.reload()
      setTick((value) => value + 1)
    } catch (error) {
      setCategoryError(toApiError(error).message)
    } finally {
      setCategoryBusy(false)
    }
  }

  function openCreateModal() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      category_id: categories.length > 0 ? String(categories[0].id) : '',
    })
    setFormErrors({})
    setModalError(null)
    setModalOpen(true)
  }

  function openEditModal(equipment: Equipment) {
    setEditingId(equipment.id)
    setForm({
      category_id: equipment.category ? String(equipment.category.id) : '',
      name: equipment.name,
      description: equipment.description ?? '',
      price_per_day: String(Number(equipment.price_per_day)),
      stock: String(equipment.stock),
      photo: equipment.photo ?? '',
    })
    setFormErrors({})
    setModalError(null)
    setModalOpen(true)
  }

  const handleEquipmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFormErrors({})
    setModalError(null)
    const payload = {
      category_id: Number(form.category_id),
      name: form.name.trim(),
      description: form.description.trim() || null,
      price_per_day: Number(form.price_per_day),
      stock: Number(form.stock),
      photo: form.photo.trim() || null,
    }
    try {
      if (editingId === null) {
        await createEquipment(payload)
      } else {
        await updateEquipment(editingId, payload)
      }
      setModalOpen(false)
      setPage(1)
      setTick((value) => value + 1)
      categoriesQuery.reload()
    } catch (error) {
      const mapped = firstFieldErrors(error)
      setFormErrors(mapped)
      if (!Object.keys(mapped).length) setModalError(toApiError(error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (!window.confirm(`Hapus alat "${equipment.name}"?`)) return
    setEquipmentError(null)
    try {
      await deleteEquipment(equipment.id)
      setTick((value) => value + 1)
    } catch (error) {
      setEquipmentError(toApiError(error).message)
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Kelola Alat &amp; Kategori</h1>
        <p className="muted">Tambahkan, ubah, dan hapus kategori serta alat sewa.</p>
      </div>

      <div className="admin-layout">
        <section className="card category-panel" aria-label="Kelola kategori">
          <h2>Kategori</h2>
          {categoryError && <Alert kind="error">{categoryError}</Alert>}

          <ul className="category-list">
            {categories.map((category) =>
              editingCategoryId === category.id ? (
                <li key={category.id}>
                  <form className="inline-form" onSubmit={handleRenameCategory}>
                    <input
                      className="input"
                      value={editingCategoryName}
                      onChange={(event) => setEditingCategoryName(event.target.value)}
                      required
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={categoryBusy}>
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditingCategoryId(null)}
                    >
                      Batal
                    </button>
                  </form>
                </li>
              ) : (
                <li key={category.id} className="category-row">
                  <span>{category.name}</span>
                  <span className="muted">{category.equipment_count ?? 0} alat</span>
                  <span className="category-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setEditingCategoryId(category.id)
                        setEditingCategoryName(category.name)
                      }}
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      disabled={categoryBusy}
                      onClick={() => void handleDeleteCategory(category)}
                    >
                      Hapus
                    </button>
                  </span>
                </li>
              ),
            )}
            {categories.length === 0 && !categoriesQuery.loadingFirst && (
              <li className="muted">Belum ada kategori.</li>
            )}
          </ul>

          <form className="inline-form" onSubmit={handleAddCategory}>
            <input
              className="input"
              placeholder="Nama kategori baru"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              aria-label="Nama kategori baru"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={categoryBusy}>
              Tambah
            </button>
          </form>

          <h2 className="section-gap">Ringkasan Katalog</h2>
          <p className="muted">
            {equipmentQuery.data?.meta.total ?? 0} alat terdaftar. Kelola daftar alat pada panel di
            samping.
          </p>
        </section>

        <section aria-label="Daftar alat">
          <div className="toolbar">
            <h2>Daftar Alat</h2>
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              Tambah Alat
            </button>
          </div>

          {equipmentError && <Alert kind="error">{equipmentError}</Alert>}
          {equipmentQuery.error && <Alert kind="error">{equipmentQuery.error}</Alert>}

          {equipmentQuery.loadingFirst ? (
            <PageLoader label="Memuat daftar alat..." />
          ) : !equipmentQuery.error && items.length === 0 ? (
            <EmptyState title="Belum ada alat" description="Tambahkan alat pertama Anda." />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table card-table">
                  <thead>
                    <tr>
                      <th scope="col">Alat</th>
                      <th scope="col">Kategori</th>
                      <th scope="col">Harga/hari</th>
                      <th scope="col">Stok</th>
                      <th scope="col" className="text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((equipment) => (
                      <tr key={equipment.id}>
                        <td data-label="Alat">
                          <strong>{equipment.name}</strong>
                        </td>
                        <td data-label="Kategori">{equipment.category?.name ?? '-'}</td>
                        <td data-label="Harga/hari">{formatIDR(equipment.price_per_day)}</td>
                        <td data-label="Stok">{equipment.stock}</td>
                        <td className="text-right row-actions" data-label="Aksi">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditModal(equipment)}
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => void handleDeleteEquipment(equipment)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                lastPage={equipmentQuery.data?.meta.last_page ?? 1}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </div>

      <Modal
        open={modalOpen}
        title={editingId === null ? 'Tambah Alat' : `Ubah Alat #${editingId}`}
        onClose={() => setModalOpen(false)}
      >
        {modalError && <Alert kind="error">{modalError}</Alert>}
        <form onSubmit={handleEquipmentSubmit}>
          <Field label="Kategori" htmlFor="eq-category" error={formErrors.category_id}>
            <select
              id="eq-category"
              className="input"
              value={form.category_id}
              onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nama alat" htmlFor="eq-name" error={formErrors.name}>
            <input
              id="eq-name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              maxLength={255}
            />
          </Field>
          <Field label="Deskripsi" htmlFor="eq-description" error={formErrors.description}>
            <textarea
              id="eq-description"
              className="input"
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </Field>
          <div className="field-grid">
            <Field label="Harga per hari (Rp)" htmlFor="eq-price" error={formErrors.price_per_day}>
              <input
                id="eq-price"
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={form.price_per_day}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price_per_day: event.target.value }))
                }
                required
              />
            </Field>
            <Field label="Stok" htmlFor="eq-stock" error={formErrors.stock}>
              <input
                id="eq-stock"
                className="input"
                type="number"
                min={0}
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
              />
            </Field>
          </div>
          <Field
            label="Foto (path/URL, opsional)"
            htmlFor="eq-photo"
            error={formErrors.photo}
            hint="mis. equipment/tenda-dome.jpg atau URL lengkap."
          >
            <input
              id="eq-photo"
              className="input"
              value={form.photo}
              onChange={(event) => setForm((prev) => ({ ...prev, photo: event.target.value }))}
            />
          </Field>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
