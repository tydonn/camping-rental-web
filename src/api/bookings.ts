import { api } from './client'
import type {
  Booking,
  CreateBookingPayload,
  Paginated,
  Payment,
  ReportPaymentPayload,
} from '../types'

export async function listMyBookings(params: { page?: number; per_page?: number } = {}) {
  const response = await api.get<Paginated<Booking>>('/bookings', { params })
  return response.data
}

export async function getBooking(id: number | string): Promise<Booking> {
  const response = await api.get<{ data: Booking }>(`/bookings/${id}`)
  return response.data.data
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const response = await api.post<{ data: Booking }>('/bookings', payload)
  return response.data.data
}

export async function reportPayment(
  bookingId: number,
  payload: ReportPaymentPayload,
): Promise<Payment> {
  const response = await api.post<{ data: Payment }>(`/bookings/${bookingId}/payments`, payload)
  return response.data.data
}
