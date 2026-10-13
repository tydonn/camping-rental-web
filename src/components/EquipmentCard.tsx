import { Link } from 'react-router-dom'
import type { Equipment } from '@/types'
import { formatIDR, resolvePhotoUrl } from '@/utils/format'
import { TentIcon } from 'lucide-react'
import { StockBadge } from '@/components/shared/status-badges'

/**
 * Kartu katalog sebagai field ber garis. Tanpa shadow, tanpa hover lift:
 * Elevasi datang dari garis, bukan dari bayangan.
 */
export function EquipmentPhoto({
  equipment,
  className = 'aspect-[4/3]',
}: {
  equipment: Equipment
  className?: string
}) {
  const url = resolvePhotoUrl(equipment.photo)
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-rule-strong ${className}`}
        aria-hidden="true"
      >
        <TentIcon className="size-8 opacity-70" />
      </div>
    )
  }
  return (
    <img
      className={`${className} object-cover`}
      src={url}
      alt={equipment.name}
      loading="lazy"
      onError={(event) => event.currentTarget.classList.add('hidden')}
    />
  )
}

export default function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <Link
      to={`/katalog/${equipment.id}`}
      className="group flex flex-col overflow-hidden border border-rule transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <EquipmentPhoto equipment={equipment} />

      <div className="flex flex-1 flex-col border-t border-rule p-3.5">
        {equipment.category && (
          <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
            {equipment.category.name}
          </p>
        )}
        <h3 className="mt-1 text-sm leading-snug font-medium group-hover:text-primary">
          {equipment.name}
        </h3>

        <p className="mt-3 font-mono text-sm tabular-nums">{formatIDR(equipment.price_per_day)}</p>
        <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
          per hari
        </p>

        <div className="mt-4">
          <StockBadge stock={equipment.stock} />
        </div>
      </div>
    </Link>
  )
}