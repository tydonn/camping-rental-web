import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CircleAlertIcon,
  ClockIcon,
  LifeBuoyIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SparklesIcon,
  TentIcon,
} from 'lucide-react'
import { listCategoriesForFilter, listEquipment } from '@/api/catalog'
import { getSettings } from '@/api/settings'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import EquipmentCard from '@/components/EquipmentCard'
import { EmptyState } from '@/components/shared/empty-state'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { Category, Equipment, Paginated, SiteSettings } from '@/types'
import { resolvePhotoUrl } from '@/utils/format'
import { buildMapsEmbedUrl } from '@/utils/maps'
import { COMPANY_PROFILE } from '@/utils/constants'

const valueProps = [
  {
    icon: SparklesIcon,
    title: 'Alat Terawat',
    description: 'Disanitasi dan dicek kesiapannya sebelum tiap peminjaman.',
  },
  {
    icon: BadgeCheckIcon,
    title: 'Harga Transparan',
    description: 'Total biaya dihitung otomatis tanpa biaya tersembunyi.',
  },
  {
    icon: LifeBuoyIcon,
    title: 'Tim Siap Bantu',
    description: 'Respon cepat melalui telepon maupun pesan selama jam operasional.',
  },
] as const

export default function LandingPage() {
  const [heroFailed, setHeroFailed] = useState(false)

  const settingsQuery = useApiQuery<SiteSettings>(() => getSettings(), [])
  const categoriesQuery = useApiQuery<Category[]>(
    () => listCategoriesForFilter().catch(() => [] as Category[]),
    [],
  )
  const featuredQuery = useApiQuery<Paginated<Equipment>>(
    () => listEquipment({ per_page: 8 }),
    [],
  )

  const heroUrl = resolvePhotoUrl(settingsQuery.data?.hero_image ?? null)
  const showHeroImage = Boolean(heroUrl) && !heroFailed
  const mapsEmbedUrl = buildMapsEmbedUrl(settingsQuery.data?.maps_query ?? '')
  const categories = (categoriesQuery.data ?? []).slice(0, 8)
  const featuredItems = featuredQuery.data?.data ?? []

  return (
    <div>
      <section className="relative isolate flex flex-col overflow-hidden bg-background" aria-label="Beranda">
        <div className="flex flex-1 items-center">
          <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="relative isolate flex items-center justify-center overflow-visible px-4 pb-6 sm:px-6 lg:order-1 lg:px-8 lg:py-12 xl:pr-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 size-72 rounded-full bg-primary/20 blur-3xl lg:size-80 -right-6 -top-6"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 size-72 rounded-full bg-primary/20 blur-3xl lg:size-80 -bottom-6 -left-6"
              />
              <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-border">
                <div className="aspect-square w-full bg-muted">
                  {showHeroImage ? (
                    <img
                      src={heroUrl ?? undefined}
                      alt="Hero camping"
                      className="h-full w-full object-cover object-center"
                      onError={() => setHeroFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <TentIcon aria-hidden="true" className="size-24 rotate-6 text-muted-foreground/30 sm:size-32" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:order-2 lg:justify-center lg:px-12 lg:py-20 xl:px-16">
              <div className="flex w-full max-w-[520px] flex-col items-start justify-center gap-5 py-4 lg:py-0">
                <span className="rounded-full border bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Sewa alat camping mudah &amp; cepat
                </span>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  PETUALANGAN ALAM DIMULAI DARI PERLENGKAPAN YANG TEPAT
                </h1>
                <p className="text-md leading-relaxed text-muted-foreground">
                  Tenda, carrier, sleeping bag, hingga perlengkapan outdoor lainnya siap disewa
                  dengan harga bersahabat. Booking online, bayar, lalu ambil di lokasi — kami
                  urus sisanya.
                </p>
                <Button size="lg" asChild className="mt-1">
                  <Link to="/katalog">
                    Lihat Katalog
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/40">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-xs font-semibold text-muted-foreground sm:justify-between sm:px-6 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheckIcon className="size-4 text-primary" aria-hidden="true" /> 500+ Penyewa Puas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <SparklesIcon className="size-4 text-primary" aria-hidden="true" /> Alat Terawat &amp; Bersih
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-4 text-primary" aria-hidden="true" /> Booking Online 24 Jam
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LifeBuoyIcon className="size-4 text-primary" aria-hidden="true" /> Support Cepat
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-14 px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <section aria-label="Tentang kami">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary dark:bg-primary/15">
                Tentang Kami
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {COMPANY_PROFILE.name} &mdash; Rekan Petualangan Anda di Lembang
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {COMPANY_PROFILE.description}
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {valueProps.map((prop) => (
                  <li key={prop.title} className="rounded-xl border bg-card p-4 shadow-sm">
                    <prop.icon className="size-5 text-primary" aria-hidden="true" />
                    <h3 className="mt-2 text-sm font-bold">{prop.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {prop.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-3.5 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">Alamat</h3>
                      <p className="mt-0.5 leading-relaxed text-muted-foreground">
                        {COMPANY_PROFILE.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClockIcon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">Jam Operasional</h3>
                      <p className="mt-0.5 text-muted-foreground">{COMPANY_PROFILE.hours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">Telepon / WhatsApp</h3>
                      <a
                        href={`tel:${COMPANY_PROFILE.phone.replace(/[^+\d]/g, '')}`}
                        className="mt-0.5 block text-muted-foreground hover:text-primary hover:underline"
                      >
                        {COMPANY_PROFILE.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MailIcon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">Email</h3>
                      <a
                        href={`mailto:${COMPANY_PROFILE.email}`}
                        className="mt-0.5 block text-muted-foreground hover:text-primary hover:underline"
                      >
                        {COMPANY_PROFILE.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <iframe
                title={`Peta lokasi ${COMPANY_PROFILE.name}`}
                src={mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-64 w-full rounded-xl border bg-muted shadow-sm sm:h-72"
              />
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section aria-label="Kategori populer">
            <h2 className="mb-3 text-lg font-extrabold tracking-tight">Kategori Populer</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/katalog?category_id=${category.id}`}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-label="Katalog unggulan">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">Katalog Unggulan</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/katalog">
                Lihat Semua
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {featuredQuery.loadingFirst ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : featuredQuery.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{featuredQuery.error}</AlertDescription>
            </Alert>
          ) : featuredItems.length === 0 ? (
            <EmptyState
              title="Katalog masih kosong"
              description="Alat sewa akan tampil di sini setelah ditambahkan admin."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredItems.map((equipment) => (
                <EquipmentCard key={equipment.id} equipment={equipment} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
