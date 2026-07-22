import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, HelpCircle } from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }        from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { Heading }         from '../../../components/ui/Heading'
import { Modal }           from '../../../components/ui/Modal'
import { Badge }           from '../../../components/ui/Badge'
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
import { mockPessoas } from '../pessoas/pessoas.mock'
import {
  TIPO_CONTA_LABEL, TIPO_CONTA_OPTS, bancoLabel, formatCurrencyBRL,
  type ContaBancaria,
} from './contasBancarias.types'

interface ContasBancariasListaProps {
  contas:    ContaBancaria[]
  onNew:     () => void
  onView:    (id: number) => void
  onEdit:    (id: number) => void
  onDelete:  (id: number) => void
}

const PAGE_SIZE = 10

export default function ContasBancariasLista({
  contas, onNew, onView, onEdit, onDelete,
}: ContasBancariasListaProps) {
  const { colors } = useTheme()

  const [searchRaw,  setSearchRaw]  = useState('')
  const search = useDebouncedValue(searchRaw, 300)
  const [filters,    setFilters]    = useState({ tipo: '', ativo: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page,       setPage]       = useState(1)
  const [deleteId,   setDeleteId]   = useState<number | null>(null)
  const [blockedDeleteId, setBlockedDeleteId] = useState<number | null>(null)
  const [saibaMais,  setSaibaMais]  = useState(false)
  const { toasts, show, dismiss } = useToast()

  const activeFilterCount = [filters.tipo, filters.ativo].filter(Boolean).length
  const clearFilters = () => setFilters({ tipo: '', ativo: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contas.filter(c => {
      const matchSearch = !q
        || c.descricao.toLowerCase().includes(q)
        || c.sigla.toLowerCase().includes(q)
        || bancoLabel(c.banco).toLowerCase().includes(q)
      const matchTipo  = !filters.tipo  || c.tipo === filters.tipo
      const matchAtivo = !filters.ativo || c.ativo === filters.ativo
      return matchSearch && matchTipo && matchAtivo
    })
  }, [contas, search, filters])

  useEffect(() => { setPage(1) }, [search, filters.tipo, filters.ativo])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const border = colors.border.default

  const dependentesDe = (id: number) => contas.filter(c => c.contaInvestimentoVinculadaId === id)

  const handleDeleteClick = (id: number) => {
    const conta = contas.find(c => c.id === id)
    const vinculos = dependentesDe(id)
    if (!conta) return
    if (conta.saldo !== 0 || vinculos.length > 0) {
      setBlockedDeleteId(id)
    } else {
      setDeleteId(id)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Conta bancária excluída com sucesso.', 'info')
    }
  }

  const deleteTarget  = contas.find(c => c.id === deleteId)
  const blockedTarget = contas.find(c => c.id === blockedDeleteId)
  const blockedVinculos = blockedTarget ? dependentesDe(blockedTarget.id) : []

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>

        <PageHeader
          title="Contas Bancárias"
          count={contas.length}
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
          searchPlaceholder="Buscar por descrição, sigla ou banco..."
          onOpenFilter={() => setDrawerOpen(true)}
          filterCount={activeFilterCount}
          onClearAll={clearFilters}
          chips={[
            filters.tipo && {
              label: `Tipo: ${TIPO_CONTA_LABEL[filters.tipo as keyof typeof TIPO_CONTA_LABEL]}`,
              onRemove: () => setFilters(f => ({ ...f, tipo: '' })),
            },
            filters.ativo && {
              label: filters.ativo === 'sim' ? 'Ativa' : 'Inativa',
              onRemove: () => setFilters(f => ({ ...f, ativo: '' })),
            },
          ]}
        />

        {filtered.length === 0 ? (
          (() => {
            const hasSearch = search.trim().length > 0 || activeFilterCount > 0
            return (
              <EmptyStateUI
                message={hasSearch ? 'Nenhuma conta encontrada.' : 'Nenhuma conta bancária cadastrada.'}
                description={hasSearch ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece adicionando a primeira conta bancária.'}
                action={hasSearch ? undefined : { label: 'Adicionar Novo', onClick: onNew }}
              />
            )
          })()
        ) : (
          <>
            <div style={{ background: colors.bg.surface, border: `1px solid ${border}`, borderRadius: t.radius.lg, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 110px 90px 100px 1.2fr 100px 110px 70px 70px 60px',
                padding: '10px 16px',
                borderBottom: `1px solid ${border}`,
                background: colors.bg.subtle,
              }}>
                {['DESCRIÇÃO', 'BANCO', 'AGÊNCIA', 'CONTA', 'PROPRIETÁRIO', 'LIMITE', 'SALDO', 'ATIVO', 'BOLETO', 'AÇÃO'].map((h, i) => (
                  <div key={h} style={{
                    fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.subtle,
                    fontFamily: t.font.family.sans, letterSpacing: '0.06em', textAlign: i >= 7 ? 'center' : 'left',
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {paginated.map((conta, idx) => (
                <ContaRow
                  key={conta.id}
                  conta={conta}
                  isLast={idx === paginated.length - 1}
                  onView={() => onView(conta.id)}
                  onEdit={() => onEdit(conta.id)}
                  onDelete={() => handleDeleteClick(conta.id)}
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
        tone="destructive"
        title="Excluir conta bancária?"
        message={deleteTarget ? `${deleteTarget.sigla} — ${deleteTarget.descricao}. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={blockedDeleteId !== null}
        tone="default"
        title="Não é possível excluir esta conta"
        message={blockedTarget
          ? [
              blockedTarget.saldo !== 0 ? `Saldo atual de ${formatCurrencyBRL(blockedTarget.saldo)}.` : '',
              blockedVinculos.length > 0 ? `${blockedVinculos.length} conta(s) usam esta conta como Conta Investimento Vinculada.` : '',
              'Considere inativar a conta em vez de excluí-la.',
            ].filter(Boolean).join(' ')
          : ''}
        confirmLabel="Entendido"
        onConfirm={() => setBlockedDeleteId(null)}
        onCancel={() => setBlockedDeleteId(null)}
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
            <Heading level={2} size="xl" weight="bold">Contas Bancárias</Heading>
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.fg.muted, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
            <p style={{ margin: `0 0 ${t.space[3]}px` }}>
              Cadastre as contas bancárias, aplicações financeiras e caixas internos usados pela fazenda para
              lançamentos financeiros, emissão de boletos e consolidação de saldo.
            </p>
            <ul style={{ margin: 0, padding: `0 0 0 ${t.space[5]}px`, display: 'flex', flexDirection: 'column', gap: t.space[2] - 2 }}>
              <li><strong>Saldo</strong> é calculado a partir do Saldo Inicial + lançamentos — não é editável aqui.</li>
              <li><strong>Emite Boleto</strong> habilita Carteira, Convênio e Tipo de Boleto.</li>
              <li><strong>Conta Investimento Vinculada</strong> associa uma conta corrente à sua aplicação.</li>
              <li><strong>Inativar</strong> preserva o histórico; a exclusão é bloqueada quando há saldo ou vínculos.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Contas Bancárias"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Tipo"
          options={TIPO_CONTA_OPTS}
          value={filters.tipo}
          onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}
        />
        <FormSelect
          label="Status"
          options={[{ value: '', label: 'Todos' }, { value: 'sim', label: 'Ativa' }, { value: 'nao', label: 'Inativa' }]}
          value={filters.ativo}
          onChange={e => setFilters(f => ({ ...f, ativo: e.target.value }))}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

function ContaRow({
  conta, isLast, onView, onEdit, onDelete, colors, border,
}: {
  conta:   ContaBancaria
  isLast:  boolean
  onView:  () => void
  onEdit:  () => void
  onDelete: () => void
  colors:  ReturnType<typeof useTheme>['colors']
  border:  string
}) {
  const proprietariosLabel = conta.proprietarios.length === 0
    ? '—'
    : conta.proprietarios
        .map(id => mockPessoas.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 110px 90px 100px 1.2fr 100px 110px 70px 70px 60px',
        padding: '0 16px',
        height: t.size.tableRow,
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        alignItems: 'center',
        transition: `background ${t.animation.duration.faster}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <span title={conta.descricao} style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {conta.sigla} — {conta.descricao}
      </span>
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {bancoLabel(conta.banco)}
      </span>
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans }}>{conta.agencia}</span>
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans }}>{conta.conta}</span>
      <span title={proprietariosLabel} style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {proprietariosLabel}
      </span>
      <span style={{ fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrencyBRL(conta.limite)}
      </span>
      <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: conta.saldo < 0 ? t.color.feedback.error.text : colors.fg.default, fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrencyBRL(conta.saldo)}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Badge label={conta.ativo === 'sim' ? 'Ativa' : 'Inativa'} variant={conta.ativo === 'sim' ? 'success' : 'neutral'} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Badge label={conta.emiteBoleto === 'sim' ? 'Sim' : 'Não'} variant={conta.emiteBoleto === 'sim' ? 'info' : 'neutral'} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DropdownMenu
          align="right"
          ariaLabel="Ações da conta bancária"
          items={[
            { id: 'view',   label: 'Visualizar', icon: <Eye size={13} />,    onClick: onView },
            { id: 'edit',   label: 'Editar',      icon: <Pencil size={13} />, onClick: onEdit },
            { id: 'delete', label: 'Excluir',     icon: <Trash2 size={13} />, onClick: onDelete, danger: true, divider: true },
          ]}
        />
      </div>
    </div>
  )
}
