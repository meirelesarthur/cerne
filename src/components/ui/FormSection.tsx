import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface FormSectionProps {
  title: string
  subtitle?: string
  columns?: 1 | 2 | 3
  children: React.ReactNode
  /** Faz as colunas quebrarem automaticamente sem exigir media query na página. */
  responsive?: boolean
  /** Controla a linha de separação abaixo do título. */
  divider?: boolean
  /** Define se os itens da grade acompanham a altura da linha ou crescem individualmente. */
  alignItems?: 'stretch' | 'start'
}

export function FormSection({
  title,
  subtitle,
  columns = 1,
  children,
  responsive = false,
  divider = true,
  alignItems = 'stretch',
}: FormSectionProps) {
  const { colors } = useTheme()

  return (
    <div style={{ marginBottom: t.space[6] }}>
      <div
        style={{
          fontSize: t.font.size.base,
          fontWeight: t.font.weight.semibold,
          color: colors.fg.default,
          fontFamily: t.font.family.sans,
          paddingBottom: divider ? t.space[2] + t.space[1] / 2 : 0,
          borderBottom: divider ? `1px solid ${colors.border.default}` : 'none',
          marginBottom: subtitle ? t.space[1] : 0,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: t.font.size.sm,
            color: colors.fg.subtle,
            fontFamily: t.font.family.sans,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          paddingTop: t.space[4],
          display: columns > 1 ? 'grid' : 'block',
          gridTemplateColumns: columns > 1
            ? responsive
              ? `repeat(auto-fit, minmax(min(100%, ${columns === 2 ? t.size.drawer : t.size.stepBtn}px), 1fr))`
              : columns === 2 ? '1fr 1fr' : '1fr 1fr 1fr'
            : undefined,
          alignItems: columns > 1 ? alignItems : undefined,
          gap: columns > 1 ? t.space[4] : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
