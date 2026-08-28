import { useState } from 'react'
import { CircleAlertIcon, ImageIcon, MapPinIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteHeroImage,
  deleteMapsQuery,
  getSettings,
  updateMapsQuery,
  uploadHeroImage,
} from '@/api/settings'
import { toApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { PageLoader } from '@/components/shared/page-loader'
import { useApiQuery } from '@/hooks/useApiQuery'
import type { SiteSettings } from '@/types'
import { resolvePhotoUrl } from '@/utils/format'
import { buildMapsEmbedUrl } from '@/utils/maps'

export default function AdminSettingsPage() {
  const settingsQuery = useApiQuery<SiteSettings>(() => getSettings(), [])

  const [file, setFile] = useState<File | null>(null)
  const [removeCurrent, setRemoveCurrent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mapsDraft, setMapsDraft] = useState<string | null>(null)
  const [mapsSaving, setMapsSaving] = useState(false)

  const heroUrl = resolvePhotoUrl(settingsQuery.data?.hero_image ?? null)
  const savedMapsQuery = settingsQuery.data?.maps_query ?? ''
  const mapsQuery = (mapsDraft ?? savedMapsQuery).trim()
  const mapsDirty = mapsDraft !== null && mapsDraft.trim() !== savedMapsQuery.trim()

  const resetLocalState = () => {
    setFile(null)
    setRemoveCurrent(false)
    setError(null)
  }

  const handleSaveHero = async () => {
    if (!file && !removeCurrent) return
    setSaving(true)
    setError(null)
    try {
      if (file) {
        await uploadHeroImage(file)
        toast.success('Gambar hero berhasil diperbarui.')
      } else {
        await deleteHeroImage()
        toast.success('Gambar hero dihapus.')
      }
      resetLocalState()
      settingsQuery.reload()
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMaps = async () => {
    if (!mapsDirty || mapsQuery === '') return
    setMapsSaving(true)
    setError(null)
    try {
      await updateMapsQuery(mapsQuery)
      toast.success('Lokasi peta berhasil diperbarui.')
      setMapsDraft(null)
      settingsQuery.reload()
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setMapsSaving(false)
    }
  }

  const handleResetMaps = async () => {
    setMapsSaving(true)
    setError(null)
    try {
      await deleteMapsQuery()
      toast.success('Lokasi peta direset ke bawaan aplikasi.')
      setMapsDraft(null)
      settingsQuery.reload()
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setMapsSaving(false)
    }
  }

  if (settingsQuery.loadingFirst) {
    return <PageLoader label="Memuat pengaturan..." />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Pengaturan Situs</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Kelola tampilan global aplikasi seperti gambar hero dan lokasi peta.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" /> Hero Landing Page
              </CardTitle>
              <CardDescription>
                Gambar ini tampil besar di halaman utama. Jika tidak ada, sistem memakai gradasi
                warna dengan ikon tenda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{error}</AlertDescription>
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
                Alamat ini dipakai untuk embed Google Maps pada bagian company profile landing
                page. Kosongkan/reset untuk memakai alamat bawaan aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-2.5">
                <span className="mb-1 block text-sm font-medium leading-none">
                  Alamat / query lokasi
                </span>
                <Input
                  type="text"
                  placeholder={savedMapsQuery ? undefined : 'Alamat bawaan aplikasi'}
                  value={mapsDraft ?? savedMapsQuery}
                  onChange={(event) => setMapsDraft(event.target.value)}
                  maxLength={255}
                  disabled={mapsSaving}
                />
                <span className="block text-xs text-muted-foreground">
                  Maksimal 255 karakter. Contoh: Jl. Raya Lembang No. 88, Bandung Barat.
                </span>
              </label>

              <div className="space-y-3 pt-1">
                <iframe
                  title="Pratinjau peta lokasi"
                  src={buildMapsEmbedUrl(mapsQuery)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="h-60 w-full rounded-xl border bg-muted shadow-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Pratinjau menampilkan{' '}
                  <strong className="text-foreground">{mapsQuery || 'alamat bawaan'}</strong>.
                </p>
              </div>

              <Separator />

              <div className="flex flex-wrap justify-end gap-2">
                {savedMapsQuery !== '' && (
                  <>
                    <span className="mr-auto self-center text-xs text-muted-foreground">
                      Saat ini memakai alamat kustom.
                    </span>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleResetMaps()}
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
        </aside>
      </div>
    </div>
  )
}
