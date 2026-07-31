import { useState, useMemo, useEffect } from 'react'
import { Plus, Eye, Pencil, Trash2, FileKey, HelpCircle, Check, X as XIcon } from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }        from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { Heading }         from '../../../components/ui/Heading'
import { Modal }           from '../../../components/ui/Modal'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar }     from '../../../components/ui/ListToolbar'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Pagination }      from '../../../components/ui/Pagination'
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { DropdownMenu }    from '../../../components/ui/DropdownMenu'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import {
  AMBIENTE_OPTS, AMBIENTE_LABEL, certificadoStatus, fmtISOtoDMY,
  type Emissor, type CertificadoStatus,
} from './emissores.types'

interface EmissoresListaProps {
  emissores: Emissor[]
  today:     string
  onNew:     () => void
  onView:    (id: number) => void
  onEdit:    (id: number) => void
  onCertificado: (id: number) => void
  onDelete:  (id: number) => void
}

const PAGE_SIZE = 10

const CERT_BADGE: Record<CertificadoStatus, { label: (v: string) => string; variant: BadgeVariant }> = {
  ausente:   { label: () => 'Certificado: ausente',         variant: 'neutral' },
  expirado:  { label: (v) => `Certificado: expirado em ${v}`, variant: 'danger' },
  expirando: { label: (v) => `Certificado: expira em ${v}`,  variant: 'warning' },
  valido:    { label: (v) => `Certificado: válido até ${v}`, variant: 'success' },
}

