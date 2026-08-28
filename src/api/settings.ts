import { api } from './client'
import type { SiteSettings } from '../types'

export async function getSettings(): Promise<SiteSettings> {
  const response = await api.get<{ data: SiteSettings }>('/settings')
  return response.data.data
}

export async function uploadHeroImage(file: File): Promise<SiteSettings> {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await api.post<{ data: SiteSettings }>('/admin/settings/hero-image', formData)
  return response.data.data
}

export async function deleteHeroImage(): Promise<SiteSettings> {
  const response = await api.delete<{ data: SiteSettings }>('/admin/settings/hero-image')
  return response.data.data
}

/** Atur alamat/query lokasi Google Maps pada landing page. */
export async function updateMapsQuery(query: string): Promise<SiteSettings> {
  const response = await api.post<{ data: SiteSettings }>('/admin/settings/maps-query', { query })
  return response.data.data
}

/** Reset lokasi peta ke fallback bawaan aplikasi. */
export async function deleteMapsQuery(): Promise<SiteSettings> {
  const response = await api.delete<{ data: SiteSettings }>('/admin/settings/maps-query')
  return response.data.data
}
