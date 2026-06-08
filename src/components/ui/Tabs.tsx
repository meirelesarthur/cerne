import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface TabItem {
  id:     string
  label:  string
  icon?:  React.ReactNode
}

interface TabsProps {
  items:    TabItem[]
  activeId: string
  onChange: (id: string) => void
  label?:   string
}

/**
 * Navegação por abas no estilo tab-chip (pílula ativa sobre fundo sutil),
 * o mesmo padrão usado nos dashboards. Acessível via role tablist/tab.
 * Substitui as tabs manuais em Pluviometria e dashboards.
 */
export function Tabs({ items, activeId, onChange, label = 'Abas' }: TabsProps) {
  const { colors, isGbMode } = useTheme()

  return (
    <div
      role="tablist"
      aria-label={label}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          t.space[1],
        background:   colors.surfaceSubtle,
        padding:      t.space[1],
        borderRadius: t.radius.default,
        border:       `1px solid ${colors.border}`,
      }}
    >
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            t.space[1] + t.space[1] / 2,
              background:     active ? colors.surfaceBg : 'transparent',
              color:          active ? colors.textPrimary : colors.textMuted,
              border:         active ? `1px solid ${colors.border}` : '1px solid transparent',
              boxShadow:      active && !isGbMode ? t.shadow.sm : 'none',
              fontFamily:     t.font.family.sans,
              fontSize:       t.font.size.sm,
              fontWeight:     active ? t.font.weight.semibold : t.font.weight.medium,
              padding:        `${t.space[1] + 2}px ${t.space[3]}px`,
              borderRadius:   t.radius.md,
              cursor:         'pointer',
              whiteSpace:     'nowrap',
              transition:     `background ${t.transition.default}, color ${t.transition.default}`,
            }}
          >
            {item.icon && <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">{item.icon}</span>}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
