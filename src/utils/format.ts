const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatIDR(value: string | number): string {
  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) return '-'
  return idrFormatter.format(numeric)
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseDateOnly(value.slice(0, 10)))
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatRange(start: string, end: string): string {
  return `${formatDate(start)} \u2013 ${formatDate(end)}`
}

export function todayISO(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseDateOnly(iso)
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function inclusiveDays(startISO: string, endISO: string): number {
  const start = parseDateOnly(startISO).getTime()
  const end = parseDateOnly(endISO).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0
  return Math.round((end - start) / 86_400_000) + 1
}

export function resolvePhotoUrl(photo: string | null): string | null {
  if (!photo) return null
  if (/^https?:\/\//i.test(photo)) return photo
  return `/storage/${photo.replace(/^\/+/, '')}`
}
