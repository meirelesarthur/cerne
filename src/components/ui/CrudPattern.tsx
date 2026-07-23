import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { t } from '../../design/tokens'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { DetailGrid } from './DetailGrid'
import { DropdownMenu } from './DropdownMenu'
import { EmptyState } from './EmptyState'
import { FormField } from './FormField'
import { FormSection } from './FormSection'
import { ListToolbar } from './ListToolbar'
import { Modal } from './Modal'
import { PageCard } from './PageCard'
import { PageContainer } from './PageContainer'
import { PageHeader } from './PageHeader'
import { Pagination } from './Pagination'
import { ResponsiveDataTable } from './ResponsiveDataTable'
import { ToastContainer, useToast } from './Toast'
import type { Column } from './DataTable'

export type CrudEntity = { id: string } & Record<string, string | number | boolean | null | undefined>

export interface CrudColumnConfig<T extends CrudEntity> {
  key: keyof T & string
  label: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  format?: (value: T[keyof T], record: T) => React.ReactNode
}

export interface CrudFieldConfig<T extends CrudEntity> {
  key: keyof T & string
  label: string
  required?: boolean
  maxLength?: number
  type?: 'text' | 'email' | 'number'
  placeholder?: string
  validate?: (value: string, record: Partial<T>) => string | undefined
}

export interface CrudPermissions {
  view?: boolean
  create?: boolean
  edit?: boolean
  delete?: boolean
}

interface CrudPatternProps<T extends CrudEntity> {
  title: string
  singular: string
  description?: string
  records: T[]
  onRecordsChange?: (records: T[]) => void
  columns: CrudColumnConfig<T>[]
  fields?: CrudFieldConfig<T>[]
  permissions?: CrudPermissions
  readOnly?: boolean
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  pageSize?: number
  headerActions?: React.ReactNode
}

type EditorMode = 'create' | 'edit' | 'show' | null

