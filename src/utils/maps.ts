import { COMPANY_PROFILE } from './constants'

/**
 * `fallbackAddress` dipakai supaya peta tidak pernah mengarah ke lokasi yang
 * berbeda dari alamat yang ditulis di bawahnya. Urutannya: maps_query, lalu
 * alamat dari backend, baru nilai bawaan aplikasi.
 */
export function buildMapsEmbedUrl(query: string, fallbackAddress?: string | null): string {
  const effective = query.trim() || fallbackAddress?.trim() || COMPANY_PROFILE.address
  return `https://www.google.com/maps?q=${encodeURIComponent(effective)}&output=embed`
}