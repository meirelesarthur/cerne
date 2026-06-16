import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, HelpCircle, Users } from 'lucide-react'
import { PageContainer }   from '../../../components/ui/PageContainer'
import { PageCard }        from '../../../components/ui/PageCard'
import { PageHeader }      from '../../../components/ui/PageHeader'
import { Button }          from '../../../components/ui/Button'
import { Heading }         from '../../../components/ui/Heading'
import { Modal }           from '../../../components/ui/Modal'
import { Badge }           from '../../../components/ui/Badge'
import { Avatar }          from '../../../components/ui/Avatar'
import { FilterDrawer }    from '../../../components/ui/FilterDrawer'
import { FormSelect }      from '../../../components/ui/FormSelect'
import { ListToolbar }     from '../../../components/ui/ListToolbar'
import { Pagination }      from '../../../components/ui/Pagination'
import { Skeleton }        from '../../../components/ui/Skeleton'
import { EmptyState }      from '../../../components/ui/EmptyState'
import { DropdownMenu }    from '../../../components/ui/DropdownMenu'
import { ConfirmDialog }   from '../../../components/ui/ConfirmDialog'
import { useToast, ToastContainer } from '../../../components/ui/Toast'
import { t }               from '../../../design/tokens'
import { useTheme }        from '../../../context/ThemeContext'
import { usePermission }   from '../../../auth'
import {
  ROLES, activeRoles, maskNif, docTypeOf, cidadeLabel,
  type Pessoa, type RoleKey,
} from './pessoas.types'

interface PessoasListaProps {
  pessoas:  Pessoa[]
  onNew:    () => void
  onEdit:   (id: number) => void
  onView:   (id: number) => void
  onDelete: (id: number) => void
}

const PAGE_SIZE = 8
const GRID = '2.2fr 150px 2fr 1.6fr 56px'