export function CrudPattern<T extends CrudEntity>({
  title,
  singular,
  description,
  records,
  onRecordsChange,
  columns: columnConfig,
  fields = [],
  permissions = { view: true, create: true, edit: true, delete: true },
  readOnly = false,
  loading = false,
  error,
  onRetry,
  pageSize = 10,
  headerActions,
}: CrudPatternProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<EditorMode>(null)
  const [selected, setSelected] = useState<T | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)
  const { toasts, show, dismiss } = useToast()

  const normalized = search.trim().toLocaleLowerCase('pt-BR')
  const filtered = useMemo(() => records.filter((record) => {
    if (!normalized) return true
    return columnConfig.some((column) => String(record[column.key] ?? '').toLocaleLowerCase('pt-BR').includes(normalized))
  }), [columnConfig, normalized, records])
  const pageRecords = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => { setPage(1) }, [search])

  const closeEditor = () => { setMode(null); setSelected(null); setDraft({}); setErrors({}) }
  const openCreate = () => { setSelected(null); setDraft({}); setErrors({}); setMode('create') }
  const openRecord = (record: T, nextMode: EditorMode) => {
    setSelected(record)
    setDraft(Object.fromEntries(fields.map((field) => [field.key, String(record[field.key] ?? '')])))
    setErrors({})
    setMode(nextMode)
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    fields.forEach((field) => {
      const value = (draft[field.key] ?? '').trim()
      if (field.required && !value) nextErrors[field.key] = `${field.label} é obrigatório.`
      else if (field.maxLength && value.length > field.maxLength) nextErrors[field.key] = `${field.label} deve ter no máximo ${field.maxLength} caracteres.`
      else {
        const custom = field.validate?.(value, draft as Partial<T>)
        if (custom) nextErrors[field.key] = custom
      }
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const save = () => {
    if (!validate() || !onRecordsChange) return
    if (mode === 'create') {
      const record = { id: crypto.randomUUID(), ...draft } as T
      onRecordsChange([record, ...records])
      show(`${singular} cadastrado com sucesso.`)
    } else if (mode === 'edit' && selected) {
      onRecordsChange(records.map((record) => record.id === selected.id ? { ...record, ...draft } : record))
      show(`${singular} atualizado com sucesso.`)
    }
    closeEditor()
  }

  const remove = () => {
    if (!deleteTarget || !onRecordsChange) return
    onRecordsChange(records.filter((record) => record.id !== deleteTarget.id))
    show(`${singular} excluído com sucesso.`, { type: 'success', action: { label: 'Desfazer', onClick: () => onRecordsChange(records) } })
    setDeleteTarget(null)
  }

  const tableColumns: Column<T>[] = [
    ...columnConfig.map((column) => ({
      key: column.key,
      label: column.label,
      width: column.width,
      align: column.align,
      sortable: column.sortable,
      render: (record: T) => column.format?.(record[column.key], record) ?? String(record[column.key] ?? '—'),
    })),
    ...(!readOnly && (permissions.view || permissions.edit || permissions.delete) ? [{
      key: 'actions',
      label: 'Ações',
      width: 72,
      align: 'right' as const,
      sortable: false,
      render: (record: T) => (
        <DropdownMenu
          ariaLabel={`Ações de ${singular.toLowerCase()}`}
          items={[
            ...(permissions.view ? [{ id: 'show', label: 'Ver detalhes', icon: <Eye size={15} />, onClick: () => openRecord(record, 'show' as const) }] : []),
            ...(permissions.edit ? [{ id: 'edit', label: 'Editar', icon: <Pencil size={15} />, onClick: () => openRecord(record, 'edit' as const) }] : []),
            ...(permissions.delete ? [{ id: 'delete', label: 'Excluir…', icon: <Trash2 size={15} />, danger: true, divider: true, onClick: () => setDeleteTarget(record) }] : []),
          ]}
        />
      ),
    }] : []),
  ]

  const detailItems = (record: T) => columnConfig.map((column) => ({
    label: column.label,
    value: column.format?.(record[column.key], record) ?? String(record[column.key] ?? '—'),
  }))

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title={title}
          description={description}
          count={filtered.length}
          actions={(headerActions || (!readOnly && permissions.create)) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], flexWrap: 'wrap' }}>
              {headerActions}
              {!readOnly && permissions.create && <Button icon={<Plus size={16} />} onClick={openCreate}>Novo {singular}</Button>}
            </div>
          ) : undefined}
        />
        <ListToolbar search={search} onSearch={setSearch} searchPlaceholder={`Buscar ${title.toLocaleLowerCase('pt-BR')}…`} />

        {error ? (
          <EmptyState variant="error" description={error} onRetry={onRetry} />
        ) : (
          <>
            <ResponsiveDataTable
              columns={tableColumns}
              data={pageRecords}
              keyField="id"
              loading={loading}
              emptyMessage={normalized ? 'Nenhum resultado para sua busca.' : `Nenhum ${singular.toLocaleLowerCase('pt-BR')} cadastrado.`}
              renderCard={(record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
                  <DetailGrid items={detailItems(record)} columns={1} />
                  {!readOnly && permissions.view && <Button variant="ghost" size="sm" icon={<Eye size={15} />} onClick={() => openRecord(record, 'show')}>Ver detalhes</Button>}
                </div>
              )}
            />
            <div style={{ marginTop: t.space[4] }}>
              <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
            </div>
          </>
        )}
      </PageCard>

      <Modal
        open={mode !== null}
        onClose={closeEditor}
        size="lg"
        title={mode === 'create' ? `Novo ${singular}` : mode === 'edit' ? `Editar ${singular}` : `Detalhes de ${singular}`}
        footer={mode === 'show' ? <Button onClick={closeEditor}>Fechar</Button> : <><Button variant="secondary" onClick={closeEditor}>Cancelar</Button><Button onClick={save}>Salvar {singular}</Button></>}
      >
        {mode === 'show' && selected ? (
          <DetailGrid items={detailItems(selected)} />
        ) : (
          <FormSection title="Informações gerais" columns={fields.length > 1 ? 2 : 1}>
            {fields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                name={field.key}
                type={field.type ?? 'text'}
                value={draft[field.key] ?? ''}
                required={field.required}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                error={errors[field.key]}
                onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            ))}
          </FormSection>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
        title={`Excluir ${singular.toLocaleLowerCase('pt-BR')}?`}
        message="Esta ação remove o registro da listagem. Você poderá desfazer logo após a exclusão."
        confirmLabel={`Excluir ${singular}`}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
