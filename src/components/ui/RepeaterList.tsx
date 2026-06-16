import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'
import { IconButton } from './IconButton'

interface RepeaterListProps<T> {
  items:       T[]
  /** Renderiza os campos de uma linha. O botão remover é adicionado pelo componente. */
  renderRow:   (item: T, index: number) => React.ReactNode
  onAdd:       () => void
  onRemove:    (index: number) => void
  addLabel?:   string
  /** Texto exibido quando não há nenhuma linha. */
  emptyText?:  string
  /** aria-label do botão de remoção de cada linha. */
  removeLabel?: string
  /** Desabilita adição/remoção (ex.: durante submit). */
  disabled?:   boolean
  /** Alinhamento vertical do botão remover em relação aos campos da linha. */
  align?:      'center' | 'start'
}

/**
 * Lista dinâmica genérica (add/remove de linhas) — base reutilizável para
 * inscrições estaduais, filiais, vendedores, etc. (Lei 1 / Regra A: a moldura
 * de adicionar/remover é centralizada aqui; a página só descreve os campos da
 * linha via `renderRow`). O botão de adicionar e o de remover por linha usam os
 * primitivos `Button`/`IconButton` do kit.
 */
export function RepeaterList<T>({
  items, renderRow, onAdd, onRemove,
  addLabel = 'Adicionar', emptyText, removeLabel = 'Remover linha',
  disabled = false, align = 'center',
}: RepeaterListProps<T>) {
  const { colors } = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      {items.length === 0 && emptyText && (
        <div style={{
          padding:    `${t.space[3]}px ${t.space[4]}px`,
          border:     `1px dashed ${colors.border}`,
          borderRadius: t.radius.DEFAULT,
          fontSize:   t.font.size.sm,
          color:      colors.textMuted,
          fontFamily: t.font.family.sans,
          textAlign:  'center',
        }}>
          {emptyText}
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display:     'flex',
            alignItems:  align === 'center' ? 'center' : 'flex-start',
            gap:         t.space[2],
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {renderRow(item, index)}
          </div>
          <div style={{ flexShrink: 0, paddingTop: align === 'start' ? t.space[5] + 2 : 0 }}>
            <IconButton
              icon={<Trash2 size={15} />}
              onClick={() => onRemove(index)}
              aria-label={removeLabel}
              variant="ghost"
              danger
              disabled={disabled}
            />
          </div>
        </div>
      ))}

      <div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onAdd}
          disabled={disabled}
          style={{ color: colors.brand }}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  )
}
