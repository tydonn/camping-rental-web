import { COMPANY_PROFILE } from './constants'

export function buildMapsEmbedUrl(query: string): string {
  const effective = query.trim() || COMPANY_PROFILE.address
  return `https://www.google.com/maps?q=${encodeURIComponent(effective)}&output=embed`
}
