import { useEffect, useRef, useState } from 'react'
import { t } from '../design/tokens'

/**
 * Decide **quando** mostrar o indicador de carregamento, não *se* está
 * carregando. Aplica as duas guardas que as diretrizes pedem, com os tokens
 * `t.delay.*`:
 *
 * - **Anti-flash** (`loadingShow`, 225 ms): resposta rápida não pisca skeleton.
 *   Antes de 225 ms o hook devolve `false` — a tela fica vazia por um instante
 *   e o conteúdo entra direto, sem a casca aparecer e sumir.
 * - **Anti-flicker** (`loadingMin`, 400 ms): uma vez visível, o indicador fica
 *   no mínimo 400 ms. Sem isso, uma resposta em 250 ms deixaria o skeleton
 *   piscando por 25 ms.
 *
 * ```tsx
 * const showSkeleton = useDelayedLoading(isLoading)
 * if (isLoading) return showSkeleton ? <DashboardSkeleton … /> : null
 * ```
 */
export function useDelayedLoading(isLoading: boolean): boolean {
  const [visible, setVisible] = useState(false)
  const shownAt = useRef<number | null>(null)

  useEffect(() => {
    if (isLoading) {
      if (visible) return
      const showTimer = setTimeout(() => {
        shownAt.current = Date.now()
        setVisible(true)
      }, t.delay.loadingShow)
      return () => clearTimeout(showTimer)
    }

    // Terminou de carregar: se o indicador nunca apareceu, não há o que esconder.
    if (!visible) return

    const elapsed = Date.now() - (shownAt.current ?? 0)
    const remaining = t.delay.loadingMin - elapsed
    if (remaining <= 0) {
      shownAt.current = null
      setVisible(false)
      return
    }

    const minTimer = setTimeout(() => {
      shownAt.current = null
      setVisible(false)
    }, remaining)
    return () => clearTimeout(minTimer)
  }, [isLoading, visible])

  return visible
}
