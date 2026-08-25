import { Link } from 'react-router-dom'
import type { Equipment } from '../types'
import { formatIDR, resolvePhotoUrl } from '../utils/format'

function EquipmentPhoto({ equipment }: { equipment: Equipment }) {
  const url = resolvePhotoUrl(equipment.photo)
  if (!url) {
    return (
      <div className="equipment-photo placeholder" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path
            d="M12 4L3 19h18L12 4zm0 6l4.2 7H7.8L12 10z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }
  return (
    <img
      className="equipment-photo"
      src={url}
      alt={equipment.name}
      loading="lazy"
      onError={(event) => event.currentTarget.classList.add('photo-broken')}
    />
  )
}

export default function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <Link to={`/katalog/${equipment.id}`} className="card equipment-card">
      <EquipmentPhoto equipment={equipment} />
      <div className="equipment-card-body">
        {equipment.category && <span className="chip">{equipment.category.name}</span>}
        <h3>{equipment.name}</h3>
        <p className="equipment-price">{formatIDR(equipment.price_per_day)} / hari</p>
        <span className={`badge ${equipment.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
          {equipment.stock > 0 ? `Stok ${equipment.stock}` : 'Stok habis'}
        </span>
      </div>
    </Link>
  )
}
