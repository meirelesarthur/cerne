import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

// ─── ChartSvgLegend ────────────────────────────────────────────────────────────
// Legenda desenhada DENTRO do SVG das primitivas de gráfico (é `<g>`/`<text>`,
// não HTML — para legenda em HTML ao lado do título do card use `ChartLegend`).
//
// Substitui os slots de largura fixa (`translate(i * 120, 0)`) que cada gráfico
// repetia: com rótulo longo ("Máquinas/Equip.") ou em card estreito — onde o
// fator `k` do `useChartScale` aumenta a fonte em unidades de viewBox — os itens
// se sobrepunham. Aqui o passo acompanha o texto e a geometria escala com `k`.

export interface ChartSvgLegendItem {
  name: string
  color: string
}

interface ChartSvgLegendProps {
  items: ChartSvgLegendItem[]
  /** Fator de escala do `useChartScale`. */
  k: number
  /** Origem do grupo no viewBox. */
  x: number
  y: number
  /** Largura útil: itens que não caberiam na linha são omitidos em vez de vazar. */
  maxWidth?: number
}

/** Altura da faixa de legenda, proporcional à fonte já escalada por `k`. */
export function chartLegendHeight(k: number): number {
  return Math.round(t.font.size.xs * k) + 16
}

/** Largura que um item de legenda ocupa no viewBox. */
function itemWidth(name: string, k: number): number {
  const dot = 13 * k
  const text = name.length * t.font.size.xs * 0.62 * k
  const gap = 16 * k
  return dot + text + gap
}

export function ChartSvgLegend({ items, k, x, y, maxWidth }: ChartSvgLegendProps) {
  const { colors } = useTheme()

  // Offsets acumulados: o passo é o texto real, não um slot fixo.
  let cursor = 0
  const placed = items
    .map((item) => {
      const offset = cursor
      cursor += itemWidth(item.name, k)
      return { item, offset }
    })
    .filter(({ offset }) => maxWidth === undefined || offset < maxWidth)

  return (
    <g transform={`translate(${x}, ${y})`}>
      {placed.map(({ item, offset }, i) => (
        <g key={i} transform={`translate(${offset}, 0)`}>
          <circle cx={4 * k} cy={7 * k} r={3.5 * k} fill={item.color} />
          <text
            x={12 * k}
            y={11 * k}
            fill={colors.fg.muted as string}
            fontFamily={t.font.family.sans}
            style={{ fontSize: t.font.size.xs * k }}
          >
            {item.name}
          </text>
        </g>
      ))}
    </g>
  )
}
