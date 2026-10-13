import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CircleAlertIcon,
  MailIcon,
  MapPinIcon,
  MapPinnedIcon,
  PhoneIcon,
  ClockIcon,
  TentIcon,
} from 'lucide-react'
import { listCategoriesForFilter, listEquipment } from '@/api/catalog'
import { getSettings } from '@/api/settings'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/shared/empty-state'
import { LedgerLabel, Rule, Sheet } from '@/components/shared/ledger'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useLedgerDraw } from '@/hooks/useLedgerDraw'
import type { Category, Equipment, Paginated, SiteSettings } from '@/types'
import { formatIDR, resolvePhotoUrl } from '@/utils/format'
import { buildMapsEmbedUrl } from '@/utils/maps'
import { COMPANY_PROFILE } from '@/utils/constants'

const valueProps = [
  {
    title: 'Alat terawat',
    description: 'Setiap tenda disanitasi dan dicek ulang sebelum keluar dari gudang.',
  },
  {
    title: 'Harga transparan',
    description: 'Total biaya dihitung otomatis, jadi tidak ada biaya tersembunyi di akhir.',
  },
  {
    title: 'Tim siap bantu',
    description: 'Hubungi kami lewat telepon atau WhatsApp selama jam operasional.',
  },
] as const

/** Fallback per field ke konstanta, supaya backend yang kosong tidak merusak tampilan. */
function contactValue(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export default function LandingPage() {
  const [heroFailed, setHeroFailed] = useState(false)
  const sheetRef = useLedgerDraw<HTMLDivElement>()

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

  const address = contactValue(settingsQuery.data?.address, COMPANY_PROFILE.address)
  const hours = contactValue(settingsQuery.data?.hours, COMPANY_PROFILE.hours)
  const phone = contactValue(settingsQuery.data?.phone, COMPANY_PROFILE.phone)
  const email = contactValue(settingsQuery.data?.email, COMPANY_PROFILE.email)

  const mapsEmbedUrl = buildMapsEmbedUrl(settingsQuery.data?.maps_query ?? '', address)

  const contactDetails = [
    { icon: MapPinIcon, label: 'Alamat', value: address, href: null },
    { icon: ClockIcon, label: 'Jam operasional', value: hours, href: null },
    { icon: PhoneIcon, label: 'Telepon / WhatsApp', value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` },
    { icon: MailIcon, label: 'Email', value: email, href: `mailto:${email}` },
  ]

  const categories = (categoriesQuery.data ?? []).slice(0, 8)
  const featuredItems = featuredQuery.data?.data ?? []

  return (
    <div ref={sheetRef}>
      <Sheet className="pt-16 pb-14 sm:pt-20 sm:pb-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h1 className="max-w-[20ch] text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.025em] text-balance md:text-5xl lg:text-6xl">
              Sewa alat camping, siap berangkat pagi ini
            </h1>

            <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              Tenda, carrier, sleeping bag, dan perlengkapan outdoor lainnya. Dicek dan
              dibersihkan dulu, lalu bisa langsung Anda bawa.
            </p>

            <div className="-ml-4 mt-9 flex flex-wrap items-center gap-3 sm:-ml-6">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-[2px] px-6 text-base has-data-[icon=inline-end]:pr-6"
              >
                <Link to="/katalog">
                  Lihat Katalog
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-[2px] px-6 text-base has-data-[icon=inline-start]:pl-6"
              >
                <a href="#lokasi">
                  <MapPinnedIcon data-icon="inline-start" />
                  Lihat lokasi
                </a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-rule">
              {showHeroImage ? (
                <img
                  src={heroUrl ?? undefined}
                  alt="Tenda camping siap disewa di Lembang"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
                  onError={() => setHeroFailed(true)}
                />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col justify-between gap-8 p-6 sm:aspect-[16/10] sm:p-8">
                  <TentIcon className="size-8 text-muted-foreground" aria-hidden="true" />
                  <p className="font-mono text-lg tracking-tight text-muted-foreground">
                    {COMPANY_PROFILE.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Sheet>

      <Sheet className="border-t border-rule py-16 md:py-24">
        <div className="grid grid-cols-1 gap-x-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="max-w-[18ch] text-2xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance md:text-3xl">
              Sewa lebih hemat daripada membeli sendiri
            </h2>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
              {COMPANY_PROFILE.description}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Rule />
          {valueProps.map((prop) => (
            <div key={prop.title}>
              <Rule />
              <div className="grid grid-cols-1 gap-x-16 gap-y-2 py-6 lg:grid-cols-12">
                <h3 className="text-base font-semibold lg:col-span-4">{prop.title}</h3>
                <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground lg:col-span-7 lg:col-start-6">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
          <Rule />
        </div>
      </Sheet>

      {categories.length > 0 && (
        <Sheet className="border-t border-rule py-14 md:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
            Cari per kategori
          </h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            Pilih satu kategori untuk langsung menyaring katalog dan mengecek ketersediaan
            untuk tanggal yang Anda rencanakan.
          </p>

          <Rule className="mt-8" />
          <div className="flex flex-wrap">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/katalog?category_id=${category.id}`}
                className={`group flex items-baseline gap-2 py-3.5 pr-6 transition-colors hover:text-primary focus-visible:outline-none ${
                  index > 0 ? 'border-rule sm:border-l sm:pl-6' : ''
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
                {typeof category.equipment_count === 'number' && (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {String(category.equipment_count).padStart(2, '0')}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <Rule />
        </Sheet>
      )}

      <Sheet className="border-t border-rule py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
            Katalog unggulan
          </h2>
          <Button
            variant="link"
            size="sm"
            asChild
            className="h-auto rounded-[2px] p-0 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            <Link to="/katalog">
              Lihat semua
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="mt-10">
          {featuredQuery.loadingFirst ? (
            <div className="space-y-px">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-[5.5rem] rounded-none" />
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
            <div>
              <div className="hidden grid-cols-[1fr_9rem_7rem] gap-6 pb-3 sm:grid">
                <LedgerLabel>Nama alat</LedgerLabel>
                <LedgerLabel className="text-right">Harga / hari</LedgerLabel>
                <LedgerLabel className="text-right">Stok</LedgerLabel>
              </div>
              <Rule />
              {featuredItems.map((equipment) => {
                const photoUrl = resolvePhotoUrl(equipment.photo)
                return (
                  <Link
                    key={equipment.id}
                    to={`/katalog/${equipment.id}`}
                    className="group grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 py-4 transition-colors hover:bg-accent/40 focus-visible:outline-none sm:grid-cols-[3rem_1fr_9rem_7rem] sm:gap-x-6"
                  >
                    <div className="size-12 overflow-hidden border border-rule bg-muted">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={equipment.name}
                          loading="lazy"
                          className="size-full object-cover"
                          onError={(event) => event.currentTarget.classList.add('hidden')}
                        />
                      ) : (
                        <TentIcon className="size-full p-2.5 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">
                        {equipment.name}
                      </p>
                      {equipment.category && (
                        <p className="mt-0.5 font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
                          {equipment.category.name}
                        </p>
                      )}
                    </div>

                    <div className="col-start-3 flex flex-col items-end gap-0.5 sm:contents">
                      <p className="font-mono text-sm tabular-nums sm:text-right">
                        {formatIDR(equipment.price_per_day)}
                      </p>
                      <p
                        className={`font-mono text-xs tabular-nums sm:text-right ${
                          equipment.stock > 0 ? 'text-muted-foreground' : 'text-primary'
                        }`}
                      >
                        {equipment.stock > 0
                          ? `${String(equipment.stock).padStart(2, '0')} tersedia`
                          : 'Kosong'}
                      </p>
                    </div>

                    <Rule className="col-span-full" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </Sheet>

      <Sheet className="border-t border-rule py-16 md:py-24">
        <div id="lokasi" className="scroll-mt-20">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
            Lokasi dan kontak
          </h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            Kunjungi kami di Lembang, Kabupaten Bandung Barat. Telepon atau WhatsApp dulu
            untuk memastikan stok tersedia di tanggal yang Anda rencanakan.
          </p>
        </div>

        <div className="mt-10 border border-rule bg-muted">
          <iframe
            title={`Peta lokasi ${COMPANY_PROFILE.name}`}
            src={mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[340px] w-full bg-muted sm:h-[440px] lg:h-[500px]"
          />
        </div>

        <dl className="mt-10">
          <Rule />
          {contactDetails.map((detail) => (
            <div key={detail.label}>
              <Rule />
              <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8">
                <dt className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
                  <detail.icon className="size-3.5 shrink-0" aria-hidden="true" />
                  {detail.label}
                </dt>
                <dd className="max-w-[52ch] text-sm leading-relaxed">
                  {detail.href ? (
                    <a href={detail.href} className="transition-colors hover:text-primary">
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            </div>
          ))}
          <Rule />
        </dl>
      </Sheet>
    </div>
  )
}