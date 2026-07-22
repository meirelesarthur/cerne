import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
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

      <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 420, overflowY: 'auto' }}>
        {tree.map(cat => {
          const groupIds      = [cat.id, ...cat.children.map(c => c.id)]
          const groupSelected = groupIds.every(id => selected.includes(id))
          const groupPartial  = !groupSelected && groupIds.some(id => selected.includes(id))
          const isOpen        = expanded[cat.id] ?? false

          return (
            <div key={cat.id}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 6px',
                  borderRadius: t.radius.base,
                  cursor: 'pointer',
                  transition: `background ${t.animation.duration.faster}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                onClick={() => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
              >
                <Checkbox
                  checked={groupSelected}
                  indeterminate={groupPartial}
                  onChange={() => toggleGroup(cat)}
                  aria-label={cat.label}
                />
                <span style={{
                  flex: 1, fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold,
                  color: colors.fg.default, fontFamily: t.font.family.sans,
                  letterSpacing: '0.01em',
                }}>
                  {cat.label}
                </span>
                <ChevronDown
                  size={14}
                  color={colors.fg.subtle}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: `transform ${t.animation.duration.fast}`,
                    flexShrink: 0,
                  }}
                />
              </div>

              {isOpen && (
                <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cat.children.map(child => (
                    <div
                      key={child.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '5px 6px',
                        borderRadius: t.radius.base,
                        cursor: 'pointer',
                        transition: `background ${t.animation.duration.faster}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      onClick={() => toggleItem(child.id)}
                    >
                      <Checkbox
                        checked={selected.includes(child.id)}
                        onChange={() => toggleItem(child.id)}
                        aria-label={child.label}
                      />
                      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans }}>
                        {child.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
