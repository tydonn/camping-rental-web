import type { PaymentMethod } from '../types'

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: 'Transfer Bank',
  qris: 'QRIS',
  cash: 'Tunai',
}
