import { useCallback, useEffect, useRef, useState } from 'react'
import { checkAvailability } from '../api/catalog'
import type { AvailabilityResult } from '../types'

interface AvailabilityState {
  loading: boolean
  result: AvailabilityResult | null
  error: string | null
}

export function useEquipmentAvailability(equipmentId: number | string) {
  const [state, setState] = useState<AvailabilityState>({
    loading: false,
    result: null,
    error: null,
  })
  const requestIdRef = useRef(0)

  const check = useCallback(
    async (startDate: string, endDate: string, quantity: number) => {
      const requestId = ++requestIdRef.current
      setState({ loading: true, result: null, error: null })
      try {
        const result = await checkAvailability(equipmentId, {
          start_date: startDate,
          end_date: endDate,
          quantity,
        })
        if (requestId === requestIdRef.current) {
          setState({ loading: false, result, error: null })
        }
      } catch (error) {
        if (requestId === requestIdRef.current) {
          setState({
            loading: false,
            result: null,
            error: error instanceof Error ? error.message : 'Gagal memeriksa ketersediaan.',
          })
        }
      }
    },
    [equipmentId],
  )

  const reset = useCallback(() => {
    requestIdRef.current += 1
    setState({ loading: false, result: null, error: null })
  }, [])

  useEffect(() => reset, [reset])

  return { ...state, check, reset }
}
