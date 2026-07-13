import { useState } from 'react'
import { t } from '../../design/tokens'
import type { ThemeColors } from '../../context/ThemeContext'

export interface SankeyFunnelStage {
  label: string
  value: number
  sublabel?: string
}

interface SankeyFunnelProps {
  stages: SankeyFunnelStage[]
  colors: ThemeColors
  isGbMode: boolean
  color?: string
  chartHeight?: number
}

export function SankeyFunnel({
  stages,
  colors,
  isGbMode,
  color = t.color.brand[600],
  chartHeight = 160,
}: SankeyFunnelProps) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)

  const W = 800
  const H = chartHeight
  const n = stages.length
  const maxVal = stages[0]?.value || 1
  const blockW = 56
  const totalGap = W - blockW * n
  const segW = n > 1 ? totalGap / (n - 1) : 0

  const bandH = stages.map(s => (H - 32) * (s.value / maxVal))
  const topY = bandH.map(bh => (H - 32 - bh) / 2)
  const botY = topY.map((ty, i) => ty + bandH[i])
  const stageX = stages.map((_, i) => i * (blockW + segW))

  const connector = (i: number) => {
    const x1 = stageX[i] + blockW
    const x2 = stageX[i + 1]
    const t1 = topY[i], b1 = botY[i]
    const t2 = topY[i + 1], b2 = botY[i + 1]
    const mx = (x1 + x2) / 2
    return `M ${x1},${t1} C ${mx},${t1} ${mx},${t2} ${x2},${t2} L ${x2},${b2} C ${mx},${b2} ${mx},${b1} ${x1},${b1} Z`
  }

  const fmtVal = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`

  const pct = (v: number) => Math.round((v / maxVal) * 100)

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', fontFamily: t.font.family.sans }}
    >
      {/* Connector flows */}
      {stages.slice(0, -1).map((_, i) => (
        <path
          key={`conn${i}`}
          d={connector(i)}
          fill={color}
          opacity={isGbMode ? 0.14 : 0.09}
        />
      ))}

      {/* Stage blocks */}
      {stages.map((stage, i) => {
        const x = stageX[i]
        const cx = x + blockW / 2
        const midY = (topY[i] + botY[i]) / 2
        const isH = hovIdx === i
        const dimmed = hovIdx !== null && !isH

        return (
          <g
            key={i}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={x}
              y={topY[i]}
              width={blockW}
              height={bandH[i]}
              rx={5}
              fill={color}
              opacity={dimmed ? 0.18 : isH ? 1 : 0.88}
              style={{ transition: 'opacity 0.18s ease' }}
            />

            {/* Value */}
            <text
              x={cx}
              y={midY - 9}
              textAnchor="middle"
              fontSize={t.font.size.base}
              fontWeight={700}
              fill={t.color.neutral[0]}
              opacity={dimmed ? 0.2 : 1}
              style={{ transition: 'opacity 0.18s ease' }}
            >
              {fmtVal(stage.value)}
            </text>

            {/* Pct badge */}
            {bandH[i] > 36 && (
              <>
                <rect
                  x={cx - 17}
                  y={midY + 2}
                  width={34}
                  height={15}
                  rx={7}
                  fill="rgba(0,0,0,0.22)"
                  opacity={dimmed ? 0 : 1}
                  style={{ transition: 'opacity 0.18s ease' }}
                />
                <text
                  x={cx}
                  y={midY + 13}
                  textAnchor="middle"
                  fontSize={t.font.size['3xs']}
                  fontWeight={600}
                  fill={t.color.neutral[0]}
                  opacity={dimmed ? 0 : 1}
                  style={{ transition: 'opacity 0.18s ease' }}
                >
                  {pct(stage.value)}%
                </text>
              </>
            )}

            {/* Stage label below chart */}
            <text
              x={cx}
              y={H - 4}
              textAnchor="middle"
              fontSize={t.font.size['3xs']}
              fill={colors.fg.subtle as string}
              opacity={dimmed ? 0.3 : 1}
              style={{ transition: 'opacity 0.18s ease' }}
            >
              {stage.label}
            </text>

            {/* Sublabel */}
            {stage.sublabel && !dimmed && (
              <text
                x={cx}
                y={topY[i] - 6}
                textAnchor="middle"
                fontSize={8}
                fill={colors.fg.subtle as string}
              >
                {stage.sublabel}
              </text>
            )}
          </g>
        )
      })}

      {/* Hover tooltip */}
      {hovIdx !== null && (() => {
        const i = hovIdx
        const stage = stages[i]
        const x = stageX[i]
        const cx = x + blockW / 2
        const ttW = 100
        const ttX = Math.min(Math.max(cx - ttW / 2, 4), W - ttW - 4)
        const ttY = botY[i] + 6
        const showBelow = ttY + 38 < H - 14
        const finalY = showBelow ? ttY : topY[i] - 44

        return (
          <g>
            <rect
              x={ttX}
              y={finalY}
              width={ttW}
              height={36}
              rx={t.radius.sm}
              fill={isGbMode ? t.chart.surfaceGb : t.chart.surface}
              stroke={colors.border.default as string}
              strokeWidth={0.8}
            />
            <text
              x={ttX + 8}
              y={finalY + 14}
              fontSize={t.font.size['3xs']}
              fill={colors.fg.muted as string}
              fontFamily={t.font.family.sans}
              fontWeight={600}
            >
              {stage.label}: {fmtVal(stage.value)}
            </text>
            {i > 0 && (
              <text
                x={ttX + 8}
                y={finalY + 27}
                fontSize={t.font.size['3xs']}
                fill={color}
                fontFamily={t.font.family.sans}
              >
                Conv. {pct(stage.value)}% do total
              </text>
            )}
          </g>
        )
      })()}
    </svg>
  )
}
