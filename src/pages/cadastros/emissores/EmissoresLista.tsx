import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, FileKey, HelpCircle, Check, X as XIcon } from 'lucide-react'
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
  emissores, today, onNew, onEdit, onCertificado, onDelete,
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
  const border = colors.border.default

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Emissor excluído com sucesso.', 'info')
    }
  }

  const deleteTarget = emissores.find(e => e.id === deleteId)
  const deleteTemNotas = deleteTarget ? deleteTarget.emiteNfe === 'sim' && Number(deleteTarget.ultimoNumeroNfe) > 0 : false

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
          <>
            <div style={{ background: colors.bg.surface, border: `1px solid ${border}`, borderRadius: t.radius.lg, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 130px 1fr 100px 90px 200px 70px 60px',
                padding: '10px 16px',
                borderBottom: `1px solid ${border}`,
                background: colors.bg.subtle,
              }}>
                {['RAZÃO SOCIAL', 'CPF/CNPJ', 'CIDADE', 'AMBIENTE', 'EMITE NFE?', 'CERTIFICADO', 'ATIVO', 'AÇÃO'].map((h, i) => (
                  <div key={h} style={{
                    fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.subtle,
                    fontFamily: t.font.family.sans, letterSpacing: '0.06em', textAlign: i >= 4 ? 'center' : 'left',
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {paginated.map((emissor, idx) => (
                <EmissorRow
                  key={emissor.id}
                  emissor={emissor}
                  today={today}
                  isLast={idx === paginated.length - 1}
                  onEdit={() => onEdit(emissor.id)}
                  onCertificado={() => onCertificado(emissor.id)}
                  onDelete={() => setDeleteId(emissor.id)}
                  colors={colors}
                  border={border}
                />
              ))}
            </div>

            {filtered.length > PAGE_SIZE && (
              <div style={{ marginTop: t.space[4], paddingTop: t.space[4], borderTop: `1px solid ${colors.border.subtle}` }}>
                <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            )}
          </>
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

function EmissorRow({
  emissor, today, isLast, onEdit, onCertificado, onDelete, colors, border,
}: {
  emissor: Emissor
  today:   string
  isLast:  boolean
  onEdit:  () => void
  onCertificado: () => void
  onDelete: () => void
  colors:  ReturnType<typeof useTheme>['colors']
  border:  string
}) {
  const status = certificadoStatus(emissor.certificado, today)
  const certBadge = CERT_BADGE[status]
  const certDateLabel = emissor.certificado ? fmtISOtoDMY(emissor.certificado.validade) : ''

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 130px 1fr 100px 90px 200px 70px 60px',
        padding: '0 16px',
        height: t.size.tableRow,
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        alignItems: 'center',
        transition: `background ${t.animation.duration.faster}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <span title={emissor.razaoSocial} style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {emissor.razaoSocial}
      </span>
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
        {emissor.cpfCnpj}
      </span>
      <span title={emissor.cidade} style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {emissor.cidade}
      </span>
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans }}>
        {emissor.ambiente ? AMBIENTE_LABEL[emissor.ambiente] : '—'}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center' }} title={emissor.emiteNfe === 'sim' ? 'Emite NFe' : 'Não emite NFe'}>
        {emissor.emiteNfe === 'sim'
          ? <Check size={16} color={t.color.feedback.success.text} aria-label="Emite NFe" />
          : <XIcon size={16} color={colors.fg.subtle} aria-label="Não emite NFe" />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Badge label={certBadge.label(certDateLabel)} variant={certBadge.variant} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Badge label={emissor.ativo === 'sim' ? 'Ativo' : 'Inativo'} variant={emissor.ativo === 'sim' ? 'success' : 'neutral'} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DropdownMenu
          align="right"
          ariaLabel="Ações do emissor"
          items={[
            { id: 'edit', label: 'Editar', icon: <Pencil size={13} />, onClick: onEdit },
            { id: 'cert', label: 'Certificado', icon: <FileKey size={13} />, onClick: onCertificado },
            { id: 'delete', label: 'Excluir', icon: <Trash2 size={13} />, onClick: onDelete, danger: true, divider: true },
          ]}
        />
      </div>
    </div>
  )
}