export default function EmissoresLista({
  emissores, today, onNew, onView, onEdit, onCertificado, onDelete,
}: EmissoresListaProps) {
  const { colors } = useTheme()

  const [searchRaw,  setSearchRaw]  = useState('')
  const search = useDebouncedValue(searchRaw, 300)
  const [filters,    setFilters]    = useState({ ambiente: '', ativo: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page,       setPage]       = useState(1)
  const [deleteId,   setDeleteId]   = useState<number | null>(null)
  const [saibaMais,  setSaibaMais]  = useState(false)
  const { toasts, show, dismiss } = useToast()

  const activeFilterCount = [filters.ambiente, filters.ativo].filter(Boolean).length
  const clearFilters = () => setFilters({ ambiente: '', ativo: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return emissores.filter(e => {
      const matchSearch = !q || e.razaoSocial.toLowerCase().includes(q) || e.cpfCnpj.toLowerCase().includes(q) || e.nomeFantasia.toLowerCase().includes(q)
      const matchAmbiente = !filters.ambiente || e.ambiente === filters.ambiente
      const matchAtivo = !filters.ativo || e.ativo === filters.ativo
      return matchSearch && matchAmbiente && matchAtivo
    })
  }, [emissores, search, filters])

  useEffect(() => { setPage(1) }, [search, filters.ambiente, filters.ativo])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Emissor excluído com sucesso.', 'info')
    }
  }

  const deleteTarget = emissores.find(e => e.id === deleteId)
  const deleteTemNotas = deleteTarget ? deleteTarget.emiteNfe === 'sim' && Number(deleteTarget.ultimoNumeroNfe) > 0 : false

  const columns: Column<Emissor>[] = [
    {
      key: 'razaoSocial',
      label: 'RAZÃO SOCIAL',
      sortable: false,
      render: (e) => (
        <span title={e.razaoSocial} style={{ fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans }}>
          {e.razaoSocial}
        </span>
      ),
    },
    {
      key: 'cpfCnpj',
      label: 'CPF/CNPJ',
      width: 130,
      sortable: false,
      render: (e) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: t.font.family.sans }}>{e.cpfCnpj}</span>
      ),
    },
    {
      key: 'cidade',
      label: 'CIDADE',
      sortable: false,
      render: (e) => <span title={e.cidade}>{e.cidade}</span>,
    },
    {
      key: 'ambiente',
      label: 'AMBIENTE',
      width: 100,
      sortable: false,
      render: (e) => <span>{e.ambiente ? AMBIENTE_LABEL[e.ambiente] : '—'}</span>,
    },
    {
      key: 'emiteNfe',
      label: 'EMITE NFE?',
      width: 90,
      align: 'center',
      sortable: false,
      render: (e) => (
        <div style={{ display: 'flex', justifyContent: 'center' }} title={e.emiteNfe === 'sim' ? 'Emite NFe' : 'Não emite NFe'}>
          {e.emiteNfe === 'sim'
            ? <Check size={16} color={t.color.feedback.success.text} aria-label="Emite NFe" />
            : <XIcon size={16} color={colors.fg.subtle} aria-label="Não emite NFe" />}
        </div>
      ),
    },
    {
      key: 'certificado',
      label: 'CERTIFICADO',
      width: 200,
      align: 'center',
      sortable: false,
      render: (e) => {
        const status = certificadoStatus(e.certificado, today)
        const certBadge = CERT_BADGE[status]
        const certDateLabel = e.certificado ? fmtISOtoDMY(e.certificado.validade) : ''
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Badge label={certBadge.label(certDateLabel)} variant={certBadge.variant} />
          </div>
        )
      },
    },
    {
      key: 'ativo',
      label: 'ATIVO',
      width: 70,
      align: 'center',
      sortable: false,
      render: (e) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Badge label={e.ativo === 'sim' ? 'Ativo' : 'Inativo'} variant={e.ativo === 'sim' ? 'success' : 'neutral'} />
        </div>
      ),
    },
    {
      key: 'acoes',
      label: 'AÇÃO',
      width: 60,
      align: 'center',
      sortable: false,
      render: (e) => (
        <div onClick={ev => ev.stopPropagation()} style={{ display: 'flex', justifyContent: 'center' }}>
          <DropdownMenu
            align="right"
            ariaLabel={`Ações do emissor ${e.razaoSocial}`}
            items={[
              { id: 'view', label: 'Visualizar', icon: <Eye size={13} />, onClick: () => onView(e.id) },
              { id: 'edit', label: 'Editar', icon: <Pencil size={13} />, onClick: () => onEdit(e.id) },
              { id: 'cert', label: 'Certificado', icon: <FileKey size={13} />, onClick: () => onCertificado(e.id) },
              { id: 'delete', label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteId(e.id), danger: true, divider: true },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>

        <PageHeader
          title="Emissor NFe"
          count={emissores.length}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="ghost" size="sm" icon={<HelpCircle size={14} />} onClick={() => setSaibaMais(true)}>
                Saiba mais
              </Button>
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                Adicionar Novo
              </Button>
            </div>
          }
        />

        <ListToolbar
          search={searchRaw}
          onSearch={v => { setSearchRaw(v); setPage(1) }}
          searchPlaceholder="Buscar por razão social ou CPF/CNPJ..."
          onOpenFilter={() => setDrawerOpen(true)}
          filterCount={activeFilterCount}
          onClearAll={clearFilters}
          chips={[
            filters.ambiente && {
              label: `Ambiente: ${AMBIENTE_LABEL[filters.ambiente as keyof typeof AMBIENTE_LABEL]}`,
              onRemove: () => setFilters(f => ({ ...f, ambiente: '' })),
            },
            filters.ativo && {
              label: filters.ativo === 'sim' ? 'Ativo' : 'Inativo',
              onRemove: () => setFilters(f => ({ ...f, ativo: '' })),
            },
          ]}
        />

        {filtered.length === 0 ? (
          (() => {
            const hasSearch = search.trim().length > 0 || activeFilterCount > 0
            return (
              <EmptyStateUI
                message={hasSearch ? 'Nenhum emissor encontrado.' : 'Nenhum emissor cadastrado.'}
                description={hasSearch ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece adicionando o primeiro emissor.'}
                action={hasSearch ? undefined : { label: 'Adicionar Novo', onClick: onNew }}
              />
            )
          })()
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            keyField="id"
            onRowClick={row => onView(row.id)}
            pagination={
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            }
          />
        )}

      </PageCard>

      <ConfirmDialog
        open={deleteId !== null}
        tone={deleteTemNotas ? 'default' : 'destructive'}
        title={deleteTemNotas ? 'Não é possível excluir este emissor' : 'Excluir emissor?'}
        message={deleteTarget
          ? deleteTemNotas
            ? `${deleteTarget.razaoSocial} já possui notas fiscais emitidas (${deleteTarget.ultimoNumeroNfe}). Considere inativar o emissor em vez de excluí-lo.`
            : `${deleteTarget.razaoSocial}. Esta ação não pode ser desfeita.`
          : ''}
        confirmLabel={deleteTemNotas ? 'Entendido' : 'Excluir'}
        onConfirm={deleteTemNotas ? () => setDeleteId(null) : handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Modal
        open={saibaMais}
        onClose={() => setSaibaMais(false)}
        size="lg"
        footer={<Button variant="primary" onClick={() => setSaibaMais(false)}>Entendido</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
            <div style={{ width: t.space[10], height: t.space[10], borderRadius: t.radius.xl, background: colors.accent.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HelpCircle size={22} color={colors.accent.default} />
            </div>
            <Heading level={2} size="xl" weight="bold">Emissor NFe</Heading>
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.fg.muted, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
            <p style={{ margin: `0 0 ${t.space[3]}px` }}>
              Cadastre as empresas/produtores autorizados a emitir NFe, CTe e MDFe em nome da fazenda.
              Um emissor só está apto a emitir quando tiver: Emite NFe habilitado, numeração/série configuradas,
              ao menos uma Inscrição Estadual válida (ou isenção) e certificado digital válido.
            </p>
            <ul style={{ margin: 0, padding: `0 0 0 ${t.space[5]}px`, display: 'flex', flexDirection: 'column', gap: t.space[2] - 2 }}>
              <li><strong>Certificado</strong> mostra o status diretamente na linha — sem interromper a navegação.</li>
              <li><strong>Ambiente</strong> Produção emite notas fiscais válidas juridicamente; Homologação é ambiente de testes.</li>
              <li><strong>Inativar</strong> preserva o histórico fiscal; a exclusão é bloqueada quando há notas emitidas.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Emissores"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Ambiente"
          options={AMBIENTE_OPTS.map(o => o.value === '' ? { value: '', label: 'Todos' } : o)}
          value={filters.ambiente}
          onChange={e => setFilters(f => ({ ...f, ambiente: e.target.value }))}
        />
        <FormSelect
          label="Status"
          options={[{ value: '', label: 'Todos' }, { value: 'sim', label: 'Ativo' }, { value: 'nao', label: 'Inativo' }]}
          value={filters.ativo}
          onChange={e => setFilters(f => ({ ...f, ativo: e.target.value }))}
        />
      </FilterDrawer>

    </PageContainer>
  )
}
