import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlertIcon, ShoppingCartIcon } from 'lucide-react'
import { getEquipment } from '@/api/catalog'
import { createBooking } from '@/api/bookings'
import { firstFieldErrors, toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PageLoader } from '@/components/shared/page-loader'
import { EmptyState } from '@/components/shared/empty-state'
import { EquipmentPhoto } from '@/components/EquipmentCard'
import { useApiQuery } from '@/hooks/useApiQuery'
import { formatIDR, inclusiveDays } from '@/utils/format'
import type { Equipment as EquipmentType } from '@/types'

interface CheckoutState {
  equipmentId: number
  quantity: number
  startDate: string
  endDate: string
}

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as CheckoutState | null

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const equipmentId = state?.equipmentId ?? null
  const detail = useApiQuery<EquipmentType | null>(
    async () => (equipmentId === null ? null : getEquipment(equipmentId)),
    [equipmentId],
  )
  const equipment = detail.data

  if (detail.loadingFirst && equipmentId !== null) {
    return <PageLoader label="Menyiapkan checkout..." />
  }

  if (!state || !equipment) {
    return (
      <EmptyState
        title="Data booking tidak lengkap"
        description="Pilih alat dan rentang tanggal sewa terlebih dahulu dari halaman detail."
        action={
          <Button asChild className="mt-3">
            <Link to="/katalog">Ke Katalog</Link>
          </Button>
        }
      />
    )
  }

  const days = inclusiveDays(state.startDate, state.endDate)
  const total = Number(equipment.price_per_day) * state.quantity * days

  const submitBooking = async () => {
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const booking = await createBooking({
        start_date: state.startDate,
        end_date: state.endDate,
        items: [{ equipment_id: state.equipmentId, quantity: state.quantity }],
      })
      navigate(`/booking/riwayat/${booking.id}`, { state: { justCreated: true }, replace: true })
    } catch (err) {
      const mapped = firstFieldErrors(err)
      setFieldErrors(mapped)
      setError(toApiError(err).message)
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Checkout Booking</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Periksa pesanan Anda sebelum membuat booking.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-bold">Konfirmasi Booking</h2>
            <p className="text-sm text-muted-foreground">
              Setelah booking dibuat, Anda akan diarahkan ke halaman pembayaran untuk melaporkan
              pembayaran dan menunggu verifikasi admin.
            </p>
            {(error || Object.keys(fieldErrors).length > 0) && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{error ?? Object.values(fieldErrors)[0]}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => void submitBooking()}
              className="w-full"
              size="lg"
              disabled={submitting || days === 0}
            >
              <ShoppingCartIcon data-icon="inline-start" />
              {submitting ? 'Membuat booking...' : 'Buat Booking'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Total biaya dihitung otomatis oleh server berdasarkan harga per hari dan durasi sewa.
            </p>
          </CardContent>
        </Card>

        <aside>
          <Card className="lg:sticky lg:top-20">
            <CardContent className="space-y-4">
              <h2 className="font-bold">Ringkasan Pesanan</h2>
              <div className="flex justify-between gap-4">
                <div className="flex items-start gap-3">
                  <EquipmentPhoto
                    equipment={equipment}
                    className="size-14 shrink-0 border border-rule bg-muted"
                  />
                  <div>
                    <strong className="leading-snug">{equipment.name}</strong>
                    {equipment.category && (
                      <span className="mt-1 block w-fit font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
                        {equipment.category.name}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatIDR(equipment.price_per_day)} &times; {state.quantity} unit &times;{' '}
                      {days} hari
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold">{formatIDR(total)}</span>
              </div>
              <Separator />
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tanggal mulai</dt>
                  <dd className="font-semibold">{state.startDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tanggal selesai</dt>
                  <dd className="font-semibold">{state.endDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Durasi</dt>
                  <dd className="font-semibold">{days} hari</dd>
                </div>
              </dl>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-mono text-lg tabular-nums">{formatIDR(total)}</span>
              </div>
              <Link
                to={`/katalog/${equipment.id}`}
                className="block text-sm font-semibold text-primary hover:underline"
              >
                &larr; Ubah tanggal atau jumlah
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
