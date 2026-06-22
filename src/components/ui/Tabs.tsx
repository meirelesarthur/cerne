import React, { useEffect } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface TabItem {
  id:     string
  label:  string
  icon?:  React.ReactNode
}

interface TabsProps {
  items:      TabItem[]
  activeId:   string
  onChange:   (id: string) => void
  label?:     string
  /**
   * Quando definido, sincroniza a aba ativa com `?<syncParam>=<id>` na URL via
   * history.replaceState (sem reload). Lê o valor inicial da URL ao montar.
   * Sem esta prop, o comportamento é idêntico ao atual (controlado por activeId/onChange).
   */
  syncParam?: string
  /**
   * Estilo visual das abas:
   * - `pill` (padrão): pílula ativa sobre fundo sutil — usado em dashboards.
   * - `outline`: abas "pasta" delineadas sobre uma linha de base — para painéis de detalhe.
   */
  variant?:   'pill' | 'outline'
}

/**
 * Navegação por abas. Dois estilos via `variant`:
 * - `pill` (padrão): tab-chip (pílula ativa sobre fundo sutil), o mesmo padrão usado nos dashboards.
 * - `outline`: abas delineadas estilo "pasta" sobre uma linha de base.
 * Acessível via role tablist/tab. Substitui as tabs manuais em Pluviometria e dashboards.
 */
export function Tabs({ items, activeId, onChange, label = 'Abas', syncParam, variant = 'pill' }: TabsProps) {
  const { colors, isGbMode } = useTheme()

  // On mount: if syncParam is set and URL has a matching search param, drive the parent's onChange
  useEffect(() => {
    if (!syncParam) return
    const params = new URLSearchParams(window.location.search)
    const urlValue = params.get(syncParam)
    if (urlValue && urlValue !== activeId && items.some(i => i.id === urlValue)) {
      onChange(urlValue)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncParam])

  const handleChange = (id: string) => {
    if (syncParam) {
      const params = new URLSearchParams(window.location.search)
      params.set(syncParam, id)
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
    onChange(id)
  }

  const isOutline = variant === 'outline'

  return (
    <div
      role="tablist"
      aria-label={label}
      style={
        isOutline
          ? {
              display:      'flex',
              alignItems:   'stretch',
              gap:          t.space[1],
              borderBottom: `1px solid ${colors.border.default}`,
            }
          : {
              display:      'inline-flex',
              alignItems:   'center',
              gap:          t.space[1],
              background:   colors.bg.subtle,
              padding:      t.space[1],
              borderRadius: t.radius.base,
              border:       `1px solid ${colors.border.default}`,
            }
      }
    >
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => handleChange(item.id)}
            style={
              isOutline
                ? {
                    display:               'inline-flex',
                    alignItems:            'center',
                    gap:                   t.space[1] + t.space[1] / 2,
                    background:            active ? colors.bg.surface : 'transparent',
                    color:                 active ? colors.accent.default : colors.fg.subtle,
                    border:                `1px solid ${active ? colors.border.default : 'transparent'}`,
                    borderBottomColor:     active ? colors.bg.surface : 'transparent',
                    borderTopLeftRadius:   t.radius.md,
                    borderTopRightRadius:  t.radius.md,
                    borderBottomLeftRadius:  0,
                    borderBottomRightRadius: 0,
                    marginBottom:          -1,
                    fontFamily:            t.font.family.sans,
                    fontSize:              t.font.size.sm,
                    fontWeight:            active ? t.font.weight.semibold : t.font.weight.medium,
                    padding:               `${t.space[2]}px ${t.space[3] + t.space[1]}px`,
                    cursor:                'pointer',
                    whiteSpace:            'nowrap',
                    transition:            `background ${t.transition.base}, color ${t.transition.base}, border-color ${t.transition.base}`,
                  }
                : {
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            t.space[1] + t.space[1] / 2,
                    background:     active ? colors.bg.surface : 'transparent',
                    color:          active ? colors.fg.default : colors.fg.subtle,
                    border:         active ? `1px solid ${colors.border.default}` : '1px solid transparent',
                    boxShadow:      active && !isGbMode ? t.shadow.sm : 'none',
                    fontFamily:     t.font.family.sans,
                    fontSize:       t.font.size.sm,
                    fontWeight:     active ? t.font.weight.semibold : t.font.weight.medium,
                    padding:        `${t.space[1] + 2}px ${t.space[3]}px`,
                    borderRadius:   t.radius.md,
                    cursor:         'pointer',
                    whiteSpace:     'nowrap',
                    transition:     `background ${t.transition.base}, color ${t.transition.base}`,
                  }
            }
          >
            {item.icon && <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">{item.icon}</span>}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
