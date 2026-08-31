import { Fragment, useState } from 'react'
import { Icon } from './Icon'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { Categoria } from '../../data/categoriasFinanceiras'

interface CategoryTreeFieldProps {
  tree:     Categoria[]
  selected: string[]
  onChange: (ids: string[]) => void
  title?:   string
}

/**
 * Árvore de categorias (grupo + subitens) com checkbox por nível, "Expandir/
 * Recolher Tudo" e "Marcar/Desmarcar Todos" — vínculo N:N reaproveitado por
 * Centros de Custo e Plano de Contas (Lei 2: fonte única, nunca duplicar
 * essa árvore/lógica localmente em cada tela).
 */
export function CategoryTreeField({
  tree, selected, onChange, title = 'Categorias Financeiras',
}: CategoryTreeFieldProps) {
  const { colors } = useTheme()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const expandAll = () => {
    const state: Record<string, boolean> = {}
    tree.forEach(c => { state[c.id] = true })
    setExpanded(state)
  }
  const collapseAll = () => setExpanded({})
  const allExpanded = tree.every(c => expanded[c.id])

  const allIds = tree.flatMap(c => [c.id, ...c.children.map(ch => ch.id)])
  const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id))

  const markAll = () => onChange(allSelected ? [] : allIds)

  const toggleItem = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const toggleGroup = (cat: Categoria) => {
    const groupIds = [cat.id, ...cat.children.map(c => c.id)]
    const allGroupSelected = groupIds.every(id => selected.includes(id))
    if (allGroupSelected) {
      onChange(selected.filter(s => !groupIds.includes(s)))
    } else {
      const toAdd = groupIds.filter(id => !selected.includes(id))
      onChange([...selected, ...toAdd])
    }
  }

  return (
    <div style={{ border: `1px solid ${colors.border.default}`, borderRadius: t.radius.xl, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${colors.border.default}`,
        background: colors.bg.subtle,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
          {title}
          {selected.length > 0 && (
            <span style={{
              marginLeft: 8,
              fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
              padding: '1px 7px', borderRadius: t.radius.full,
              background: colors.accent.subtle, color: colors.accent.default,
            }}>
              {selected.length} selecionada{selected.length !== 1 ? 's' : ''}
            </span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={allExpanded ? collapseAll : expandAll}>
            {allExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}
          </Button>
          <Button variant={allSelected ? 'secondary' : 'primary'} size="sm" onClick={markAll}>
            {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
          </Button>
        </div>
      </div>

      <div style={{ padding: `0 ${t.space[2]}px`, maxHeight: 420, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {tree.map(cat => {
              const groupIds      = [cat.id, ...cat.children.map(c => c.id)]
              const groupSelected = groupIds.every(id => selected.includes(id))
              const groupPartial  = !groupSelected && groupIds.some(id => selected.includes(id))
              const hasChildren   = cat.children.length > 0
              const isOpen        = hasChildren && (expanded[cat.id] ?? false)

              return (
                <Fragment key={cat.id}>
                  <tr
                    style={{
                      height: t.size.tableRow,
                      borderBottom: `1px solid ${colors.border.subtle}`,
                      cursor: hasChildren ? 'pointer' : 'default',
                      transition: `background ${t.animation.duration.faster}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    onClick={hasChildren ? () => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] })) : undefined}
                  >
                    <td style={{ width: t.size.iconBtn.sm, padding: 0 }}>
                      {hasChildren ? (
                        <button
                          type="button"
                          className="gb-focusable"
                          aria-label={isOpen ? 'Recolher' : 'Expandir'}
                          onClick={e => { e.stopPropagation(); setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] })) }}
                          style={{
                            width: t.size.iconBtn.sm,
                            height: t.size.iconBtn.sm,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: colors.fg.subtle,
                            flexShrink: 0,
                            padding: 0,
                            borderRadius: t.radius.sm,
                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: `transform ${t.transition.fast}`,
                          }}
                        >
                          <Icon name="chevron-right" size={t.icon.xs} />
                        </button>
                      ) : (
                        <span style={{ display: 'block', width: t.size.iconBtn.sm }} />
                      )}
                    </td>
                    <td style={{ width: t.size.checkbox, padding: `0 ${t.space[1]}px 0 0` }} onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={groupSelected}
                        indeterminate={groupPartial}
                        onChange={() => toggleGroup(cat)}
                        aria-label={cat.label}
                      />
                    </td>
                    <td style={{ padding: `0 ${t.space[2]}px 0 0` }}>
                      <span style={{
                        fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
                        color: colors.fg.default, fontFamily: t.font.family.sans,
                        letterSpacing: '0.01em',
                      }}>
                        {cat.label}
                      </span>
                    </td>
                  </tr>

                  {isOpen && cat.children.map(child => (
                    <tr
                      key={child.id}
                      style={{
                        height: t.size.tableRow,
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        cursor: 'pointer',
                        transition: `background ${t.animation.duration.faster}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      onClick={() => toggleItem(child.id)}
                    >
                      <td style={{ width: t.size.iconBtn.sm, padding: 0 }} />
                      <td style={{ width: t.size.checkbox, padding: `0 ${t.space[1]}px 0 ${t.space[4]}px` }} onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(child.id)}
                          onChange={() => toggleItem(child.id)}
                          aria-label={child.label}
                        />
                      </td>
                      <td style={{ padding: `0 ${t.space[2]}px 0 0` }}>
                        <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans }}>
                          {child.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
