import { Children, cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * Satu slot untuk label, kontrol, bantuan, dan error.
 *
 * Kontrol anak otomatis diberi `aria-invalid` dan `aria-describedby` supaya
 * pembaca layar mengaitkan pesan error dengan input yang benar, bukan hanya
 * membacakan teks error yang berdiri sendiri.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  const base = htmlFor
  const hintId = base && hint && !error ? `${base}-hint` : undefined
  const errorId = base && error ? `${base}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const child = Children.only(children)
  const control =
    isValidElement(child) && (errorId || hintId)
      ? cloneElement(child as ReactElement<Record<string, unknown>>, {
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })
      : child

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {hintId && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {errorId && (
        <p
          id={errorId}
          className="font-mono text-[0.6875rem] tracking-[0.14em] text-destructive uppercase"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}