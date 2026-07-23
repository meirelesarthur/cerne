import { useState } from 'react'
import { ArrowRightLeft, GripVertical, MoreVertical } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Badge } from './Badge'
import { DropdownMenu } from './DropdownMenu'
import { EmptyState } from './EmptyState'
import { Tooltip } from './Tooltip'

export interface BoardEntity {
  id: string
  label: string
  description?: string
  occupancy?: number
  capacity?: number
}

export interface BoardGroup {
  id: string
  label: string
  description?: string
  items: BoardEntity[]
}

interface EntityBoardProps {
  groups: BoardGroup[]
  onMove: (entityId: string, sourceGroupId: string, targetGroupId: string) => void
  onSelect?: (entity: BoardEntity) => void
  emptyText?: string
}

export function EntityBoard({ groups, onMove, onSelect, emptyText = 'Nenhuma estrutura cadastrada.' }: EntityBoardProps) {
  const { colors } = useTheme()
  const [dragged, setDragged] = useState<{ entityId: string; sourceGroupId: string } | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  if (groups.length === 0) return <EmptyState message={emptyText} />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3" style={{ gap: t.space[4] }}>
      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`board-group-${group.id}`}
          onDragOver={(event) => { event.preventDefault(); setDropTarget(group.id) }}
          onDragLeave={() => setDropTarget((current) => current === group.id ? null : current)}
          onDrop={(event) => {
            event.preventDefault()
            if (dragged && dragged.sourceGroupId !== group.id) onMove(dragged.entityId, dragged.sourceGroupId, group.id)
            setDragged(null)
            setDropTarget(null)
          }}
          style={{ minWidth: 0, padding: t.space[4], borderRadius: t.radius.xl, border: `1px solid ${dropTarget === group.id ? colors.accent.default : colors.border.default}`, background: dropTarget === group.id ? colors.accent.subtle : colors.bg.subtle, transition: `background ${t.transition.fast}, border-color ${t.transition.fast}` }}
        >
          <div style={{ marginBottom: t.space[3] }}>
            <h2 id={`board-group-${group.id}`} style={{ margin: 0, color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.md, fontWeight: t.font.weight.semibold }}>{group.label}</h2>
            {group.description && <p style={{ margin: `${t.space[1]}px 0 0`, color: colors.fg.subtle, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>{group.description}</p>}
          </div>
          <div style={{ display: 'grid', gap: t.space[3], minHeight: t.space[16] }}>
            {group.items.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 96, borderRadius: t.radius.lg, border: `1px dashed ${colors.border.default}`, color: colors.fg.subtle, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>Solte um curral aqui</div>
            ) : group.items.map((entity) => {
              const exceeded = entity.capacity !== undefined && entity.occupancy !== undefined && entity.occupancy > entity.capacity
              const capacityLabel = entity.capacity !== undefined && entity.occupancy !== undefined ? `${entity.occupancy}/${entity.capacity} animais` : undefined
              return (
                <article
                  key={entity.id}
                  draggable
                  onDragStart={() => setDragged({ entityId: entity.id, sourceGroupId: group.id })}
                  onDragEnd={() => { setDragged(null); setDropTarget(null) }}
                  style={{ padding: t.space[3], borderRadius: t.radius.lg, border: `1px solid ${exceeded ? t.color.feedback.error.border : colors.border.default}`, background: colors.bg.surface, boxShadow: t.shadow.sm, opacity: dragged?.entityId === entity.id ? 0.55 : 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.space[2] }}>
                    <Tooltip label="Arraste para outro setor ou use o menu de ações.">
                      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', minHeight: t.size.iconBtn.sm, color: colors.fg.subtle, cursor: 'grab' }}><GripVertical size={t.icon.xs} /></span>
                    </Tooltip>
                    <button type="button" className="gb-focusable" onClick={() => onSelect?.(entity)} style={{ flex: 1, minWidth: 0, border: 0, padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ display: 'block', color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.base, fontWeight: t.font.weight.semibold }}>{entity.label}</span>
                      {entity.description && <span style={{ display: 'block', marginTop: t.space[1], color: colors.fg.subtle, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>{entity.description}</span>}
                    </button>
                    <DropdownMenu
                      ariaLabel={`Ações de ${entity.label}`}
                      triggerIcon={<MoreVertical size={t.icon.xs} />}
                      items={groups.filter((candidate) => candidate.id !== group.id).map((candidate) => ({ id: candidate.id, label: `Mover para ${candidate.label}`, icon: <ArrowRightLeft size={14} />, onClick: () => onMove(entity.id, group.id, candidate.id) }))}
                    />
                  </div>
                  {capacityLabel && (
                    <div style={{ marginTop: t.space[3] }}>
                      <Tooltip label={exceeded ? 'Acima da capacidade' : 'Ocupação atual do curral'}>
                        <span><Badge label={capacityLabel} variant={exceeded ? 'danger' : 'success'} /></span>
                      </Tooltip>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
