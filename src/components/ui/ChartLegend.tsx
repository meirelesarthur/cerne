import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

// ─── ChartLegend ───────────────────────────────────────────────────────────────
// Legenda de séries de gráfico. Extraída de ~10 implementações locais idênticas
// nos dashboards (marcador + rótulo em `xs`), que divergiam no tamanho do ponto,
// no gap e no formato do traço.
//
// Para legendas de STATUS semântico (Badge variants) use `StatusLegend`; esta é
// para séries com cor própria da paleta de gráfico (`t.chart.series`, marca,
// feedback).

export interface ChartLegendItem {
  label: string
  color: string
  /** Traço tracejado — série projetada, meta ou linha de referência. */
  dashed?: boolean
}

interface ChartLegendProps {
  items: ChartLegendItem[]
  /**
   * Formato do marcador. `dot` (default) para séries de área/barra/fatia;
   * `line` para séries de linha, onde o traço comunica o estilo do gráfico.
   */
  marker?: 'dot' | 'line'
  /** Rótulo acessível do grupo. */
  label?: string
}

export function ChartLegend({ items, marker = 'dot', label = 'Legenda do gráfico' }: ChartLegendProps) {
  const { colors } = useTheme()

  return (
    <div
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: `${t.space[1]}px ${t.space[3]}px`,
      }}
    >
      {items.map((item) => (
        <span
          key={item.label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: t.space[1] + 2,
            fontSize: t.font.size.xs,
            color: colors.fg.subtle as string,
            fontFamily: t.font.family.sans,
            whiteSpace: 'nowrap',
          }}
        >
          {marker === 'dot' ? (
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: t.radius.full,
                background: item.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          ) : (
            <svg width={16} height={2} style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
              <line
                x1={0}
                y1={1}
                x2={16}
                y2={1}
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray={item.dashed ? '4,3' : undefined}
                strokeLinecap="round"
              />
            </svg>
          )}
          {item.label}
        </span>
      ))}
    </div>
  )
}
