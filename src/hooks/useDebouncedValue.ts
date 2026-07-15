import { useEffect, useState } from 'react'

/**
 * Retorna `value` com atraso de `delayMs` — extraído do padrão já usado em
 * ProdutosLista.tsx (searchRaw → search). Evita refiltrar a cada tecla digitada.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
