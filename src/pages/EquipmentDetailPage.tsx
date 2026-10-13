import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarCheckIcon, CircleAlertIcon, InfoIcon } from 'lucide-react'
import { getEquipment } from '@/api/catalog'
import { useAuth } from '@/hooks/useAuth'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useEquipmentAvailability } from '@/hooks/useEquipmentAvailability'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field } from '@/components/shared/form-field'
import { EmptyState } from '@/components/shared/empty-state'
import { StockBadge } from '@/components/shared/status-badges'
import { EquipmentPhoto } from '@/components/EquipmentCard'
import { addDaysISO, formatIDR, inclusiveDays, todayISO } from '@/utils/format'
import type { AvailabilityResult, Equipment as EquipmentType } from '@/types'

interface CheckoutState {
  equipmentId: number
  quantity: number
  startDate: string
  endDate: string
}

function AvailabilityPanel({ result }: { result: AvailabilityResult }) {
  return (
    <div className="space-y-3">
      {result.is_available ? (
        <Alert variant="success">
          <AlertDescription>
            Tersedia! Sisa <strong>{result.available}</strong> unit untuk rentang tanggal ini.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="warning">
          <InfoIcon />
          <AlertDescription>
            Stok tidak cukup ({result.available} unit tersisa). Silakan pilih jumlah lebih kecil
            atau rentang tanggal lain.
          </AlertDescription>
        </Alert>
      )}
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['Total stok', String(result.stock)],
          ['Sudah dibooking', String(result.booked)],
          ['Tersedia', String(result.available)],
        ].map(([label, value]) => (
          <div key={label} className="border-b border-rule pb-2">
            <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function EquipmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const detail = useApiQuery<EquipmentType>(() => getEquipment(id ?? ''), [id])
  const equipment = detail.data

  const today = todayISO()
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(addDaysISO(today, 1))
  const [quantity, setQuantity] = useState(1)

  const availability = useEquipmentAvailability(id ?? '')

  function handleStartChange(value: string) {
    setStartDate(value)
    if (value > endDate) setEndDate(addDaysISO(value, 1))
    availability.reset()
  }

  function handleEndChange(value: string) {
    setEndDate(value < startDate ? startDate : value)
    availability.reset()
  }

  function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void availability.check(startDate, endDate, quantity)
  }

  function handleBook() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    navigate('/booking/checkout', {
      state: { equipmentId: Number(id), quantity, startDate, endDate } satisfies CheckoutState,
    })
  }

  if (detail.loadingFirst) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr_300px]">
        <div className="aspect-[4/3] animate-pulse rounded-[2px] bg-muted" />
        <div className="space-y-4 py-2">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-20 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded-[2px] bg-muted" />
      </div>
    )
  }

  if (detail.error || !equipment) {
    return (
      <EmptyState
        title="Alat tidak ditemukan"
        description={detail.error ?? 'Alat yang Anda cari tidak tersedia.'}
        action={
          <Button asChild className="mt-3">
            <Link to="/katalog">Kembali ke katalog</Link>
          </Button>
        }
      />
    )
  }

  const days = inclusiveDays(startDate, endDate)
  const maxQuantity = Math.max(equipment.stock, 1)
  const canBook =
    availability.result?.is_available === true && quantity <= availability.result.available

  return (
    <div>
      <nav
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/katalog" className="hover:text-foreground hover:underline">
          Katalog
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-foreground">{equipment.name}</span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_1fr_300px]">
        <Card className="overflow-hidden p-2.5">
          <EquipmentPhoto equipment={equipment} className="aspect-[4/3]" />
        </Card>

        <div>
          {equipment.category && (
            <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
              {equipment.category.name}
            </span>
          )}
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">{equipment.name}</h1>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatIDR(equipment.price_per_day)}
            <span className="text-sm font-medium text-muted-foreground"> / hari</span>
          </p>
          <div className="mt-3">
            <StockBadge stock={equipment.stock} />
          </div>
          {equipment.description && (
            <div className="mt-5 border-t pt-5">
              <h2 className="text-base font-bold">Deskripsi</h2>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{equipment.description}</p>
            </div>
          )}
        </div>

        <Card className="lg:sticky lg:top-20">
          <CardContent className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold">
              <CalendarCheckIcon className="size-4.5 text-primary" /> Cek Ketersediaan
            </h2>
            <form onSubmit={handleCheck} className="space-y-3.5">
              <Field label="Tanggal mulai" htmlFor="start-date">
                <Input
                  id="start-date"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(event) => handleStartChange(event.target.value)}
                  required
                />
              </Field>
              <Field label="Tanggal selesai" htmlFor="end-date">
                <Input
                  id="end-date"
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(event) => handleEndChange(event.target.value)}
                  required
                />
              </Field>
              <p className="-mt-1 text-xs text-muted-foreground">Durasi sewa: {days} hari</p>
              <Field label="Jumlah" htmlFor="quantity">
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(event) => {
                    const value = Math.max(1, Math.min(maxQuantity, Number(event.target.value)))
                    setQuantity(value)
                    availability.reset()
                  }}
                  required
                />
              </Field>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={availability.loading || days === 0}
              >
                {availability.loading ? 'Memeriksa...' : 'Cek Ketersediaan'}
              </Button>
            </form>

            <div aria-live="polite" className="space-y-3">
              {availability.error && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{availability.error}</AlertDescription>
                </Alert>
              )}
              {availability.result && (
                <AvailabilityPanel result={availability.result} />
              )}
              {!availability.result && !availability.error && (
                <p className="text-center text-xs text-muted-foreground">
                  Lakukan pengecekan ketersediaan terlebih dahulu.
                </p>
              )}
              {availability.result && (
                <p className="text-center text-xs text-muted-foreground">
                  Estimasi biaya:{' '}
                  <strong className="text-foreground">
                    {formatIDR(Number(equipment.price_per_day) * quantity * days)}
                  </strong>
                </p>
              )}
            </div>

            <Button className="w-full" disabled={!canBook} onClick={handleBook}>
              {user ? 'Booking Sekarang' : 'Masuk untuk Booking'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