export default function PessoasLista({ pessoas, onNew, onEdit, onView, onDelete }: PessoasListaProps) {
  const { colors }   = useTheme()
  const { can }      = usePermission()
  const canDelete    = can('pessoa.delete')

  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState<'' | RoleKey>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page,       setPage]       = useState(1)
  const [deleteId,   setDeleteId]   = useState<number | null>(null)
  const [saibaMais,  setSaibaMais]  = useState(false)
  const [isLoading,  setIsLoading]  = useState(true)
  const { toasts, show, dismiss }   = useToast()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), t.delay.loadingMin)
    return () => clearTimeout(timer)
  }, [])

  const activeFilterCount = roleFilter ? 1 : 0
  const clearFilters = () => setRoleFilter('')

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = pessoas.length
    const pf    = pessoas.filter((p) => docTypeOf(p.nif) === 'cpf').length
    const pj    = pessoas.filter((p) => docTypeOf(p.nif) === 'cnpj').length
    const acesso = pessoas.filter((p) => p.user.enabled).length
    return { total, pf, pj, acesso }
  }, [pessoas])

  // ── Filtragem ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pessoas.filter((p) => {
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.nickname.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || maskNif(p.nif).toLowerCase().includes(q)
        || p.nif.includes(q.replace(/\D/g, ''))
      const matchRole = !roleFilter || p[roleFilter].enabled
      return matchSearch && matchRole
    })
  }, [pessoas, search, roleFilter])

  useEffect(() => { setPage(1) }, [search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const deleteTarget = pessoas.find((p) => p.id === deleteId)

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      show('Pessoa excluída com sucesso.', 'info')
    }
  }

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <PageHeader
          title="Pessoas"
          count={pessoas.length}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <Button variant="ghost" size="sm" icon={<HelpCircle size={14} />} onClick={() => setSaibaMais(true)}>
                Saiba mais
              </Button>
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
                Nova Pessoa
              </Button>
            </div>
          }
        />

        {/* ── KPI Bar ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.space[4], marginBottom: t.space[4] }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rect" width="100%" height={72} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
            border: `1px solid ${colors.border}`, borderRadius: t.radius.lg,
            overflow: 'hidden', marginBottom: t.space[4],
          }}>
            {[
              { label: 'Total de Pessoas', value: kpis.total },
              { label: 'Pessoas Físicas',  value: kpis.pf },
              { label: 'Pessoas Jurídicas', value: kpis.pj },
              { label: 'Com Acesso',        value: kpis.acesso },
            ].map((item, idx, arr) => (
              <div key={item.label} style={{
                padding: `${t.space[4]}px ${t.space[5]}px`,
                background: colors.surfaceBg,
                borderRight: idx < arr.length - 1 ? `1px solid ${colors.border}` : undefined,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <span style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                  color: colors.textMuted, fontFamily: t.font.family.sans,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold,
                  color: colors.textPrimary, fontFamily: t.font.family.sans, lineHeight: 1,
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <ListToolbar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1) }}
          searchPlaceholder="Buscar por nome, e-mail ou CPF/CNPJ..."
          onOpenFilter={() => setDrawerOpen(true)}
          filterCount={activeFilterCount}
          onClearAll={clearFilters}
          chips={[
            roleFilter && {
              label: `Papel: ${ROLES.find((r) => r.key === roleFilter)?.label}`,
              onRemove: () => setRoleFilter(''),
            },
          ]}
        />

        {/* ── Tabela ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rect" width="100%" height={t.size.tableRow} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            variant={search || roleFilter ? 'search' : 'empty'}
            message={search || roleFilter ? 'Nenhuma pessoa encontrada.' : 'Nenhuma pessoa cadastrada.'}
            description={search || roleFilter ? 'Tente ajustar os filtros ou limpar a busca.' : 'Cadastre a primeira pessoa para começar.'}
            action={search || roleFilter ? undefined : { label: 'Nova Pessoa', onClick: onNew }}
          />
        ) : (
          <>
            <div style={{
              background: colors.surfaceBg, border: `1px solid ${colors.border}`,
              borderRadius: t.radius.lg, overflow: 'hidden',
            }}>
              {/* Cabeçalho */}
              <div style={{
                display: 'grid', gridTemplateColumns: GRID,
                padding: '10px 16px', borderBottom: `1px solid ${colors.border}`,
                background: colors.surfaceSubtle,
              }}>
                {['NOME', 'CPF / CNPJ', 'E-MAIL', 'ENTIDADES', 'AÇÃO'].map((h, i) => (
                  <div key={h} style={{
                    fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
                    color: colors.textMuted, fontFamily: t.font.family.sans,
                    letterSpacing: '0.06em', textAlign: i === 4 ? 'center' : 'left',
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Linhas */}
              {paginated.map((p, idx) => (
                <PessoaRow
                  key={p.id}
                  pessoa={p}
                  isLast={idx === paginated.length - 1}
                  canDelete={canDelete}
                  onView={() => onView(p.id)}
                  onEdit={() => onEdit(p.id)}
                  onDelete={() => setDeleteId(p.id)}
                  colors={colors}
                />
              ))}
            </div>

            {filtered.length > PAGE_SIZE && (
              <div style={{ marginTop: t.space[4], paddingTop: t.space[4], borderTop: `1px solid ${colors.borderSubtle}` }}>
                <Pagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            )}
          </>
        )}

      </PageCard>

      {/* ── Overlays ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteId !== null}
        tone="destructive"
        title="Excluir pessoa?"
        message={deleteTarget
          ? `${deleteTarget.name} — ${maskNif(deleteTarget.nif)}\nRegistros vinculados (NF-e, movimentos, acesso) podem ser afetados. Esta ação não pode ser desfeita.`
          : 'Esta ação não pode ser desfeita.'}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
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
            <div style={{
              width: t.space[10], height: t.space[10], borderRadius: t.radius.xl,
              background: colors.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Users size={22} color={colors.brand} />
            </div>
            <Heading level={2} size="xl" weight="bold">Pessoas Unificado</Heading>
          </div>
          <div style={{ fontSize: t.font.size.base, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: t.font.lineHeight.relaxed }}>
            <p style={{ margin: `0 0 ${t.space[3]}px` }}>
              Uma <strong style={{ color: colors.textPrimary }}>Pessoa</strong> é a identidade única do sistema.
              Cada cadastro pode acumular até cinco papéis simultâneos — não é mais necessário recadastrar
              a mesma pessoa em Proprietários, Funcionários, Fornecedores e Clientes.
            </p>
            <ul style={{ margin: 0, padding: `0 0 0 ${t.space[5]}px`, display: 'flex', flexDirection: 'column', gap: t.space[2] - 2 }}>
              {ROLES.map((r) => (
                <li key={r.key}><strong>{r.label}:</strong> {r.hint}</li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearFilters}
        title="Filtrar Pessoas"
        activeCount={activeFilterCount}
      >
        <FormSelect
          label="Papel"
          options={[
            { value: '', label: 'Todos os papéis' },
            ...ROLES.map((r) => ({ value: r.key, label: r.label })),
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as '' | RoleKey)}
        />
      </FilterDrawer>

    </PageContainer>
  )
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

function PessoaRow({
  pessoa, isLast, canDelete, onView, onEdit, onDelete, colors,
}: {
  pessoa:    Pessoa
  isLast:    boolean
  canDelete: boolean
  onView:    () => void
  onEdit:    () => void
  onDelete:  () => void
  colors:    ReturnType<typeof useTheme>['colors']
}) {
  const roles = activeRoles(pessoa)

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: GRID,
        padding: '0 16px', minHeight: t.size.tableRow,
        borderBottom: isLast ? 'none' : `1px solid ${colors.border}`,
        alignItems: 'center', transition: `background ${t.transition.fast}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceSubtle }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Nome + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] + 2, minWidth: 0, paddingRight: t.space[3] }}>
        <Avatar name={pessoa.name} size="sm" />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: t.font.size.base, fontWeight: t.font.weight.semibold,
            color: colors.textPrimary, fontFamily: t.font.family.sans,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {pessoa.name}
          </div>
          <div style={{
            fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {cidadeLabel(pessoa.cityId)}
          </div>
        </div>
      </div>

      {/* CPF / CNPJ */}
      <span style={{
        fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {maskNif(pessoa.nif)}
      </span>

      {/* E-mail */}
      <span title={pessoa.email} style={{
        fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans,
        minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: t.space[3],
      }}>
        {pessoa.email || '—'}
      </span>

      {/* Entidades (badges acessíveis: texto + cor) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingRight: t.space[2] }}>
        {roles.length === 0
          ? <Badge label="Sem papel" variant="neutral" />
          : roles.map((r) => <Badge key={r.key} label={r.label} variant={r.variant} />)}
      </div>

      {/* Ação */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DropdownMenu
          align="right"
          ariaLabel={`Ações de ${pessoa.name}`}
          items={[
            { id: 'view', label: 'Ver detalhes', icon: <Eye size={13} />, onClick: onView },
            { id: 'edit', label: 'Editar', icon: <Pencil size={13} />, onClick: onEdit },
            ...(canDelete
              ? [{ id: 'delete', label: 'Excluir…', icon: <Trash2 size={13} />, onClick: onDelete, danger: true, divider: true }]
              : []),
          ]}
        />
      </div>
    </div>
  )
}
