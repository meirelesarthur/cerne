import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface ReportSummaryItem {
  label: string
  value: string
  helper?: string
}

interface ReportSummaryProps {
  items: ReportSummaryItem[]
}

/** Indicadores de leitura rápida exibidos acima da prévia tabular. */
export function ReportSummary({ items }: ReportSummaryProps) {
  const { colors } = useTheme()

  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: t.space[2],
        margin: `0 0 ${t.space[4]}px`,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            minWidth: 0,
            padding: t.space[3],
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: t.radius.lg,
            background: colors.bg.subtle,
          }}
        >
          <dt style={{ color: colors.fg.subtle, fontSize: t.font.size.xs, fontWeight: t.font.weight.medium }}>
            {item.label}
          </dt>
          <dd style={{ margin: `${t.space[1]}px 0 0`, color: colors.fg.default, fontSize: t.font.size.lg, fontWeight: t.font.weight.bold }}>
            {item.value}
          </dd>
          {item.helper && (
            <div style={{ marginTop: t.space[1], color: colors.fg.subtle, fontSize: t.font.size.xs }}>
              {item.helper}
            </div>
          )}
        </div>
      ))}
    </dl>
  )
}
