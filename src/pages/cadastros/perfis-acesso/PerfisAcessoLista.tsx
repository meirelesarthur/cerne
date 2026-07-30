import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, ShieldCheck, Shield, Eye } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard } from '../../../components/ui/PageCard'
import { Button } from '../../../components/ui/Button'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState } from '../../../components/ui/EmptyState'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { usePermission } from '../../../auth/PermissionContext'
import { t } from '../../../design/tokens'
import { useTheme } from '../../../context/ThemeContext'
import type { PerfilAcesso } from './perfisAcesso.types'

interface PerfisAcessoListaProps {
  perfis: PerfilAcesso[]
  onNew: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]

export default function PerfisAcessoLista({ perfis, onNew, onView, onEdit, onDelete }: PerfisAcessoListaProps) {
  const { colors } = useTheme()
  const { can } = usePermission()
  const canDelete = can('config.manage')

  const [searchRaw, setSearchRaw] = useState('')
  const search = useDebouncedValue(searchRaw, 300)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toasts, show, dismiss } = useToast()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return perfis
    return perfis.filter(
      (p) => p.nome.toLowerCase().includes(q) || (p.descricao ?? '').toLowerCase().includes(q),
    )
  }, [perfis, search])

  useEffect(() => {
    setPage(1)
  }, [search, pageSize])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const deleteTarget = perfis.find((p) => p.id === deleteId)

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Perfil excluído com sucesso.', 'info')
    }
  }

  const columns: Column<PerfilAcesso>[] = [
    {
      key: 'nome',
      label: 'NOME',
      sortable: false,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          {p.visivelAoUsuario ? (
            <ShieldCheck size={15} color={colors.accent.default} aria-hidden="true" style={{ flexShrink: 0 }} />
          ) : (
            <Shield size={15} color={colors.fg.subtle} aria-hidden="true" style={{ flexShrink: 0 }} />
          )}
          <span style={{ fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
            {p.nome}
          </span>
        </div>
      ),
    },
    {
      key: 'descricao',
      label: 'DESCRIÇÃO',
      sortable: false,
      render: (p) => p.descricao ?? '—',
    },
    {
      key: 'acoes',
      label: 'AÇÕES',
      align: 'center',
      width: 90,
      sortable: false,
      render: (p) => (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center' }}>
          <DropdownMenu
            align="right"
            ariaLabel={`Ações do perfil ${p.nome}`}
            items={[
              { id: 'view', label: 'Visualizar perfil', icon: <Eye size={13} />, onClick: () => onView(p.id) },
              { id: 'edit', label: 'Editar perfil', icon: <Pencil size={13} />, onClick: () => onEdit(p.id) },
              ...(canDelete
                ? [
                    {
                      id: 'delete',
                      label: 'Excluir perfil',
                      icon: <Trash2 size={13} />,
                      onClick: () => setDeleteId(p.id),
                      danger: true,
                      divider: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ]

  const hasSearch = search.trim().length > 0

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>
        <PageHeader
          title="Perfis de Acesso"
          count={perfis.length}
          actions={
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Novo(a)
            </Button>
          }
        />

        <ListToolbar search={searchRaw} onSearch={setSearchRaw} searchPlaceholder="Buscar por nome ou descrição..." />

        {filtered.length === 0 ? (
          <EmptyState
            message={hasSearch ? 'Nenhum perfil encontrado.' : 'Nenhum perfil de acesso cadastrado.'}
            description={hasSearch ? 'Tente ajustar a busca.' : 'Comece cadastrando o primeiro perfil de acesso.'}
            action={hasSearch ? undefined : { label: 'Novo(a) Perfil', onClick: onNew }}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginated}
              keyField="id"
              onRowClick={(row) => onView(row.id)}
            />

            <div style={{ marginTop: t.space[3] }}>
              <Pagination
                page={page}
                total={filtered.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                showPageSizeSelector
              />
            </div>
          </>
        )}
      </PageCard>

      <ConfirmDialog
        open={deleteId !== null}
        tone="destructive"
        title="Excluir perfil de acesso?"
        message={(() => {
          if (!deleteTarget) return 'Esta ação não pode ser desfeita.'
          const aviso =
            deleteTarget.usuariosVinculados > 0
              ? ` Este perfil está vinculado a ${deleteTarget.usuariosVinculados} usuário${deleteTarget.usuariosVinculados > 1 ? 's' : ''} — a exclusão pode afetar o acesso dessas contas.`
              : ''
          return `${deleteTarget.nome}.${aviso} Esta ação não pode ser desfeita.`
        })()}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageContainer>
  )
}
