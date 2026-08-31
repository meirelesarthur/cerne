import { useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { useChartScale } from '../../hooks/useChartScale'
import { measureLabelWidth, truncateAxisLabel, widestLabel } from '../../utils/chartAxis'

export interface DonutSlice {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutSlice[]
  height?: number
  centerLabel?: string
  centerValue?: string
  showLegend?: boolean
  valueFormat?: (v: number) => string
}

interface HoverState {
  idx: number
  tooltipX: number
  tooltipY: number
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
  showLegend = true,
  valueFormat = (v) => String(v),
}: DonutChartProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState<HoverState | null>(null)

  const H = height
  // O viewBox do donut acompanha a largura real do container (aspect 1:1), evitando
  // o donut "achatado" quando renderizado numa coluna estreita. Com escala 1:1, o
  // fontSize já sai em px real — sem necessidade de fator k.
  const { ref, width } = useChartScale(0)
  const W = width > 0 ? Math.round(width) : 640

  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Guard: vazio
  if (data.length === 0 || total === 0) {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', fontFamily: t.font.family.sans }}
        >
          <text
            x={W / 2}
            y={H / 2}
            textAnchor="middle"
            fill={colors.fg.subtle as string}
            style={{ fontSize: t.font.size.sm }}
          >
            Sem dados
          </text>
        </svg>
      </div>
    )
  }

  // Legenda ao LADO quando o card é retangular: embaixo ela come a altura, o anel
  // encolhe e o valor do centro deixa de caber. Ao lado, o donut usa a altura
  // inteira. Só quando as linhas caibem na altura — senão volta para baixo.
  const LEGEND_ROW_H = 22
  const LEGEND_GAP = 24
  const LEGEND_DOT_W = 22
  const legendW = Math.min(
    220,
    Math.ceil(LEGEND_DOT_W + widestLabel(data.map((d) => d.label), t.font.size.xs)) + 4,
  )
  const legendSide =
    showLegend && W - legendW - LEGEND_GAP >= H && data.length * LEGEND_ROW_H <= H

  const LEGEND_H = showLegend && !legendSide ? Math.ceil(data.length / 2) * LEGEND_ROW_H : 0
  const donutAreaH = H - LEGEND_H

  // Donut geometry — na coluna lateral o par donut+legenda é centrado como um
  // bloco só, senão sobrava uma faixa vazia entre os dois.
  const availW = legendSide ? W - legendW - LEGEND_GAP : W
  const R = Math.min(availW / 2, donutAreaH / 2) * 0.82
  const innerR = R * 0.58
  const groupW = legendSide ? 2 * R + LEGEND_GAP + legendW : W
  const groupX = Math.max(0, (W - groupW) / 2)
  const cx = legendSide ? groupX + R : W / 2
  const cy = donutAreaH / 2

  // Texto do centro dimensionado pelo buraco do donut — o degrau maior que cabe.
  // O bold do Outfit mede um pouco mais que o regular medido pelo canvas.
  const holeW = innerR * 2 * 0.88
  const BOLD_RATIO = 1.06
  const fitSize = (text: string, steps: number[], ratio = 1) =>
    steps.find((step) => measureLabelWidth(text, step) * ratio <= holeW) ?? steps[steps.length - 1]

  const valueSize = centerValue
    ? fitSize(
        centerValue,
        [t.font.size['2xl'], t.font.size.xl, t.font.size.lg, t.font.size.md, t.font.size.sm],
        BOLD_RATIO,
      )
    : 0
  const labelSize = centerLabel
    ? fitSize(centerLabel, [t.font.size.xs, t.font.size['2xs'], t.font.size['3xs']])
    : 0
  const labelText = centerLabel ? truncateAxisLabel(centerLabel, holeW, labelSize) : ''

  // Par valor+rótulo centrado no buraco, qualquer que seja o degrau escolhido
  const centerBlockH = valueSize + (labelSize ? labelSize + 4 : 0)
  const valueY = cy - centerBlockH / 2 + valueSize * 0.78
  const labelY = (valueSize ? valueY : cy - labelSize / 2) + labelSize + 4

  const getColor = (d: DonutSlice, i: number) => d.color ?? t.chart.series[i % 8]

  // Arc path helper
  const polarToXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  })

  const sliceArc = (startAngle: number, endAngle: number, outer: number, inner: number, expanded: boolean) => {
    const offset = expanded ? 6 : 0
    const midAngle = (startAngle + endAngle) / 2
    const dx = offset * Math.cos(midAngle)
    const dy = offset * Math.sin(midAngle)

    const s1 = polarToXY(startAngle, outer)
    const e1 = polarToXY(endAngle, outer)
    const s2 = polarToXY(endAngle, inner)
    const e2 = polarToXY(startAngle, inner)
    const large = endAngle - startAngle > Math.PI ? 1 : 0

    return {
      d: [
        `M ${s1.x + dx},${s1.y + dy}`,
        `A ${outer},${outer} 0 ${large},1 ${e1.x + dx},${e1.y + dy}`,
        `L ${s2.x + dx},${s2.y + dy}`,
        `A ${inner},${inner} 0 ${large},0 ${e2.x + dx},${e2.y + dy}`,
        'Z',
      ].join(' '),
      midX: cx + (outer + inner) / 2 * Math.cos(midAngle) + dx,
      midY: cy + (outer + inner) / 2 * Math.sin(midAngle) + dy,
    }
  }

  // Build slices
  const TWO_PI = 2 * Math.PI
  const START_ANGLE = -Math.PI / 2 // 12 o'clock

  interface SliceData {
    startAngle: number
    endAngle: number
    col: string
    d: DonutSlice
    i: number
  }

  const slices: SliceData[] = []
  let cursor = START_ANGLE
  data.forEach((d, i) => {
    const angle = (d.value / total) * TWO_PI
    slices.push({ startAngle: cursor, endAngle: cursor + angle, col: getColor(d, i), d, i })
    cursor += angle
  })

  const ttW = 130
  const ttH = 48

  return (
    <div ref={ref} style={{ width: '100%' }}>
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', fontFamily: t.font.family.sans }}
      onMouseLeave={() => setHov(null)}
    >
      {/* Slices */}
      {slices.map(({ startAngle, endAngle, col, d, i }) => {
        const isH = hov?.idx === i
        const dimmed = hov !== null && !isH
        const { d: pathD, midX, midY } = sliceArc(startAngle, endAngle, R, innerR, isH)
        return (
          <path
            key={i}
            d={pathD}
            fill={col}
            opacity={dimmed ? 0.3 : isH ? 1 : 0.85}
            style={{ cursor: 'pointer', transition: `opacity ${t.transition.base}` }}
            onMouseEnter={() =>
              setHov({ idx: i, tooltipX: midX, tooltipY: midY })
            }
          />
        )
      })}

      {/* Center label */}
      {(centerValue || centerLabel) && (
        <g>
          {centerValue && (
            <text
              x={cx}
              y={valueY}
              textAnchor="middle"
              fill={colors.fg.default as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: valueSize, fontWeight: t.font.weight.bold }}
            >
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text
              x={cx}
              y={labelY}
              textAnchor="middle"
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: labelSize }}
            >
              {labelText}
            </text>
          )}
        </g>
      )}

      {/* Tooltip */}
      {hov && (() => {
        const { idx, tooltipX, tooltipY } = hov
        const sl = slices[idx]
        const pct = Math.round((sl.d.value / total) * 100)
        const ttX = Math.min(Math.max(tooltipX - ttW / 2, 4), W - ttW - 4)
        const ttY = Math.max(tooltipY - ttH - 8, 4)
        return (
          <g>
            <rect
              x={ttX}
              y={ttY}
              width={ttW}
              height={ttH}
              rx={t.radius.sm}
              fill={isGbMode ? t.chart.surfaceGb : t.chart.surface}
              stroke={colors.border.default as string}
              strokeWidth={0.8}
              style={{ filter: `drop-shadow(${t.shadow.chartMark})` }}
            />
            <circle cx={ttX + 10} cy={ttY + 13} r={4} fill={sl.col} />
            <text
              x={ttX + 18}
              y={ttY + 16}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold }}
            >
              {sl.d.label}
            </text>
            <text
              x={ttX + 10}
              y={ttY + 30}
              fill={colors.fg.subtle as string}
              fontFamily={t.font.family.sans}
              style={{ fontSize: t.font.size.xs }}
            >
              {valueFormat(sl.d.value)} ({pct}%)
            </text>
          </g>
        )
      })()}

      {/* Legend — ao lado no card retangular, abaixo em duas colunas no estreito */}
      {showLegend && (() => {
        const colW = legendSide ? legendW : W / 2
        // Coluna lateral centrada na altura; abaixo, ancorada sob o donut
        const top = legendSide
          ? Math.max(0, Math.round((H - data.length * LEGEND_ROW_H) / 2))
          : donutAreaH + 8
        const textW = colW - LEGEND_DOT_W
        const sideX = cx + R + LEGEND_GAP

        return (
          <g>
            {data.map((d, i) => {
              const col = getColor(d, i)
              const row = legendSide ? i : Math.floor(i / 2)
              const lx = legendSide ? sideX : (i % 2) * colW + 8
              const ly = top + row * LEGEND_ROW_H
              return (
                <g key={i}>
                  <circle cx={lx + 6} cy={ly + 8} r={5} fill={col} />
                  <text
                    x={lx + 16}
                    y={ly + 12}
                    fill={colors.fg.muted as string}
                    fontFamily={t.font.family.sans}
                    style={{ fontSize: t.font.size.xs }}
                  >
                    {truncateAxisLabel(d.label, textW, t.font.size.xs)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })()}
    </svg>
    </div>
  )
}
