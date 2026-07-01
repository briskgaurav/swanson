"use client"

import { useEffect, useState } from "react"

const DEFAULT_QUERY = "(max-width: 768px)"

// Reactive matchMedia hook. Lazily reads `window` on first client render so
// mobile devices start with the correct value (and load the mobile sequence
// straight away instead of loading desktop first, then swapping). SSR and the
// hydrating markup are identical regardless of the result, so this is safe.
export function useIsMobile(query = DEFAULT_QUERY) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [query])

  return isMobile
}
