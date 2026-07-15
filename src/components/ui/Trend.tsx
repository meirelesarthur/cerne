import { t } from '../../design/tokens'

interface TrendProps {
  value: string
  up: boolean
}

/**
 * Badge de variação percentual usado nos KPIs dos dashboards — extraído de
 * ~10 implementações locais idênticas (ou quase: 2 usavam t.font.size.sm em
 * vez de xs), padronizando o tamanho em todo o sistema.
 */
export function Trend({ value, up }: TrendProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
      fontFamily: t.font.family.sans,
      color: up ? t.color.feedback.success.text : t.color.feedback.error.text,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: t.radius.full,
        background: up ? t.color.feedback.success.bg : t.color.feedback.error.bg,
        fontSize: t.font.size['3xs'], lineHeight: 1,
      }}>
        {up ? '▲' : '▼'}
      </span>
      {value}
    </span>
  )
}
