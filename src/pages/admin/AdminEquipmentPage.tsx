import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  CheckIcon,
  CircleAlertIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createCategory,
  createEquipment,
  deleteCategory,
  deleteEquipment,
  listCategories,
  updateCategory,
  updateEquipment,
} from '@/api/admin'
import { listEquipment } from '@/api/catalog'
import { firstFieldErrors, toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field } from '@/components/shared/form-field'
import { EmptyState } from '@/components/shared/empty-state'
import { DataPagination } from '@/components/shared/data-pagination'
import { PageLoader } from '@/components/shared/page-loader'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { Category, Equipment as EquipmentType, Paginated } from '@/types'
import { formatIDR } from '@/utils/format'

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

interface DeleteTarget {
  kind: 'category' | 'equipment'
  id: number
  name: string
}

export default function AdminEquipmentPage() {
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0)

  const categoriesQuery = useApiQuery<Category[]>(() => listCategories(), [])
  const equipmentQuery = useApiQuery<Paginated<EquipmentType>>(
    () => listEquipment({ page, per_page: 12 }),
    [page, tick],
  )

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EquipmentFormState>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [modalError, setModalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const categories = categoriesQuery.data ?? []
  const items = equipmentQuery.data?.data ?? []

  const refreshAll = () => {
    categoriesQuery.reload()
    setTick((value) => value + 1)
  }

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newCategoryName.trim()) return
    setCategoryBusy(true)
    setCategoryError(null)
    try {
      await createCategory(newCategoryName.trim())
      toast.success(`Kategori "${newCategoryName.trim()}" ditambahkan.`)
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
      toast.success('Kategori diperbarui.')
      setEditingCategoryId(null)
      refreshAll()
    } catch (error) {
      setCategoryError(firstFieldErrors(error).name ?? toApiError(error).message)
    } finally {
      setCategoryBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.kind === 'category') {
        await deleteCategory(deleteTarget.id)
        toast.success(`Kategori "${deleteTarget.name}" dihapus.`)
        refreshAll()
      } else {
        await deleteEquipment(deleteTarget.id)
        toast.success(`Alat "${deleteTarget.name}" dihapus.`)
        setTick((value) => value + 1)
      }
      setDeleteTarget(null)
    } catch (error) {
      if (deleteTarget.kind === 'category') {
        setCategoryError(toApiError(error).message)
      } else {
        toast.error(toApiError(error).message)
      }
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
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

  function openEditModal(equipment: EquipmentType) {
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
        toast.success(`Alat "${payload.name}" ditambahkan.`)
      } else {
        await updateEquipment(editingId, payload)
        toast.success(`Alat "${payload.name}" diperbarui.`)
      }
      setModalOpen(false)
      setPage(1)
      refreshAll()
    } catch (error) {
      const mapped = firstFieldErrors(error)
      setFormErrors(mapped)
      if (!Object.keys(mapped).length) setModalError(toApiError(error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Kelola Alat &amp; Kategori</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Tambahkan, ubah, dan hapus kategori serta alat sewa.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <section aria-label="Kelola kategori">
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                Kategori
              </h2>
              {categoryError && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{categoryError}</AlertDescription>
                </Alert>
              )}

              <ul className="divide-y rounded-lg border">
                {categories.map((category) =>
                  editingCategoryId === category.id ? (
                    <li key={category.id} className="p-2">
                      <form className="flex gap-1.5" onSubmit={handleRenameCategory}>
                        <Input
                          value={editingCategoryName}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                          required
                          autoFocus
                        />
                        <Button type="submit" size="icon-sm" disabled={categoryBusy} aria-label="Simpan">
                          <CheckIcon />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setEditingCategoryId(null)}
                          aria-label="Batal"
                        >
                          &times;
                        </Button>
                      </form>
                    </li>
                  ) : (
                    <li key={category.id} className="group flex items-center gap-2 px-3 py-2 text-sm">
                      <span className="flex-1 font-semibold">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.equipment_count ?? 0} alat
                      </span>
                      <span className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Ubah ${category.name}`}
                          onClick={() => {
                            setEditingCategoryId(category.id)
                            setEditingCategoryName(category.name)
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          disabled={categoryBusy}
                          aria-label={`Hapus ${category.name}`}
                          onClick={() =>
                            setDeleteTarget({ kind: 'category', id: category.id, name: category.name })
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </span>
                    </li>
                  ),
                )}
                {categories.length === 0 && !categoriesQuery.loadingFirst && (
                  <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                    Belum ada kategori.
                  </li>
                )}
              </ul>

              <form className="flex gap-1.5" onSubmit={handleAddCategory}>
                <Input
                  placeholder="Kategori baru"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  aria-label="Nama kategori baru"
                  required
                />
                <Button type="submit" size="sm" disabled={categoryBusy}>
                  <PlusIcon data-icon="inline-start" /> Tambah
                </Button>
              </form>

              <p className="pt-1 text-xs text-muted-foreground">
                {equipmentQuery.data?.meta.total ?? 0} alat terdaftar dalam katalog.
              </p>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Daftar alat">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Daftar Alat</h2>
            <Button size="sm" onClick={openCreateModal}>
              <PlusIcon data-icon="inline-start" /> Tambah Alat
            </Button>
          </div>

          {equipmentQuery.loadingFirst ? (
            <PageLoader label="Memuat daftar alat..." />
          ) : equipmentQuery.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{equipmentQuery.error}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <EmptyState title="Belum ada alat" description="Tambahkan alat pertama Anda." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-muted/60 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                      <th scope="col" className="px-4 py-2.5 font-semibold">Alat</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Kategori</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Harga/hari</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Stok</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((equipment) => (
                      <tr key={equipment.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-2.5 font-semibold">{equipment.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {equipment.category?.name ?? '-'}
                        </td>
                        <td className="px-4 py-2.5">{formatIDR(equipment.price_per_day)}</td>
                        <td className="px-4 py-2.5">{equipment.stock}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(equipment)}>
                              Ubah
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteTarget({
                                  kind: 'equipment',
                                  id: equipment.id,
                                  name: equipment.name,
                                })
                              }
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DataPagination
                page={page}
                lastPage={equipmentQuery.data?.meta.last_page ?? 1}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </div>

      {/* Modal tambah/ubah alat */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId === null ? 'Tambah Alat' : `Ubah Alat #${editingId}`}</DialogTitle>
            <DialogDescription>
              Isi detail alat yang akan disewakan kepada pelanggan.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEquipmentSubmit} className="space-y-4">
            <Field label="Kategori" error={formErrors.category_id}>
              <Select
                value={form.category_id}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category_id: value }))}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nama alat" error={formErrors.name}>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                maxLength={255}
              />
            </Field>
            <Field label="Deskripsi" error={formErrors.description}>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Harga per hari (Rp)" error={formErrors.price_per_day}>
                <Input
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
              <Field label="Stok" error={formErrors.stock}>
                <Input
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
              error={formErrors.photo}
              hint="mis. equipment/tenda-dome.jpg atau URL lengkap."
            >
              <Input
                value={form.photo}
                onChange={(event) => setForm((prev) => ({ ...prev, photo: event.target.value }))}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deleteTarget?.kind === 'category' ? 'kategori' : 'alat'}?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" akan dihapus permanen. Alat dengan riwayat booking atau
              kategori yang masih berisi alat tidak dapat dihapus oleh sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
