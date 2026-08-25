import { useCallback, useEffect, useRef, useState } from 'react'
import { toApiError } from '../api/client'

export interface ApiQueryResult<T> {
  data: T | null
  error: string | null
  loadingFirst: boolean
  reload: () => void
}

export function useApiQuery<T>(queryFn: () => Promise<T>, deps: unknown[]): ApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [firstDone, setFirstDone] = useState(false)
  const [tick, setTick] = useState(0)

  const fnRef = useRef(queryFn)
  useEffect(() => {
    fnRef.current = queryFn
  })

  useEffect(() => {
    let cancelled = false
    fnRef.current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
        setFirstDone(true)
      })
      .catch((err) => {
        if (cancelled) return
        setError(toApiError(err).message)
        setFirstDone(true)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((value) => value + 1), [])

  return { data, error, loadingFirst: !firstDone, reload }
}
