import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Corrige o texto de gráficos SVG que encolhe/cresce junto com a largura da coluna.
 *
 * As primitivas de gráfico desenham num `viewBox` de largura fixa (`viewBoxWidth`,
 * ex.: 800) com `width="100%"`. Como o `fontSize` do `<text>` é dado em unidades do
 * viewBox, ele é escalado pelo navegador na razão `larguraReal / viewBoxWidth` — em
 * uma coluna de 1/3 o rótulo "13" renderiza a ~5px (ilegível), e full-width a ~13px.
 *
 * Este hook mede a largura real renderizada do wrapper e devolve o fator
 * `k = viewBoxWidth / larguraReal`. Multiplicar cada `fontSize` (em unidades de
 * viewBox) por `k` faz o texto renderizar SEMPRE no px pretendido pelo token,
 * independentemente de quantas colunas dividem a linha.
 *
 * Uso:
 * ```tsx
 * const { ref, k } = useChartScale(W) // W = largura do viewBox
 * return (
 *   <div ref={ref} style={{ width: '100%' }}>
 *     <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 *       <text fontSize={t.font.size.xs * k}>…</text>
 *     </svg>
 *   </div>
 * )
 * ```
 */
export function useChartScale(viewBoxWidth: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Antes da 1ª medição (width=0), k=1 preserva o comportamento atual sem divisão por zero.
  const k = width > 0 ? viewBoxWidth / width : 1
  return { ref, k }
}
