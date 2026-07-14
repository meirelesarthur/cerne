import { useState, useMemo, useEffect } from 'react'
import {
  Plus, Pencil, Trash2,
  TrendingUp, TrendingDown, HelpCircle,
} from 'lucide-react'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }         from '../../../components/ui/PageCard'
import { Button }          from '../../../components/ui/Button'
import { Heading }         from '../../../components/ui/Heading'
import { Modal }           from '../../../components/ui/Modal'
import { Badge }           from '../../../components/ui/Badge'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar } from '../../../components/ui/ListToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState as EmptyStateUI } from '../../../components/ui/EmptyState'
import { DropdownMenu }    from '../../../components/ui/DropdownMenu'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import {
  classeOf, CONDICAO_LABEL, TIPO_LABEL, CLASSE_LABEL, getAllDescendantCentroIds,
  type CentroCusto,
} from './centrosCusto.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CentrosCustoListaProps {
  centros:  CentroCusto[]
  onNew:    () => void
  onEdit:   (id: number) => void
  onDelete: (id: number) => void
}

// ─── Paginação ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CentrosCustoLista({
  centros, onNew, onEdit, onDelete,
}: CentrosCustoListaProps) {
  const { colors, isGbMode } = useTheme()

  const [search,      setSearch]      = useState('')
  const [filters,     setFilters]     = useState({ condicao: '', classe: '', ativo: '' })
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [page,        setPage]        = useState(1)
  const [deleteId,    setDeleteId]    = useState<number | null>(null)
  const [saibaMais,   setSaibaMais]   = useState(false)
  const [isLoading,   setIsLoading]   = useState(true)
  const { toasts, show, dismiss }     = useToast()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const activeFilterCount = [filters.condicao, filters.classe, filters.ativo].filter(Boolean).length
  const clearFilters = () => setFilters({ condicao: '', classe: '', ativo: '' })

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total      = centros.length
    const sinteticas = centros.filter(c => c.antecessorId === null).length
    const analiticas = centros.filter(c => c.antecessorId !== null).length
    const ativas     = centros.filter(c => c.ativo === 'sim').length
    const ativasPct  = total > 0 ? Math.round((ativas / total) * 100) : 0
    return { total, sinteticas, analiticas, ativas, ativasPct }
  }, [centros])

  // ── Dados filtrados ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return centros.filter(c => {
      const matchSearch  = !q || c.codigo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q) || CONDICAO_LABEL[c.condicao].toLowerCase().includes(q) || TIPO_LABEL[c.tipo].toLowerCase().includes(q)
      const matchCondicao = !filters.condicao || c.condicao === filters.condicao
      const matchClasse   = !filters.classe   || classeOf(c.antecessorId) === filters.classe
      const matchAtivo    = !filters.ativo    || c.ativo === filters.ativo
      return matchSearch && matchCondicao && matchClasse && matchAtivo
    })
  }, [centros, search, filters])

  // Reset para página 1 ao filtrar
  useEffect(() => { setPage(1) }, [search, filters.condicao, filters.classe, filters.ativo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const cardBg = isGbMode ? 'rgba(255,255,255,0.04)' : colors.bg.surface
  const border = colors.border.default

  // ── Confirmar exclusão ────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Centro de custo excluído com sucesso.', 'info')
    }
  }

  const deleteTarget = centros.find(c => c.id === deleteId)

  return (
    <PageContainer style={{ paddingBottom: 0 }}>

      {/* ── Card principal com scroll interno ───────────────────────────── */}
      <PageCard>

          {/* ── Header ────────────────────────────────────────────────── */}
          <PageHeader
            title="Centros de Custo"
            count={centros.length}
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button variant="ghost" size="sm" icon={<HelpCircle size={14} />} onClick={() => setSaibaMais(true)}>
                  Saiba mais
                </Button>
                <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                  Novo Centro
                </Button>
              </div>
            }
          />

          {/* ── KPI Bar ───────────────────────────────────────────────── */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4], marginBottom: t.space[4] }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rect" width="100%" height={80} />
              ))}
            </div>
          ) : null}
          {!isLoading && <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            border: `1px solid ${border}`,
            borderRadius: t.radius.lg,
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            {[
              {
                label: 'Total de Centros', value: String(kpis.total),
                sub: 'cadastrados',
              },
              {
                label: 'Sintéticos', value: String(kpis.sinteticas),
                trendValue: kpis.total > 0 ? `${Math.round(kpis.sinteticas / kpis.total * 100)}%` : '0%',
                trend: 'neutral' as const,
              },
              {
                label: 'Analíticos', value: String(kpis.analiticas),
                trendValue: kpis.total > 0 ? `${Math.round(kpis.analiticas / kpis.total * 100)}%` : '0%',
                trend: 'up' as const,
              },
              {
                label: 'Ativos', value: String(kpis.ativas),
                trendValue: `${kpis.ativasPct}%`,
                trend: (kpis.ativasPct >= 80 ? 'up' : 'down') as 'up' | 'down',
              },
            ].map((item, idx, arr) => (
              <div
                key={item.label}
                style={{
                  padding: `${t.space[4]}px ${t.space[5]}px`,
                  background: cardBg,
                  borderRight: idx < arr.length - 1 ? `1px solid ${border}` : undefined,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                <span style={{
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.medium,
                  color: colors.fg.subtle,
                  fontFamily: t.font.family.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {item.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontSize: t.font.size['3xl'],
                    fontWeight: t.font.weight.bold,
                    color: colors.fg.default,
                    fontFamily: t.font.family.sans,
                    lineHeight: 1,
                  }}>
                    {item.value}
                  </span>
                  {'trendValue' in item && item.trendValue && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: t.font.size.xs,
                      fontWeight: t.font.weight.semibold,
                      color: item.trend === 'up' ? t.color.feedback.success.text : item.trend === 'down' ? t.color.feedback.error.text : colors.fg.subtle,
                      background: item.trend === 'up' ? t.color.feedback.success.bg : item.trend === 'down' ? t.color.feedback.error.bg : colors.bg.subtle,
                      padding: '2px 6px', borderRadius: t.radius.full,
                    }}>
                      {item.trend === 'up'   && <TrendingUp  size={10} />}
                      {item.trend === 'down' && <TrendingDown size={10} />}
                      {item.trendValue}
                    </span>
                  )}
                  {'sub' in item && item.sub && (
                    <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
                      {item.sub}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>}

          {/* ── Toolbar ───────────────────────────────────────────────── */}
          <ListToolbar
            search={search}
            onSearch={v => { setSearch(v); setPage(1) }}
            searchPlaceholder="Buscar por código, descrição..."
            onOpenFilter={() => setDrawerOpen(true)}
            filterCount={activeFilterCount}
            onClearAll={clearFilters}
            chips={[
              filters.condicao && {
                label: `Condição: ${({ ambos: 'Ambos', receita: 'Receita', despesa: 'Despesa' } as Record<string, string>)[filters.condicao]}`,
                onRemove: () => setFilters(f => ({ ...f, condicao: '' })),
              },
              filters.classe && {
                label: `Classe: ${filters.classe === 'sintetica' ? 'Sintética' : 'Analítica'}`,
                onRemove: () => setFilters(f => ({ ...f, classe: '' })),
              },
              filters.ativo && {
                label: filters.ativo === 'sim' ? 'Ativo' : 'Inativo',
                onRemove: () => setFilters(f => ({ ...f, ativo: '' })),
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
                  message={hasSearch ? 'Nenhum centro de custo encontrado.' : 'Nenhum centro de custo cadastrado.'}
                  description={hasSearch ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece adicionando o primeiro centro de custo.'}
                  action={hasSearch ? undefined : { label: 'Adicionar Centro', onClick: onNew }}
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
                  gridTemplateColumns: '110px 110px 110px 1fr 90px 60px',
                  padding: '10px 16px',
                  borderBottom: `1px solid ${border}`,
                  background: colors.bg.subtle,
                }}>
                  {['CÓDIGO', 'CLASSE', 'CONDIÇÃO', 'DESCRIÇÃO', 'ATIVO', 'AÇÃO'].map((h, i) => (
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
                {paginated.map((cc, idx) => (
                  <CCRow
                    key={cc.id}
                    cc={cc}
                    isLast={idx === paginated.length - 1}
                    onEdit={() => onEdit(cc.id)}
                    onDelete={() => setDeleteId(cc.id)}
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

      {/* ── ConfirmDialog: Excluir ───────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteId !== null}
        tone="destructive"
        title="Excluir centro de custo?"
        message={(() => {
          if (!deleteTarget) return 'Esta ação não pode ser desfeita.'
          const descendentes = getAllDescendantCentroIds(centros, deleteTarget.id)
          const aviso = descendentes.length > 0
            ? ` Este centro possui ${descendentes.length} centro${descendentes.length > 1 ? 's' : ''} analítico${descendentes.length > 1 ? 's' : ''} vinculado${descendentes.length > 1 ? 's' : ''}, que também ${descendentes.length > 1 ? 'serão excluídos' : 'será excluído'}.`
            : ''
          return `${deleteTarget.codigo} — ${deleteTarget.descricao}.${aviso} Esta ação não pode ser desfeita.`
        })()}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
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
              Centros de Custo
            </Heading>
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.fg.muted, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
            <p style={{ margin: `0 0 ${t.space[3]}px` }}>
              Os <strong style={{ color: colors.fg.default }}>Centros de Custo</strong> são unidades organizacionais
              utilizadas para apropriar receitas e despesas, permitindo análises por área, atividade ou projeto.
            </p>
            <ul style={{ margin: 0, padding: `0 0 0 ${t.space[5]}px`, display: 'flex', flexDirection: 'column', gap: t.space[2] - 2 }}>
              <li><strong>Sintético:</strong> centro raiz, agrupa outros centros. Não recebe lançamentos diretos.</li>
              <li><strong>Analítico:</strong> nível operacional, recebe apontamentos e movimentações.</li>
              <li><strong>Condição:</strong> define se o centro aceita receitas, despesas ou ambos.</li>
              <li><strong>Categorias:</strong> vincula o centro às categorias financeiras habilitadas.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Centros de Custo"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Condição"
          options={[
            { value: '',        label: 'Todas'   },
            { value: 'ambos',   label: 'Ambos'   },
            { value: 'receita', label: 'Receita' },
            { value: 'despesa', label: 'Despesa' },
          ]}
          value={filters.condicao}
          onChange={e => setFilters(f => ({ ...f, condicao: e.target.value }))}
        />
        <FormSelect
          label="Classe"
          options={[
            { value: '',          label: 'Todas'     },
            { value: 'sintetica', label: 'Sintética' },
            { value: 'analitica', label: 'Analítica' },
          ]}
          value={filters.classe}
          onChange={e => setFilters(f => ({ ...f, classe: e.target.value }))}
        />
        <FormSelect
          label="Status"
          options={[
            { value: '',    label: 'Todos'  },
            { value: 'sim', label: 'Ativo'  },
            { value: 'nao', label: 'Inativo'},
          ]}
          value={filters.ativo}
          onChange={e => setFilters(f => ({ ...f, ativo: e.target.value }))}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

function CCRow({
  cc, isLast, onEdit, onDelete, colors, border,
}: {
  cc:      CentroCusto
  isLast:  boolean
  onEdit:  () => void
  onDelete: () => void
  colors:  ReturnType<typeof useTheme>['colors']
  border:  string
}) {
  const classe = classeOf(cc.antecessorId)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 110px 110px 1fr 90px 60px',
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
      <span title={cc.codigo} style={{
        fontSize: t.font.size.sm,
        fontWeight: t.font.weight.semibold,
        color: colors.fg.default,
        fontFamily: t.font.family.sans,
        fontVariantNumeric: 'tabular-nums',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {cc.codigo}
      </span>

      {/* Classe */}
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
        padding: '2px 8px', borderRadius: t.radius.full,
        background: classe === 'sintetica' ? t.color.feedback.info.bg : t.color.brand[50],
        color:      classe === 'sintetica' ? t.color.feedback.info.text : t.color.brand[600],
        fontFamily: t.font.family.sans,
        width: 'fit-content',
      }}>
        {CLASSE_LABEL[classe]}
      </span>

      {/* Condição */}
      <span title={CONDICAO_LABEL[cc.condicao]} style={{
        fontSize: t.font.size.sm,
        color: colors.fg.muted,
        fontFamily: t.font.family.sans,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {CONDICAO_LABEL[cc.condicao]}
      </span>

      {/* Descrição */}
      <span title={cc.descricao} style={{
        fontSize: t.font.size.base,
        color: colors.fg.default,
        fontFamily: t.font.family.sans,
        paddingLeft: cc.antecessorId !== null ? 16 : 0,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {cc.descricao}
      </span>

      {/* Ativo */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Badge
          label={cc.ativo === 'sim' ? 'Ativo' : 'Inativo'}
          variant={cc.ativo === 'sim' ? 'success' : 'neutral'}
        />
      </div>

      {/* Ação */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DropdownMenu
          align="right"
          ariaLabel="Ações do centro de custo"
          items={[
            { id: 'edit',   label: 'Editar', icon: <Pencil size={13} />, onClick: onEdit },
            { id: 'delete', label: 'Excluir', icon: <Trash2 size={13} />, onClick: onDelete, danger: true, divider: true },
          ]}
        />
      </div>
    </div>
  )
}
