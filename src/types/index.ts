export type UserRole = 'admin' | 'pelanggan'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Category {
  id: number
  name: string
  equipment_count?: number
}

export interface Equipment {
  id: number
  category?: Pick<Category, 'id' | 'name'> | null
  name: string
  description: string | null
  price_per_day: string
  stock: number
  photo: string | null
}

export type EquipmentSortField = 'name' | 'price_per_day'
export type SortDirection = 'asc' | 'desc'

export interface EquipmentFilters {
  search?: string
  category_id?: number
  available_only?: boolean
  sort_by?: EquipmentSortField
  sort_dir?: SortDirection
  page?: number
  per_page?: number
}

export interface AvailabilityResult {
  equipment_id: number
  name: string
  start_date: string
  end_date: string
  stock: number
  booked: number
  requested_quantity: number
  available: number
  is_available: boolean
}

export interface AvailabilityQuery {
  start_date: string
  end_date: string
  quantity?: number
}

export type BookingStatus = 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled'

export type PaymentMethod = 'transfer' | 'qris' | 'cash'

export type PaymentStatus = 'pending' | 'verified' | 'rejected'

export interface BookingItem {
  id: number
  equipment?: Equipment
  equipment_id: number
  quantity: number
  subtotal: string
}

export interface Booking {
  id: number
  user_id: number
  start_date: string
  end_date: string
  duration_days: number
  status: BookingStatus
  total_amount: string
  items: BookingItem[]
  /** Riwayat laporan pembayaran, diurutkan terbaru dulu oleh API */
  payments?: Payment[]
  created_at: string
}

export interface CreateBookingItem {
  equipment_id: number
  quantity: number
}

export interface CreateBookingPayload {
  start_date: string
  end_date: string
  items: CreateBookingItem[]
}

export interface Payment {
  id: number
  booking_id: number
  method: PaymentMethod
  status: PaymentStatus
  note: string | null
  amount: string
  paid_at: string | null
  verified_at: string | null
  verifier?: User
}

export interface ReportPaymentPayload {
  method: PaymentMethod
  note?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}
