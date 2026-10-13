import { useState } from 'react'
import { CircleAlertIcon, ClockIcon, ImageIcon, MapPinIcon, PhoneIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteContact,
  deleteHeroImage,
  deleteMapsQuery,
  getSettings,
  updateContact,
  updateMapsQuery,
  uploadHeroImage,
} from '@/api/settings'
import { firstFieldErrors, toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/shared/form-field'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { PageLoader } from '@/components/shared/page-loader'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { ContactSettingsPayload, SiteSettings } from '@/types'
import { resolvePhotoUrl } from '@/utils/format'
import { buildMapsEmbedUrl } from '@/utils/maps'

const CONTACT_FIELDS = ['address', 'phone', 'email', 'hours'] as const
type ContactField = (typeof CONTACT_FIELDS)[number]

const CONTACT_LIMITS: Record<ContactField, number> = {
  address: 255,
  phone: 20,
  email: 255,
  hours: 120,
}

/** Aturan yang mencerminkan validasi backend, agar kesalahan terlihat sebelum dikirim. */
function validateContactField(field: ContactField, raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  if (value.length > CONTACT_LIMITS[field]) {
    return `Maksimal ${CONTACT_LIMITS[field]} karakter.`
  }
  if (field === 'phone' && !/^[0-9+\-\s()]+$/.test(value)) {
    return 'Hanya angka, spasi, dan karakter + - ( ) yang diizinkan.'
  }
  if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Format email tidak valid.'
  }
  return null
}

