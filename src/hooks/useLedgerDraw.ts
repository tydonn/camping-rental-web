import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

export function ruleStyle(delayMs: number): CSSProperties {
  return { '--rule-delay': `${delayMs}ms` } as CSSProperties
}

export function useLedgerDraw<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-draw]'))
    if (targets.length === 0) return

    if (typeof IntersectionObserver === 'undefined') {
      for (const target of targets) target.dataset.drawn = 'done'
      return
    }

    for (const target of targets) target.dataset.drawn = 'pending'

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLElement
          target.dataset.drawn = 'done'
          observer.unobserve(target)
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    )

    for (const target of targets) observer.observe(target)

    return () => observer.disconnect()
  }, [])

  return ref
}