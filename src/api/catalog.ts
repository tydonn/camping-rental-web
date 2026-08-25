import { api } from './client'
import type {
  AvailabilityQuery,
  AvailabilityResult,
  Category,
  Equipment,
  EquipmentFilters,
  Paginated,
} from '../types'

interface PaginationParams extends Record<string, unknown> {
  page?: number
  per_page?: number
}

export async function listEquipment(
  filters: EquipmentFilters & PaginationParams = {},
): Promise<Paginated<Equipment>> {
  const response = await api.get<Paginated<Equipment>>('/equipment', { params: filters })
  return response.data
}

export async function getEquipment(id: number | string): Promise<Equipment> {
  const response = await api.get<{ data: Equipment }>(`/equipment/${id}`)
  return response.data.data
}

export async function checkAvailability(
  equipmentId: number | string,
  query: AvailabilityQuery,
): Promise<AvailabilityResult> {
  const response = await api.get<{ data: AvailabilityResult }>(
    `/equipment/${equipmentId}/availability`,
    { params: query },
  )
  return response.data.data
}

async function listAdminCategories(): Promise<Category[]> {
  const response = await api.get<{ data: Category[] }>('/admin/categories')
  return response.data.data
}

async function deriveCategoriesFromEquipment(): Promise<Category[]> {
  const page = await listEquipment({ per_page: 100 })
  const unique = new Map<number, Category>()
  for (const item of page.data) {
    if (item.category) {
      unique.set(item.category.id, { id: item.category.id, name: item.category.name })
    }
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export async function listCategoriesForFilter(): Promise<Category[]> {
  try {
    return await listAdminCategories()
  } catch (error) {
    if (
      error instanceof Error &&
      'status' in error &&
      [401, 403, 404].includes((error as { status?: number }).status ?? 0)
    ) {
      return deriveCategoriesFromEquipment()
    }
    throw error
  }
}
