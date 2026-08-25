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
  photo?: string | null
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
  const response = await api.post<{ data: Equipment }>('/admin/equipment', payload)
  return response.data.data
}

export async function updateEquipment(
  id: number,
  payload: Partial<AdminEquipmentPayload>,
): Promise<Equipment> {
  const response = await api.put<{ data: Equipment }>(`/admin/equipment/${id}`, payload)
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
