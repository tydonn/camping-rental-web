import { Link } from 'react-router-dom'
import type { Equipment } from '@/types'
import { formatIDR, resolvePhotoUrl } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { TentIcon } from 'lucide-react'

export function EquipmentPhoto({
  equipment,
  className = 'aspect-[4/3] rounded-t-xl',
}: {
  equipment: Equipment
  className?: string
}) {
  const url = resolvePhotoUrl(equipment.photo)
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-primary/10 text-primary ${className}`}
        aria-hidden="true"
      >
        <TentIcon className="size-9 opacity-70" />
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
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <EquipmentPhoto equipment={equipment} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {equipment.category && (
          <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
            {equipment.category.name}
          </span>
        )}
        <h3 className="font-semibold leading-snug">{equipment.name}</h3>
        <p className="text-sm font-bold text-primary">
          {formatIDR(equipment.price_per_day)}
          <span className="text-xs font-medium text-muted-foreground"> / hari</span>
        </p>
        <div className="mt-auto pt-2">
          {equipment.stock > 0 ? (
            <Badge variant="secondary" className="bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Stok {equipment.stock}
            </Badge>
          ) : (
            <Badge variant="destructive">Stok habis</Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
