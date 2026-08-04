import React, { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'
import { IconButton } from './IconButton'

export interface EditableTableColumn<T> {
  key:    string
  label:  string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  /** Célula em modo leitura (linha já confirmada). */
  render: (item: T) => React.ReactNode
  /** Célula em modo edição/criação — o rótulo do campo já é o cabeçalho da coluna, então os controles aqui não devem repetir `label`. */
  renderEdit: (item: T, onChange: (patch: Partial<T>) => void, error?: string) => React.ReactNode
}

interface EditableFieldTableProps<T> {
  items:      T[]
  columns:    EditableTableColumn<T>[]
  /** Fábrica da linha vazia usada ao clicar em "Adicionar". */
  emptyItem:  () => T
  onChange:   (items: T[]) => void
  addLabel?:  string
  /** Texto exibido quando não há nenhuma linha e nenhum rascunho em edição. */
  emptyText?: string
  removeLabel?: string
  disabled?:  boolean
  /** Erro de validação de uma célula específica (linha existente em edição). */
  getError?: (index: number, columnKey: string) => string | undefined
}

/**
 * Lista dinâmica que se comporta como tabela: linhas confirmadas renderizam em
 * modo leitura (`render`); "Adicionar" abre uma linha de rascunho com os
 * controles de `renderEdit`; cada linha existente tem edição inline (lápis →
 * troca pra `renderEdit` na própria linha, com confirmar/cancelar). Substitui
 * o empilhamento vertical do `RepeaterList` quando o conjunto de campos já
 * cabe em colunas de tabela (ex.: Fazenda + Participação) — `RepeaterList`
 * continua sendo a escolha certa para linhas de campo único ou campos que não
 * cabem em colunas curtas.
 */
export function EditableFieldTable<T>({
  items, columns, emptyItem, onChange,
  addLabel = 'Adicionar', emptyText, removeLabel = 'Remover linha',
  disabled = false, getError,
}: EditableFieldTableProps<T>) {
  const { colors } = useTheme()
  const [draft, setDraft] = useState<T | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<T | null>(null)

  const isBusy = draft !== null || editingIndex !== null

  const startAdd = () => setDraft(emptyItem())
  const cancelAdd = () => setDraft(null)
  const confirmAdd = () => {
    if (!draft) return
    onChange([...items, draft])
    setDraft(null)
  }

  const startEdit = (index: number) => { setEditingIndex(index); setEditDraft({ ...items[index] }) }
  const cancelEdit = () => { setEditingIndex(null); setEditDraft(null) }
  const confirmEdit = () => {
    if (editingIndex === null || !editDraft) return
    onChange(items.map((item, index) => index === editingIndex ? editDraft : item))
    setEditingIndex(null)
    setEditDraft(null)
  }

  const removeAt = (index: number) => onChange(items.filter((_, i) => i !== index))

  const cellStyle = (align: 'left' | 'center' | 'right' = 'left'): React.CSSProperties => ({
    padding: `${t.space[2]}px ${t.space[2] + 2}px`,
    textAlign: align,
    borderBottom: `1px solid ${colors.border.subtle}`,
    verticalAlign: 'middle',
  })

  const showTable = items.length > 0 || draft !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      {!showTable && emptyText && (
        <div style={{
          padding:      `${t.space[3]}px ${t.space[4]}px`,
          border:       `1px dashed ${colors.border.default}`,
          borderRadius: t.radius.base,
          fontSize:     t.font.size.sm,
          color:        colors.fg.subtle,
          fontFamily:   t.font.family.sans,
          textAlign:    'center',
        }}>
          {emptyText}
        </div>
      )}

      {showTable && (
        <div style={{ border: `1px solid ${colors.border.subtle}`, borderRadius: t.radius.base, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.family.sans }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      ...cellStyle(col.align),
                      width: col.width,
                      fontSize: t.font.size['3xs'],
                      fontWeight: t.font.weight.semibold,
                      color: colors.fg.subtle,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: colors.bg.subtle,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th style={{ ...cellStyle('right'), width: 76, background: colors.bg.subtle }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const isEditingThis = editingIndex === index
                return (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td key={col.key} style={cellStyle(col.align)}>
                        {isEditingThis
                          ? col.renderEdit(
                              editDraft ?? item,
                              (patch) => setEditDraft((prev) => ({ ...(prev ?? item), ...patch })),
                              getError?.(index, col.key)
                            )
                          : col.render(item)}
                      </td>
                    ))}
                    <td style={cellStyle('right')}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[1] }}>
                        {isEditingThis ? (
                          <>
                            <IconButton icon={<Check size={14} />} onClick={confirmEdit} aria-label="Confirmar edição" variant="ghost" />
                            <IconButton icon={<X size={14} />} onClick={cancelEdit} aria-label="Cancelar edição" variant="ghost" />
                          </>
                        ) : (
                          <>
                            <IconButton icon={<Pencil size={14} />} onClick={() => startEdit(index)} aria-label={`Editar linha ${index + 1}`} variant="ghost" disabled={disabled || isBusy} />
                            <IconButton icon={<Trash2 size={14} />} onClick={() => removeAt(index)} aria-label={removeLabel} variant="ghost" danger disabled={disabled || isBusy} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {draft && (
                <tr>
                  {columns.map((col) => (
                    <td key={col.key} style={cellStyle(col.align)}>
                      {col.renderEdit(draft, (patch) => setDraft((prev) => ({ ...(prev as T), ...patch })), undefined)}
                    </td>
                  ))}
                  <td style={cellStyle('right')}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: t.space[1] }}>
                      <IconButton icon={<Check size={14} />} onClick={confirmAdd} aria-label="Confirmar nova linha" variant="ghost" />
                      <IconButton icon={<X size={14} />} onClick={cancelAdd} aria-label="Cancelar nova linha" variant="ghost" />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={startAdd}
          disabled={disabled || isBusy}
          style={{ color: colors.accent.default }}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  )
}
