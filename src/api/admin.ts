import { api } from './client'
import type {
  Booking,
  BookingStatus,
  Category,
  Equipment,
  Paginated,
  Payment,
  PaymentStatus,
} from '../types'

export interface AdminEquipmentPayload {
  category_id: number
  name: string
  description?: string | null
  price_per_day: number | string
  stock: number
  /** File foto baru (jpg/jpeg/png/webp, maks 2MB). */
  photo?: File | null
}

export interface AdminEquipmentUpdatePayload extends Partial<AdminEquipmentPayload> {
  remove_photo?: boolean
}

function toEquipmentFormData(
  payload: AdminEquipmentUpdatePayload,
  { forUpdate }: { forUpdate: boolean },
): FormData {
  const formData = new FormData()
  if (forUpdate) formData.append('_method', 'PUT')
  if (payload.category_id !== undefined)
    formData.append('category_id', String(payload.category_id))
  if (payload.name !== undefined) formData.append('name', payload.name)
  if (payload.description !== undefined)
    formData.append('description', payload.description ?? '')
  if (payload.price_per_day !== undefined)
    formData.append('price_per_day', String(payload.price_per_day))
  if (payload.stock !== undefined) formData.append('stock', String(payload.stock))
  if (payload.photo instanceof File) formData.append('photo', payload.photo)
  if (payload.remove_photo) formData.append('remove_photo', 'true')
  return formData
}

export async function listCategories(): Promise<Category[]> {
  const response = await api.get<{ data: Category[] }>('/admin/categories')
  return response.data.data
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post<{ data: Category }>('/admin/categories', { name })
  return response.data.data
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const response = await api.put<{ data: Category }>(`/admin/categories/${id}`, { name })
  return response.data.data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/admin/categories/${id}`)
}

export async function createEquipment(payload: AdminEquipmentPayload): Promise<Equipment> {
  const response = await api.post<{ data: Equipment }>(
    '/admin/equipment',
    toEquipmentFormData(payload, { forUpdate: false }),
  )
  return response.data.data
}

export async function updateEquipment(
  id: number,
  payload: AdminEquipmentUpdatePayload,
): Promise<Equipment> {
  const response = await api.post<{ data: Equipment }>(
    `/admin/equipment/${id}`,
    toEquipmentFormData(payload, { forUpdate: true }),
  )
  return response.data.data
}

export async function deleteEquipment(id: number): Promise<void> {
  await api.delete(`/admin/equipment/${id}`)
}

export async function listAdminBookings(params: { status?: BookingStatus; page?: number } = {}) {
  const response = await api.get<Paginated<Booking>>('/admin/bookings', { params })
  return response.data
}

export async function confirmPickup(bookingId: number): Promise<Booking> {
  const response = await api.post<{ data: Booking }>(`/admin/bookings/${bookingId}/confirm`)
  return response.data.data
}

export async function processReturn(bookingId: number): Promise<Booking> {
  const response = await api.post<{ data: Booking }>(`/admin/bookings/${bookingId}/return`)
  return response.data.data
}

export async function listAdminPayments(
  params: { status?: PaymentStatus; page?: number } = {},
): Promise<Paginated<Payment>> {
  const response = await api.get<Paginated<Payment>>('/admin/payments', { params })
  return response.data
}

export async function verifyPayment(paymentId: number): Promise<void> {
  await api.post(`/admin/payments/${paymentId}/verify`)
}

export async function rejectPayment(paymentId: number): Promise<void> {
  await api.post(`/admin/payments/${paymentId}/reject`)
}
