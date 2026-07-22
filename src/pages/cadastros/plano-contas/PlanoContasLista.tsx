import { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Printer, FileSpreadsheet,
  HelpCircle, Power, GitBranchPlus,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }        from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { Heading }         from '../../../components/ui/Heading'
import { Modal }           from '../../../components/ui/Modal'
import { Badge }           from '../../../components/ui/Badge'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { FormField }       from '../../../components/ui/FormField'
import { ListToolbar }     from '../../../components/ui/ListToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { DropdownMenu, type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { IconButton }      from '../../../components/ui/IconButton'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import {
  CONDICAO_LABEL, CLASSE_LABEL, TIPO_LABEL, getAllDescendantContaIds,
  type Conta,
} from './planoContas.types'
import { openPlanoContasReport, type ImportResult } from './planoContas.io'
import { PlanoContasImportModal } from './PlanoContasImportModal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanoContasListaProps {
  contas:         Conta[]
  onNew:          () => void
  onEdit:         (id: number) => void
  onCreateDescendant: (parentId: number) => void
  onDelete:       (id: number) => void
  onToggleAtivo:  (id: number) => void
  onImport:       (result: ImportResult) => void
}

// ─── Paginação ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanoContasLista({
  contas, onNew, onEdit, onCreateDescendant, onDelete, onToggleAtivo, onImport,
}: PlanoContasListaProps) {
  const { colors } = useTheme()

  const [searchRaw,  setSearchRaw]  = useState('')
  const search = useDebouncedValue(searchRaw, 300)
  const [filters,    setFilters]    = useState({ condicao: '', classe: '', ativo: '', dtIni: '', dtFim: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page,       setPage]       = useState(1)
  const [deleteId,   setDeleteId]   = useState<number | null>(null)
  const [blockedDeleteId, setBlockedDeleteId] = useState<number | null>(null)
  const [inativarWarnId,  setInativarWarnId]  = useState<number | null>(null)
  const [saibaMais,  setSaibaMais]  = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  // Mock síncrono — sem chamada real, não há motivo para simular loading.
  const [isLoading]  = useState(false)
  const { toasts, show, dismiss } = useToast()

  const handlePrint = () => {
    const ok = openPlanoContasReport(contas)
    if (!ok) show('Não foi possível abrir o relatório — verifique se pop-ups estão bloqueados.', 'error')
  }

  const handleImport = (result: ImportResult) => {
    onImport(result)
    show(`Plano de contas sincronizado — ${result.criadas} criada${result.criadas === 1 ? '' : 's'}, ${result.atualizadas} atualizada${result.atualizadas === 1 ? '' : 's'}, ${result.excluidas} excluída${result.excluidas === 1 ? '' : 's'}.`, 'success')
  }

  const activeFilterCount = [filters.condicao, filters.classe, filters.ativo, filters.dtIni, filters.dtFim].filter(Boolean).length
  const clearFilters = () => setFilters({ condicao: '', classe: '', ativo: '', dtIni: '', dtFim: '' })

  // ── Dados filtrados ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contas.filter(c => {
      const matchSearch   = !q || c.codigo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q)
      const matchCondicao = !filters.condicao || c.condicao === filters.condicao
      const matchClasse   = !filters.classe   || c.classe === filters.classe
      const matchAtivo    = !filters.ativo    || c.ativo === filters.ativo
      const matchDtIni    = !filters.dtIni    || c.dataCriacao >= filters.dtIni
      const matchDtFim    = !filters.dtFim    || c.dataCriacao <= filters.dtFim
      return matchSearch && matchCondicao && matchClasse && matchAtivo && matchDtIni && matchDtFim
    })
  }, [contas, search, filters])

  // Reset para página 1 ao filtrar
  useEffect(() => { setPage(1) }, [search, filters.condicao, filters.classe, filters.ativo, filters.dtIni, filters.dtFim])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const border = colors.border.default

  // ── Exclusão ─────────────────────────────────────────────────────────────
  const handleDeleteClick = (id: number) => {
    const descendants = getAllDescendantContaIds(contas, id)
    if (descendants.length > 0) {
      setBlockedDeleteId(id)
    } else {
      setDeleteId(id)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Conta excluída com sucesso.', 'info')
    }
  }

  // ── Inativação ───────────────────────────────────────────────────────────
  const handleToggleClick = (id: number) => {
    const conta = contas.find(c => c.id === id)
    if (!conta) return
    const descendants = getAllDescendantContaIds(contas, id)
    if (conta.ativo === 'sim' && descendants.length > 0) {
      setInativarWarnId(id)
    } else {
      onToggleAtivo(id)
      show(conta.ativo === 'sim' ? 'Conta inativada.' : 'Conta ativada.', 'info')
    }
  }

  const handleConfirmInativar = () => {
    if (inativarWarnId !== null) {
      onToggleAtivo(inativarWarnId)
      setInativarWarnId(null)
      show('Conta inativada.', 'info')
    }
  }

  const deleteTarget    = contas.find(c => c.id === deleteId)
  const blockedTarget   = contas.find(c => c.id === blockedDeleteId)
  const inativarTarget  = contas.find(c => c.id === inativarWarnId)
  const blockedCount    = blockedTarget ? getAllDescendantContaIds(contas, blockedTarget.id).length : 0
  const inativarCount   = inativarTarget ? getAllDescendantContaIds(contas, inativarTarget.id).length : 0

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      <PageCard>

          {/* ── Header ────────────────────────────────────────────────── */}
          <PageHeader
            title="Plano de Contas"
            count={contas.length}
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button variant="ghost" size="sm" icon={<HelpCircle size={14} />} onClick={() => setSaibaMais(true)}>
                  Saiba mais
                </Button>
                <IconButton
                  icon={<Printer size={15} />}
                  aria-label="Imprimir relatório do plano de contas"
                  tooltip="Imprimir relatório"
                  variant="outline"
                  onClick={handlePrint}
                />
                <DropdownMenu
                  align="right"
                  ariaLabel="Importar ou exportar planilha do plano de contas"
                  triggerIcon={<FileSpreadsheet size={15} />}
                  items={[
                    { id: 'importar', label: 'Importar', icon: <FileSpreadsheet size={13} />, onClick: () => setImportOpen(true) },
                  ]}
                />
                <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                  Adicionar Novo
                </Button>
              </div>
            }
          />

          {/* ── Toolbar ───────────────────────────────────────────────── */}
          <ListToolbar
            search={searchRaw}
            onSearch={v => { setSearchRaw(v); setPage(1) }}
            searchPlaceholder="Pesquisar por nome ou código..."
            onOpenFilter={() => setDrawerOpen(true)}
            filterCount={activeFilterCount}
            onClearAll={clearFilters}
            chips={[
              filters.condicao && {
                label: `Condição: ${CONDICAO_LABEL[filters.condicao as keyof typeof CONDICAO_LABEL]}`,
                onRemove: () => setFilters(f => ({ ...f, condicao: '' })),
              },
              filters.classe && {
                label: `Classe: ${CLASSE_LABEL[filters.classe as keyof typeof CLASSE_LABEL]}`,
                onRemove: () => setFilters(f => ({ ...f, classe: '' })),
              },
              filters.ativo && {
                label: filters.ativo === 'sim' ? 'Ativo' : 'Inativo',
                onRemove: () => setFilters(f => ({ ...f, ativo: '' })),
              },
              (filters.dtIni || filters.dtFim) && {
                label: `Período: ${filters.dtIni || '…'} a ${filters.dtFim || '…'}`,
                onRemove: () => setFilters(f => ({ ...f, dtIni: '', dtFim: '' })),
              },
            ]}
          />

          {/* ── Tabela ────────────────────────────────────────────────── */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rect" width="100%" height={48} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            (() => {
              const hasSearch = search.trim().length > 0 || activeFilterCount > 0
              return (
                <EmptyStateUI
                  message={hasSearch ? 'Nenhuma informação encontrada.' : 'Nenhuma informação cadastrada.'}
                  description={hasSearch ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece adicionando a primeira conta do plano.'}
                  action={hasSearch ? undefined : { label: 'Adicionar Novo', onClick: onNew }}
                />
              )
            })()
          ) : (
            <>
              <div style={{
                background: colors.bg.surface,
                border: `1px solid ${border}`,
                borderRadius: t.radius.lg,
                overflow: 'hidden',
              }}>
                {/* Cabeçalho */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 100px 90px 1fr 80px 80px 60px',
                  padding: '10px 16px',
                  borderBottom: `1px solid ${border}`,
                  background: colors.bg.subtle,
                }}>
                  {['CÓDIGO', 'CLASSE', 'CONDIÇÃO', 'DESCRIÇÃO', 'TIPO', 'ATIVO', 'AÇÃO'].map((h, i) => (
                    <div
                      key={h}
                      style={{
                        fontSize: t.font.size.xs,
                        fontWeight: t.font.weight.semibold,
                        color: colors.fg.subtle,
                        fontFamily: t.font.family.sans,
                        letterSpacing: '0.06em',
                        textAlign: i >= 4 ? 'center' : 'left',
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* Linhas */}
                {paginated.map((conta, idx) => (
                  <ContaRow
                    key={conta.id}
                    conta={conta}
                    isLast={idx === paginated.length - 1}
                    onEdit={() => onEdit(conta.id)}
                    onCreateDescendant={() => onCreateDescendant(conta.id)}
                    onDelete={() => handleDeleteClick(conta.id)}
                    onToggleAtivo={() => handleToggleClick(conta.id)}
                    colors={colors}
                    border={border}
                  />
                ))}
              </div>

              {/* ── Paginação ───────────────────────────────────────── */}
              {filtered.length > PAGE_SIZE && (
                <div style={{
                  marginTop: t.space[4],
                  paddingTop: t.space[4],
                  borderTop: `1px solid ${colors.border.subtle}`,
                }}>
                  <Pagination
                    page={page}
                    total={filtered.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}

      </PageCard>

      {/* ── ConfirmDialog: Excluir (sem dependentes) ─────────────────────── */}
      <ConfirmDialog
        open={deleteId !== null}
        tone="destructive"
        title="Excluir conta?"
        message={deleteTarget ? `${deleteTarget.codigo} — ${deleteTarget.descricao}. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* ── ConfirmDialog: Exclusão bloqueada (há descendentes) ──────────── */}
      <ConfirmDialog
        open={blockedDeleteId !== null}
        tone="default"
        title="Não é possível excluir esta conta"
        message={blockedTarget
          ? `${blockedTarget.codigo} — ${blockedTarget.descricao} possui ${blockedCount} conta${blockedCount > 1 ? 's' : ''} vinculada${blockedCount > 1 ? 's' : ''}. Trate as contas dependentes antes de excluir, ou inative esta conta em vez de excluí-la.`
          : ''}
        confirmLabel="Inativar em vez disso"
        cancelLabel="Entendido"
        onConfirm={() => { if (blockedDeleteId !== null) handleToggleClick(blockedDeleteId); setBlockedDeleteId(null) }}
        onCancel={() => setBlockedDeleteId(null)}
      />

      {/* ── ConfirmDialog: Inativar conta com dependentes ────────────────── */}
      <ConfirmDialog
        open={inativarWarnId !== null}
        tone="default"
        title="Inativar conta com contas vinculadas?"
        message={inativarTarget
          ? `${inativarTarget.codigo} — ${inativarTarget.descricao} possui ${inativarCount} conta${inativarCount > 1 ? 's' : ''} vinculada${inativarCount > 1 ? 's' : ''}. Elas permanecerão ativas, mas esta conta deixará de aceitar novos vínculos. Deseja continuar?`
          : ''}
        confirmLabel="Inativar"
        onConfirm={handleConfirmInativar}
        onCancel={() => setInativarWarnId(null)}
      />

      {/* ── Modal: Saiba mais ────────────────────────────────────────────── */}
      <Modal
        open={saibaMais}
        onClose={() => setSaibaMais(false)}
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setSaibaMais(false)}>
            Entendido
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
            <div style={{
              width: t.space[10], height: t.space[10], borderRadius: t.radius.xl,
              background: colors.accent.subtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <HelpCircle size={22} color={colors.accent.default} />
            </div>
            <Heading level={2} size="xl" weight="bold">
              Plano de Contas
            </Heading>
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.fg.muted, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
            <p style={{ margin: `0 0 ${t.space[3]}px` }}>
              O <strong style={{ color: colors.fg.default }}>Plano de Contas</strong> organiza a estrutura contábil e
              financeira da fazenda em formato hierárquico, agrupando contas sintéticas e analíticas.
            </p>
            <ul style={{ margin: 0, padding: `0 0 0 ${t.space[5]}px`, display: 'flex', flexDirection: 'column', gap: t.space[2] - 2 }}>
              <li><strong>Sintética:</strong> conta "pai", apenas agrupadora — não recebe lançamentos diretos.</li>
              <li><strong>Analítica:</strong> conta "folha", recebe lançamentos financeiros.</li>
              <li><strong>Condição:</strong> define a natureza contábil (Débito, Crédito ou Ambos).</li>
              <li><strong>Inativar</strong> preserva o histórico; a exclusão é bloqueada quando há contas vinculadas.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Modal: Importar Plano de Contas ──────────────────────────────── */}
      <PlanoContasImportModal
        open={importOpen}
        contas={contas}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      {/* ── Filter Drawer ─────────────────────────────────────────────────── */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Plano de Contas"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Condição"
          options={[{ value: '', label: 'Todas' }, ...Object.entries(CONDICAO_LABEL).map(([value, label]) => ({ value, label }))]}
          value={filters.condicao}
          onChange={e => setFilters(f => ({ ...f, condicao: e.target.value }))}
        />
        <FormSelect
          label="Classe"
          options={[{ value: '', label: 'Todas' }, ...Object.entries(CLASSE_LABEL).map(([value, label]) => ({ value, label }))]}
          value={filters.classe}
          onChange={e => setFilters(f => ({ ...f, classe: e.target.value }))}
        />
        <FormSelect
          label="Status"
          options={[{ value: '', label: 'Todos' }, { value: 'sim', label: 'Ativo' }, { value: 'nao', label: 'Inativo' }]}
          value={filters.ativo}
          onChange={e => setFilters(f => ({ ...f, ativo: e.target.value }))}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField
            label="Dt. Ini."
            type="date"
            value={filters.dtIni}
            onChange={e => setFilters(f => ({ ...f, dtIni: e.target.value }))}
          />
          <FormField
            label="Dt. Fim."
            type="date"
            value={filters.dtFim}
            onChange={e => setFilters(f => ({ ...f, dtFim: e.target.value }))}
          />
        </div>
      </FilterDrawer>

    </PageContainer>
  )
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

function ContaRow({
  conta, isLast, onEdit, onCreateDescendant, onDelete, onToggleAtivo, colors, border,
}: {
  conta:         Conta
  isLast:        boolean
  onEdit:        () => void
  onCreateDescendant: () => void
  onDelete:      () => void
  onToggleAtivo: () => void
  colors:        ReturnType<typeof useTheme>['colors']
  border:        string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 100px 90px 1fr 80px 80px 60px',
        padding: '0 16px',
        height: t.size.tableRow,
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        alignItems: 'center',
        transition: `background ${t.animation.duration.faster}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = colors.bg.subtle }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Código */}
      <span title={conta.codigo} style={{
        fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default,
        fontFamily: t.font.family.sans, fontVariantNumeric: 'tabular-nums',
        minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {conta.codigo}
      </span>

      {/* Classe */}
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
        padding: '2px 8px', borderRadius: t.radius.full,
        background: conta.classe === 'sintetica' ? t.color.feedback.info.bg : t.color.brand[50],
        color:      conta.classe === 'sintetica' ? t.color.feedback.info.text : t.color.brand[600],
        fontFamily: t.font.family.sans,
        width: 'fit-content',
      }}>
        {CLASSE_LABEL[conta.classe]}
      </span>

      {/* Condição */}
      <span title={CONDICAO_LABEL[conta.condicao]} style={{
        fontSize: t.font.size.sm, color: colors.fg.muted, fontFamily: t.font.family.sans,
        minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {CONDICAO_LABEL[conta.condicao]}
      </span>

      {/* Descrição */}
      <span title={conta.descricao} style={{
        fontSize: t.font.size.base, color: colors.fg.default, fontFamily: t.font.family.sans,
        paddingLeft: conta.antecessorId !== null ? 16 : 0,
        minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {conta.descricao}
      </span>

      {/* Tipo */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {conta.tipo
          ? <Badge label={TIPO_LABEL[conta.tipo]} variant={conta.tipo === 'capex' ? 'purple' : 'cyan'} />
          : <span style={{ color: colors.fg.subtle, fontSize: t.font.size.sm }}>—</span>}
      </div>

      {/* Ativo */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Badge
          label={conta.ativo === 'sim' ? 'Ativo' : 'Inativo'}
          variant={conta.ativo === 'sim' ? 'success' : 'neutral'}
        />
      </div>

      {/* Ação */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DropdownMenu
          align="right"
          ariaLabel="Ações da conta"
          items={[
            { id: 'edit',   label: 'Editar',                                     icon: <Pencil size={13} />,       onClick: onEdit },
            // "Criar Descendente" só se aplica a contas Sintéticas — Analíticas
            // são folhas e não podem ter contas-filhas.
            conta.classe === 'sintetica' && { id: 'desc', label: 'Criar Descendente', icon: <GitBranchPlus size={13} />, onClick: onCreateDescendant },
            { id: 'toggle', label: conta.ativo === 'sim' ? 'Inativar' : 'Ativar', icon: <Power size={13} />,        onClick: onToggleAtivo },
            { id: 'delete', label: 'Excluir', icon: <Trash2 size={13} />, onClick: onDelete, danger: true, divider: true },
          ].filter(Boolean) as DropdownMenuItem[]}
        />
      </div>
    </div>
  )
}
