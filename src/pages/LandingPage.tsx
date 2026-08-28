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
      <section
        className="relative isolate flex min-h-[70vh] items-center overflow-hidden pt-10 sm:min-h-[82vh] sm:pt-12 lg:min-h-[90vh]"
        aria-label="Beranda"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-gradient-to-br from-primary via-emerald-600 to-teal-700"
        />
        {!showHeroImage && (
          <TentIcon
            aria-hidden="true"
            className="absolute -bottom-12 -right-8 -z-10 size-64 rotate-6 text-white/15 sm:size-96"
          />
        )}
        {showHeroImage && (
          <>
            <img
              src={heroUrl ?? undefined}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              onError={() => setHeroFailed(true)}
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
          </>
        )}

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex max-w-2xl flex-col items-start gap-4 py-20 text-white sm:gap-5 sm:py-28">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
              Sewa alat camping mudah &amp; cepat
            </span>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              Petualangan Alam Dimulai dari Perlengkapan yang Tepat
            </h1>
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">
              Tenda, carrier, sleeping bag, hingga perlengkapan outdoor lainnya siap disewa dengan
              harga bersahabat. Booking online, bayar, lalu ambil di lokasi &mdash; kami urus
              sisanya.
            </p>
            <Button size="lg" asChild className="mt-2">
              <Link to="/katalog">
                Lihat Katalog
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
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
