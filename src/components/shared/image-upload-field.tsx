import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ImagePlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const IMAGE_UPLOAD_HINT = 'Format jpg, jpeg, png, atau webp dengan ukuran maksimal 2MB.'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ImageUploadFieldProps {
  label?: string
  file: File | null
  onChange: (file: File | null) => void
  existingUrl?: string | null
  removeExisting?: boolean
  onRemoveExistingChange?: (remove: boolean) => void
  disabled?: boolean
  error?: string | null
}

export function ImageUploadField({
  label = 'Foto',
  file,
  onChange,
  existingUrl = null,
  removeExisting = false,
  onRemoveExistingChange,
  disabled = false,
  error = null,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
    [],
  )

  function openPicker() {
    inputRef.current?.click()
  }

  function replacePreview(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    if (file) {
      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    event.target.value = ''
    setValidationError(null)
    if (!selected) {
      replacePreview(null)
      onChange(null)
      return
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setValidationError('Format file tidak didukung. Gunakan jpg, jpeg, png, atau webp.')
      return
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setValidationError('Ukuran file melebihi batas maksimal 2MB.')
      return
    }
    if (onRemoveExistingChange) onRemoveExistingChange(false)
    replacePreview(selected)
    onChange(selected)
  }

  const shownError = error ?? validationError
  const previewSrc = previewUrl ?? (removeExisting ? null : existingUrl)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div
        className={cn(
          'grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-lg border border-dashed bg-muted/40 sm:aspect-[2/1]',
          shownError && 'border-destructive',
        )}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Pratinjau foto"
            className="h-full w-full object-cover"
            onError={(event) => event.currentTarget.classList.add('hidden')}
          />
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ImagePlusIcon className="size-7" />
            <span className="text-sm font-semibold">Klik untuk memilih gambar</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {file
            ? file.name
            : removeExisting
              ? 'Foto tersimpan akan dihapus saat disimpan.'
              : existingUrl
                ? 'Foto tersimpan sedang dipakai.'
                : IMAGE_UPLOAD_HINT}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openPicker}
            disabled={disabled}
          >
            {previewSrc ? 'Ganti' : 'Pilih Gambar'}
          </Button>
          {(file || previewSrc) && !disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (file) {
                  replacePreview(null)
                  onChange(null)
                  setValidationError(null)
                  return
                }
                if (onRemoveExistingChange) onRemoveExistingChange(true)
              }}
            >
              <Trash2Icon data-icon="inline-start" />
              Hapus
            </Button>
          )}
          {removeExisting && !file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onRemoveExistingChange) onRemoveExistingChange(false)
              }}
            >
              Batalkan
            </Button>
          )}
        </div>
      </div>

      {shownError && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {shownError}
        </p>
      )}
    </div>
  )
}
