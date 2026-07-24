import { useEffect, useState } from 'react'

/**
 * Reage a uma media query CSS (ex.: `'(max-width: 1023px)'`) e devolve se ela casa
 * no momento. Usado para responsividade real onde CSS `@media` não alcança (estilos
 * inline do kit) — ex.: empilhar colunas de dashboard em telas de tablet.
 *
 * Prefira breakpoints de `t.breakpoint` ao montar a query
 * (ex.: `` `(max-width: ${t.breakpoint.md - 1}px)` ``).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = () => setMatches(mql.matches)
    handler()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
