import { useCallback, useEffect, useState } from 'react'

/**
 * Estado de filtro espelhado na query string da URL.
 *
 * Substitui o `useState` de um filtro de tela: a seleção passa a viver na URL,
 * então a visão filtrada pode ser recarregada, compartilhada e navegada com
 * voltar/avançar — o que as diretrizes pedem ("deep-link tudo: filtros, abas,
 * paginação").
 *
 * Detalhes de comportamento:
 * - O valor default **não** aparece na URL, para o link do estado inicial da
 *   tela ficar limpo (`/dashboards/ativos`, não `?periodo=12`).
 * - Usa `replaceState`: mudar de filtro não cria uma entrada nova no histórico
 *   (senão o botão Voltar viraria "desfazer filtro" e o usuário não sairia mais
 *   da tela). O `popstate` continua sincronizando quando a navegação real muda
 *   a URL.
 * - A troca de tela do chassi (`AppLayout`) empurra só o pathname, então o
 *   filtro de uma tela não vaza para a seguinte.
 *
 * ```tsx
 * const [periodo, setPeriodo] = useUrlFilter('periodo', '12')
 * <FilterSelect value={periodo} onChange={setPeriodo} … />
 * ```
 */
export function useUrlFilter<T extends string = string>(
  key: string,
  // `NoInfer` impede o literal do default de estreitar o tipo: sem ele,
  // `useUrlFilter('periodo', '12')` devolveria o tipo `'12'` em vez de `string`.
  defaultValue: NoInfer<T>,
): [T, (value: T) => void] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return defaultValue as T
    return (new URLSearchParams(window.location.search).get(key) as T | null) ?? (defaultValue as T)
  }, [key, defaultValue])

  const [value, setValue] = useState<T>(read)

  useEffect(() => {
    const sync = () => setValue(read())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [read])

  const update = useCallback(
    (next: T) => {
      setValue(next)
      if (typeof window === 'undefined') return

      const params = new URLSearchParams(window.location.search)
      if (next === (defaultValue as T)) params.delete(key)
      else params.set(key, next)

      const query = params.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
    },
    [key, defaultValue],
  )

  return [value, update]
}
