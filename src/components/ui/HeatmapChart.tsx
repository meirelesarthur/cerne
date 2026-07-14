import { useState } from 'react'
import { t } from '../../design/tokens'
import type { ThemeColors } from '../../context/ThemeContext'

interface HeatmapChartProps {
  data: number[][]
  rowLabels: string[]
  colLabels: string[]
  colors: ThemeColors
  isGbMode: boolean
  highColor?: string
}

export function HeatmapChart({
  data,
  rowLabels,
  colLabels,
  colors,
  isGbMode,
  highColor = t.color.brand[600],
}: HeatmapChartProps) {
  const [hov, setHov] = useState<[number, number] | null>(null)
  const max = Math.max(...data.flat(), 1)

  const cellBase: React.CSSProperties = {
    height: 22,
    borderRadius: t.radius.sm,
    transition: 'opacity 0.13s ease, transform 0.13s ease',
    cursor: 'default',
  }

  return (
    <div style={{ fontFamily: t.font.family.sans }}>
      {/* Col labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `36px repeat(${colLabels.length}, 1fr)`,
        marginBottom: t.space[1],
      }}>
        <div />
        {colLabels.map(label => (
          <div key={label} style={{
            fontSize: t.font.size.xs,
            color: colors.fg.subtle as string,
            textAlign: 'center',
            lineHeight: 1,
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {data.map((row, ri) => (
        <div
          key={ri}
          style={{
            display: 'grid',
            gridTemplateColumns: `36px repeat(${colLabels.length}, 1fr)`,
            gap: 3,
            marginBottom: 3,
          }}
        >
          <div style={{
            fontSize: t.font.size.xs,
            color: colors.fg.subtle as string,
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
          }}>
            {rowLabels[ri]}
          </div>
          {row.map((val, ci) => {
            const intensity = val / max
            const isH = hov !== null && hov[0] === ri && hov[1] === ci
            return (
              <div
                key={ci}
                tabIndex={0}
                onMouseEnter={() => setHov([ri, ci])}
                onMouseLeave={() => setHov(null)}
                onFocus={() => setHov([ri, ci])}
                onBlur={() => setHov(null)}
                title={`${rowLabels[ri]} ${colLabels[ci]}: ${val}`}
                aria-label={`${rowLabels[ri]}, ${colLabels[ci]}: ${val}`}
                className="gb-focusable"
                style={{
                  ...cellBase,
                  background: intensity === 0
                    ? (isGbMode ? 'rgba(255,255,255,0.05)' : t.color.neutral[100])
                    : highColor,
                  opacity: intensity === 0 ? 1 : Math.max(0.12, intensity) * (isH ? 1.25 : 1),
                  transform: isH ? 'scaleY(1.1)' : 'scaleY(1)',
                }}
              />
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginTop: t.space[3] }}>
        <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>Menor</span>
        {[0.12, 0.3, 0.5, 0.7, 1.0].map((op, i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: 10,
              borderRadius: t.radius.sm,
              background: highColor,
              opacity: op,
            }}
          />
        ))}
        <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string }}>Maior</span>
      </div>
    </div>
  )
}
