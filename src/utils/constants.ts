import type { PaymentMethod } from '../types'

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: 'Transfer Bank',
  qris: 'QRIS',
  cash: 'Tunai',
}

export const COMPANY_PROFILE = {
  name: 'Berkah Alam Outdoor Organizer',
  address: 'Jl. Raya Lembang No. 88, Lembang, Kabupaten Bandung Barat, Jawa Barat 40391',
  phone: '+62 812-3456-7890',
  email: 'halo@campingrental.id',
  hours: 'Setiap hari, 08.00 - 20.00 WIB',
  description:
    'Berkah Alam Outdoor Organizer adalah penyedia jasa sewa alat outdoor di Lembang, Bandung. Sejak 2019 kami membantu ribuan penyewa menikmati alam tanpa perlu membeli perlengkapan mahal. Semua alat kami rawat, bersihkan, dan cek kesiapannya sebelum tiap peminjaman.',
} as const