export default function AdminSettingsPage() {
  const settingsQuery = useApiQuery<SiteSettings>(() => getSettings(), [])

  const [file, setFile] = useState<File | null>(null)
  const [removeCurrent, setRemoveCurrent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)

  const [mapsDraft, setMapsDraft] = useState<string | null>(null)
  const [mapsSaving, setMapsSaving] = useState(false)
  const [mapsError, setMapsError] = useState<string | null>(null)
  const [resetMapsTarget, setResetMapsTarget] = useState(false)

  const [contactDraft, setContactDraft] = useState<ContactSettingsPayload | null>(null)
  const [contactSaving, setContactSaving] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactFieldErrors, setContactFieldErrors] = useState<Partial<Record<ContactField, string>>>({})

  const heroUrl = resolvePhotoUrl(settingsQuery.data?.hero_image ?? null)
  const savedMapsQuery = settingsQuery.data?.maps_query ?? ''
  const mapsQuery = (mapsDraft ?? savedMapsQuery).trim()
  const mapsDirty = mapsDraft !== null && mapsDraft.trim() !== savedMapsQuery.trim()

  const savedContact: Record<ContactField, string> = {
    address: settingsQuery.data?.address ?? '',
    phone: settingsQuery.data?.phone ?? '',
    email: settingsQuery.data?.email ?? '',
    hours: settingsQuery.data?.hours ?? '',
  }

  const contactValue = (field: ContactField) => contactDraft?.[field] ?? savedContact[field]
  const hasSavedContact = CONTACT_FIELDS.some((field) => savedContact[field] !== '')
  const contactDirty =
    contactDraft !== null &&
    CONTACT_FIELDS.some((field) => (contactDraft[field] ?? '') !== savedContact[field])

  /** Peta memakai alamat yang sama dengan yang tampil di bawahnya, dengan urutan: query, address, bawaan. */
  const mapPreviewQuery = buildMapsEmbedUrl(mapsQuery, contactValue('address').trim())

  const resetHeroState = () => {
    setFile(null)
    setRemoveCurrent(false)
    setHeroError(null)
  }

  const handleSaveHero = async () => {
    if (!file && !removeCurrent) return
    setSaving(true)
    setHeroError(null)
    try {
      if (file) {
        await uploadHeroImage(file)
        toast.success('Gambar hero berhasil diperbarui.')
      } else {
        await deleteHeroImage()
        toast.success('Gambar hero dihapus.')
      }
      resetHeroState()
      settingsQuery.reload()
    } catch (err) {
      setHeroError(toApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMaps = async () => {
    if (!mapsDirty || mapsQuery === '') return
    setMapsSaving(true)
    setMapsError(null)
    try {
      await updateMapsQuery(mapsQuery)
      toast.success('Lokasi peta berhasil diperbarui.')
      setMapsDraft(null)
      settingsQuery.reload()
    } catch (err) {
      setMapsError(toApiError(err).message)
    } finally {
      setMapsSaving(false)
    }
  }

  const handleResetMaps = async () => {
    setResetMapsTarget(false)
    setMapsSaving(true)
    setMapsError(null)
    try {
      await deleteMapsQuery()
      toast.success('Lokasi peta direset ke bawaan aplikasi.')
      setMapsDraft(null)
      settingsQuery.reload()
    } catch (err) {
      setMapsError(toApiError(err).message)
    } finally {
      setMapsSaving(false)
    }
  }

  const setContactField = (field: ContactField, value: string) => {
    setContactDraft((prev) => ({ ...(prev ?? {}), [field]: value }))
    setContactFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSaveContact = async () => {
    if (!contactDirty) return

    const nextErrors: Partial<Record<ContactField, string>> = {}
    for (const field of CONTACT_FIELDS) {
      const message = validateContactField(field, contactValue(field))
      if (message) nextErrors[field] = message
    }
    setContactFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setContactError('Periksa kembali kolom yang ditandai.')
      return
    }

    setContactSaving(true)
    setContactError(null)
    try {
      const payload: ContactSettingsPayload = {}
      for (const field of CONTACT_FIELDS) {
        payload[field] = contactValue(field).trim() || null
      }
      await updateContact(payload)
      toast.success('Data kontak berhasil disimpan.')
      setContactDraft(null)
      settingsQuery.reload()
    } catch (err) {
      const fieldErrors = firstFieldErrors(err)
      setContactFieldErrors({
        address: fieldErrors.address,
        phone: fieldErrors.phone,
        email: fieldErrors.email,
        hours: fieldErrors.hours,
      })
      setContactError(toApiError(err).message)
    } finally {
      setContactSaving(false)
    }
  }

  const handleResetContact = async () => {
    setContactSaving(true)
    setContactError(null)
    try {
      await deleteContact()
      toast.success('Data kontak direset ke bawaan aplikasi.')
      setContactDraft(null)
      setContactFieldErrors({})
      settingsQuery.reload()
    } catch (err) {
      setContactError(toApiError(err).message)
    } finally {
      setContactSaving(false)
    }
  }

  if (settingsQuery.loadingFirst) {
    return <PageLoader label="Memuat pengaturan..." />
  }

  const readError = settingsQuery.error

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Pengaturan Situs</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Kelola tampilan global aplikasi seperti gambar hero, lokasi peta, dan data kontak.
        </p>
      </div>

      {readError && (
        <Alert variant="destructive" className="mb-5">
          <CircleAlertIcon />
          <AlertDescription>
            Pengaturan tidak dapat dimuat: {readError} Form di bawah mungkin belum akurat.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" /> Hero Landing Page
              </CardTitle>
              <CardDescription>
                Gambar ini tampil besar di halaman utama. Jika tidak ada, halaman utama
                menampilkan bidang kosong ber garis berisi nama toko.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroError && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{heroError}</AlertDescription>
                </Alert>
              )}

              <ImageUploadField
                label="Gambar hero"
                file={file}
                onChange={setFile}
                existingUrl={heroUrl}
                removeExisting={removeCurrent}
                onRemoveExistingChange={setRemoveCurrent}
                disabled={saving}
              />

              <Separator />

              <div className="flex flex-wrap justify-end gap-2">
                {(heroUrl || file) && !removeCurrent && !file && (
                  <span className="mr-auto self-center text-xs text-muted-foreground">
                    Tekan &ldquo;Hapus&rdquo; untuk menandai gambar saat ini agar dihapus.
                  </span>
                )}
                <Button
                  onClick={() => void handleSaveHero()}
                  disabled={saving || (!file && !removeCurrent)}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="size-5 text-primary" /> Peta Lokasi
              </CardTitle>
              <CardDescription>
                Query ini dipakai untuk embed Google Maps. Boleh berupa nama tempat terkenal.
                Kalau dikosongkan, peta memakai kolom Alamat di bawah, lalu alamat bawaan aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mapsError && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{mapsError}</AlertDescription>
                </Alert>
              )}

              <Field label="Query lokasi" htmlFor="maps-query" hint="Maksimal 255 karakter.">
                <Input
                  id="maps-query"
                  type="text"
                  placeholder={savedMapsQuery ? undefined : 'Kosongkan untuk memakai alamat di bawah'}
                  value={mapsDraft ?? savedMapsQuery}
                  onChange={(event) => setMapsDraft(event.target.value)}
                  maxLength={255}
                  disabled={mapsSaving}
                />
              </Field>

              <div className="space-y-3 pt-1">
                <iframe
                  title="Pratinjau peta lokasi"
                  src={mapPreviewQuery}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="h-60 w-full border border-rule bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Pratinjau menampilkan{' '}
                  <strong className="text-foreground">
                    {mapsQuery || contactValue('address').trim() || 'alamat bawaan'}
                  </strong>
                  .
                </p>
              </div>

              <Separator />

              <div className="flex flex-wrap justify-end gap-2">
                {savedMapsQuery !== '' && (
                  <>
                    <span className="mr-auto self-center text-xs text-muted-foreground">
                      Saat ini memakai query kustom.
                    </span>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setResetMapsTarget(true)}
                      disabled={mapsSaving}
                    >
                      Reset ke Bawaan
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => void handleSaveMaps()}
                  disabled={mapsSaving || !mapsDirty || mapsQuery === ''}
                >
                  {mapsSaving ? 'Menyimpan...' : 'Simpan Peta'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIcon className="size-5 text-primary" /> Kontak
              </CardTitle>
              <CardDescription>
                Data ini tampil di bawah peta pada halaman utama. Kosongkan kolom yang tidak
                dipakai untuk kembali ke nilai bawaan aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactError && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{contactError}</AlertDescription>
                </Alert>
              )}

              <Field
                label="Alamat"
                htmlFor="contact-address"
                error={contactFieldErrors.address}
                hint="Ditampilkan di bawah peta. Maksimal 255 karakter."
              >
                <Input
                  id="contact-address"
                  type="text"
                  placeholder={savedContact.address || 'Alamat bawaan aplikasi'}
                  value={contactValue('address')}
                  onChange={(event) => setContactField('address', event.target.value)}
                  maxLength={CONTACT_LIMITS.address}
                  disabled={contactSaving}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Telepon / WhatsApp"
                  htmlFor="contact-phone"
                  error={contactFieldErrors.phone}
                  hint="Maksimal 20 karakter."
                >
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder={savedContact.phone || 'Bawaan aplikasi'}
                    value={contactValue('phone')}
                    onChange={(event) => setContactField('phone', event.target.value)}
                    maxLength={CONTACT_LIMITS.phone}
                    disabled={contactSaving}
                  />
                </Field>

                <Field label="Email" htmlFor="contact-email" error={contactFieldErrors.email}>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder={savedContact.email || 'Bawaan aplikasi'}
                    value={contactValue('email')}
                    onChange={(event) => setContactField('email', event.target.value)}
                    maxLength={CONTACT_LIMITS.email}
                    disabled={contactSaving}
                  />
                </Field>
              </div>

              <Field
                label="Jam operasional"
                htmlFor="contact-hours"
                error={contactFieldErrors.hours}
                hint="Teks bebas, maksimal 120 karakter."
              >
                <Input
                  id="contact-hours"
                  type="text"
                  placeholder={savedContact.hours || 'Bawaan aplikasi'}
                  value={contactValue('hours')}
                  onChange={(event) => setContactField('hours', event.target.value)}
                  maxLength={CONTACT_LIMITS.hours}
                  disabled={contactSaving}
                />
              </Field>

              <Separator />

              <div className="flex flex-wrap justify-end gap-2">
                {hasSavedContact && (
                  <>
                    <span className="mr-auto self-center text-xs text-muted-foreground">
                      Tekan Reset untuk mengosongkan dan kembali ke bawaan aplikasi.
                    </span>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleResetContact()}
                      disabled={contactSaving}
                    >
                      Reset ke Bawaan
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => void handleSaveContact()}
                  disabled={contactSaving || !contactDirty}
                >
                  {contactSaving ? 'Menyimpan...' : 'Simpan Kontak'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <h2 className="font-bold text-foreground">Ketentuan gambar</h2>
              <ul className="list-disc space-y-1 pl-4">
                <li>Format jpg, jpeg, png, atau webp.</li>
                <li>Ukuran maksimal 2MB.</li>
                <li>Disarankan rasio lebar (mis. 16:9) agar pas di semua layar.</li>
                <li>Gambar lama otomatis terhapus dari server saat diganti atau dihapus.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-5">
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <h2 className="font-bold text-foreground">Tips alamat peta</h2>
              <ul className="list-disc space-y-1 pl-4">
                <li>Sertakan nama jalan, nomor, kota agar pin akurat.</li>
                <li>Boleh juga nama tempat terkenal, mis. &ldquo;Tangkuban Perahu&rdquo;.</li>
                <li>Tekan Reset jika ingin kembali ke alamat bawaan.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-5">
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <ClockIcon className="size-4" /> Urutan data lokasi
              </h2>
              <ul className="list-disc space-y-1 pl-4">
                <li>Peta memakai Query lokasi bila diisi.</li>
                <li>Jika kosong, peta memakai kolom Alamat.</li>
                <li>Jika keduanya kosong, memakai bawaan aplikasi.</li>
              </ul>
              <p className="pt-1 text-xs">
                Kolom Alamat di bawah peta ditulis dari kolom Alamat pada card Kontak, jadi
                keduanya tidak akan berbeda.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <AlertDialog open={resetMapsTarget} onOpenChange={setResetMapsTarget}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset lokasi peta?</AlertDialogTitle>
            <AlertDialogDescription>
              Query lokasi kustom akan dihapus. Peta akan memakai kolom Alamat pada card Kontak,
              atau alamat bawaan aplikasi bila Alamat juga kosong.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={mapsSaving}
              onClick={(event) => {
                event.preventDefault()
                void handleResetMaps()
              }}
            >
              {mapsSaving ? 'Mereset...' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}