import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Plus, Pencil, Trash2, Search, X, MoreVertical,
  TrendingUp, TrendingDown, HelpCircle, AlertTriangle,
} from 'lucide-react'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { Button }        from '../../../components/ui/Button'
import { Badge }         from '../../../components/ui/Badge'
import { t }             from '../../../design/tokens'
import { useTheme }      from '../../../context/ThemeContext'
import {
  classeOf, CONDICAO_LABEL, TIPO_LABEL, CLASSE_LABEL,
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
  const [page,        setPage]        = useState(1)
  const [deleteId,    setDeleteId]    = useState<number | null>(null)
  const [saibaMais,   setSaibaMais]   = useState(false)
  const [openMenuId,  setOpenMenuId]  = useState<number | null>(null)

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total     = centros.length
    const sinteticas = centros.filter(c => c.antecessorId === null).length
    const analiticas = centros.filter(c => c.antecessorId !== null).length
    const ativas    = centros.filter(c => c.ativo === 'sim').length
    const ativasPct = total > 0 ? Math.round((ativas / total) * 100) : 0
    return { total, sinteticas, analiticas, ativas, ativasPct }
  }, [centros])

  // ── Dados filtrados ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return centros
    return centros.filter(c =>
      c.codigo.toLowerCase().includes(q) ||
      c.descricao.toLowerCase().includes(q) ||
      CONDICAO_LABEL[c.condicao].toLowerCase().includes(q) ||
      TIPO_LABEL[c.tipo].toLowerCase().includes(q)
    )
  }, [centros, search])

  // Reset para página 1 ao filtrar
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Fechar dropdown ao clicar fora ────────────────────────────────────────
  useEffect(() => {
    if (openMenuId === null) return
    const handler = () => setOpenMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMenuId])

  const cardBg = isGbMode ? 'rgba(255,255,255,0.04)' : colors.surfaceBg
  const border = colors.border

  // ── Confirmar exclusão ────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setDeleteId(null)
      showToast('Centro de custo excluído com sucesso.')
    }
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3400)
  }

  const deleteTarget = centros.find(c => c.id === deleteId)

  return (
    <PageContainer>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Centros de Custo"
        count={centros.length}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setSaibaMais(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 14px',
                background: colors.surfaceBg,
                border: `1.5px solid ${colors.border}`,
                borderRadius: t.radius.DEFAULT,
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.medium,
                fontFamily: t.font.family.sans,
                color: colors.textSecondary,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = colors.surfaceSubtle
                e.currentTarget.style.borderColor = colors.brand
                e.currentTarget.style.color = colors.brand
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = colors.surfaceBg
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.textSecondary
              }}
            >
              <HelpCircle size={14} />
              Saiba mais
            </button>
            <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={onNew}>
              Novo Centro
            </Button>
          </div>
        }
      />

      {/* ── KPI Bar ─────────────────────────────────────────────────────── */}
      <div style={{
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
              color: colors.textMuted,
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
                color: colors.textPrimary,
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
                  color: item.trend === 'up' ? t.color.success.text : item.trend === 'down' ? t.color.error.text : colors.textMuted,
                  background: item.trend === 'up' ? t.color.success.bg : item.trend === 'down' ? t.color.error.bg : colors.surfaceSubtle,
                  padding: '2px 6px', borderRadius: t.radius.full,
                }}>
                  {item.trend === 'up'   && <TrendingUp  size={10} />}
                  {item.trend === 'down' && <TrendingDown size={10} />}
                  {item.trendValue}
                </span>
              )}
              {'sub' in item && item.sub && (
                <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
                  {item.sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <CCSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} colors={colors} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* ── Tabela ──────────────────────────────────────────────────────── */}
      <div style={{
        background: colors.surfaceBg,
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
          background: colors.surfaceSubtle,
        }}>
          {['CÓDIGO', 'CLASSE', 'CONDIÇÃO', 'DESCRIÇÃO', 'ATIVO', 'AÇÃO'].map((h, i) => (
            <div
              key={h}
              style={{
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.semibold,
                color: colors.textMuted,
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
        {paginated.length === 0 ? (
          <div style={{
            padding: '48px 16px',
            textAlign: 'center',
            color: colors.textMuted,
            fontSize: t.font.size.base,
            fontFamily: t.font.family.sans,
          }}>
            Nenhum centro de custo encontrado.
          </div>
        ) : (
          paginated.map((cc, idx) => (
            <CCRow
              key={cc.id}
              cc={cc}
              isLast={idx === paginated.length - 1}
              isMenuOpen={openMenuId === cc.id}
              onMenuToggle={(e) => {
                e.stopPropagation()
                setOpenMenuId(prev => prev === cc.id ? null : cc.id)
              }}
              onEdit={() => { setOpenMenuId(null); onEdit(cc.id) }}
              onDelete={() => { setOpenMenuId(null); setDeleteId(cc.id) }}
              colors={colors}
              border={border}
            />
          ))
        )}
      </div>

      {/* ── Paginação ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Pagination page={page} total={totalPages} onChange={setPage} colors={colors} />
      )}

      {/* ── Modal: Confirmar exclusão ────────────────────────────────────── */}
      {deleteId !== null && (
        <Modal onClose={() => setDeleteId(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: t.color.error.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={22} color={t.color.error.text} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: t.font.size.lg, fontWeight: t.font.weight.semibold, color: colors.textPrimary, fontFamily: t.font.family.sans, marginBottom: 6 }}>
                Excluir centro de custo?
              </div>
              <div style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: 1.5 }}>
                <strong>{deleteTarget?.codigo}</strong> — {deleteTarget?.descricao}
                <br />Esta ação não pode ser desfeita.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                style={{ flex: 1 }}
                onClick={handleConfirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Saiba mais ────────────────────────────────────────────── */}
      {saibaMais && (
        <Modal onClose={() => setSaibaMais(false)} width={560}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: colors.brandBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <HelpCircle size={22} color={colors.brand} />
              </div>
              <h2 style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.bold, color: colors.textPrimary, margin: 0, fontFamily: t.font.family.sans }}>
                Centros de Custo
              </h2>
            </div>
            <div style={{ fontSize: t.font.size.base, color: colors.textSecondary, fontFamily: t.font.family.sans, lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 12px' }}>
                Os <strong style={{ color: colors.textPrimary }}>Centros de Custo</strong> são unidades organizacionais
                utilizadas para apropriar receitas e despesas, permitindo análises por área, atividade ou projeto.
              </p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Sintético:</strong> centro raiz, agrupa outros centros. Não recebe lançamentos diretos.</li>
                <li><strong>Analítico:</strong> nível operacional, recebe apontamentos e movimentações.</li>
                <li><strong>Condição:</strong> define se o centro aceita receitas, despesas ou ambos.</li>
                <li><strong>Categorias:</strong> vincula o centro às categorias financeiras habilitadas.</li>
              </ul>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setSaibaMais(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#14532d', color: 'white',
          padding: '11px 20px', borderRadius: t.radius.lg,
          fontSize: t.font.size.base, fontWeight: t.font.weight.medium,
          fontFamily: t.font.family.sans, boxShadow: t.shadow.lg,
          zIndex: t.zIndex.toast,
          animation: 'toastIn 0.22s ease',
        }}>
          {toastMsg}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }`}</style>

    </PageContainer>
  )
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

function CCRow({
  cc, isLast, isMenuOpen, onMenuToggle, onEdit, onDelete, colors, border,
}: {
  cc:           CentroCusto
  isLast:       boolean
  isMenuOpen:   boolean
  onMenuToggle: (e: React.MouseEvent) => void
  onEdit:       () => void
  onDelete:     () => void
  colors:       ReturnType<typeof useTheme>['colors']
  border:       string
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const classe  = classeOf(cc.antecessorId)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 110px 110px 1fr 90px 60px',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        alignItems: 'center',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = colors.surfaceSubtle }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Código */}
      <span style={{
        fontSize: t.font.size.sm,
        fontWeight: t.font.weight.semibold,
        color: colors.textPrimary,
        fontFamily: t.font.family.sans,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {cc.codigo}
      </span>

      {/* Classe */}
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
        padding: '2px 8px', borderRadius: t.radius.full,
        background: classe === 'sintetica' ? '#eff6ff' : '#f0fdf4',
        color:      classe === 'sintetica' ? '#2563eb' : '#059669',
        fontFamily: t.font.family.sans,
        width: 'fit-content',
      }}>
        {CLASSE_LABEL[classe]}
      </span>

      {/* Condição */}
      <span style={{
        fontSize: t.font.size.sm,
        color: colors.textSecondary,
        fontFamily: t.font.family.sans,
      }}>
        {CONDICAO_LABEL[cc.condicao]}
      </span>

      {/* Descrição */}
      <span style={{
        fontSize: t.font.size.base,
        color: colors.textPrimary,
        fontFamily: t.font.family.sans,
        paddingLeft: cc.antecessorId !== null ? 16 : 0,
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
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }} ref={menuRef}>
        <button
          type="button"
          onClick={onMenuToggle}
          style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isMenuOpen ? colors.brandBg : 'transparent',
            border: `1px solid ${isMenuOpen ? colors.brand : 'transparent'}`,
            borderRadius: t.radius.DEFAULT,
            cursor: 'pointer',
            color: isMenuOpen ? colors.brand : colors.textSecondary,
            transition: 'background 0.12s, border-color 0.12s',
          }}
          onMouseEnter={e => {
            if (!isMenuOpen) {
              e.currentTarget.style.background = colors.surfaceSubtle
              e.currentTarget.style.borderColor = colors.border
            }
          }}
          onMouseLeave={e => {
            if (!isMenuOpen) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }
          }}
        >
          <MoreVertical size={15} />
        </button>

        {isMenuOpen && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              background: colors.surfaceBg,
              border: `1px solid ${colors.border}`,
              borderRadius: t.radius.lg,
              boxShadow: t.shadow.lg,
              zIndex: t.zIndex.dropdown,
              minWidth: 150,
              overflow: 'hidden',
            }}
          >
            <DropdownItem icon={<Pencil size={13} />} label="Editar" onClick={onEdit} colors={colors} />
            <div style={{ height: 1, background: colors.borderSubtle }} />
            <DropdownItem icon={<Trash2 size={13} />} label="Excluir" onClick={onDelete} colors={colors} danger />
          </div>
        )}
      </div>
    </div>
  )
}

function DropdownItem({
  icon, label, onClick, colors, danger = false,
}: {
  icon:    React.ReactNode
  label:   string
  onClick: () => void
  colors:  ReturnType<typeof useTheme>['colors']
  danger?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '9px 14px',
        border: 'none', cursor: 'pointer',
        background: hov
          ? (danger ? t.color.error.bg : colors.surfaceSubtle)
          : 'transparent',
        color: danger
          ? (hov ? t.color.error.text : colors.textSecondary)
          : (hov ? colors.textPrimary : colors.textSecondary),
        fontSize: t.font.size.sm,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.medium,
        transition: 'background 0.12s, color 0.12s',
        textAlign: 'left',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Paginação ────────────────────────────────────────────────────────────────

function Pagination({
  page, total, onChange, colors,
}: {
  page:     number
  total:    number
  onChange: (p: number) => void
  colors:   ReturnType<typeof useTheme>['colors']
}) {
  const pages = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      gap: 4, marginTop: 16,
    }}>
      <PageBtn
        label="‹"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        colors={colors}
      />
      {pages.map(p => (
        <PageBtn
          key={p}
          label={String(p)}
          active={p === page}
          onClick={() => onChange(p)}
          colors={colors}
        />
      ))}
      <PageBtn
        label="›"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        colors={colors}
      />
    </div>
  )
}

function PageBtn({
  label, active = false, disabled = false, onClick, colors,
}: {
  label:     string
  active?:   boolean
  disabled?: boolean
  onClick:   () => void
  colors:    ReturnType<typeof useTheme>['colors']
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${active ? colors.brand : colors.border}`,
        borderRadius: t.radius.DEFAULT,
        background: active ? colors.brandBg : 'transparent',
        color: active ? colors.brand : disabled ? colors.textMuted : colors.textSecondary,
        fontSize: t.font.size.sm,
        fontFamily: t.font.family.sans,
        fontWeight: active ? t.font.weight.semibold : t.font.weight.normal,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.12s, border-color 0.12s',
      }}
    >
      {label}
    </button>
  )
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

function CCSearchInput({
  value, onChange, colors,
}: {
  value:    string
  onChange: (v: string) => void
  colors:   ReturnType<typeof useTheme>['colors']
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      height: 34,
      border: `1.5px solid ${focused ? t.color.brand[600] : colors.border}`,
      borderRadius: t.radius.DEFAULT,
      padding: '0 10px',
      background: colors.surfaceBg,
      transition: 'border-color 0.15s',
      minWidth: 240,
    }}>
      <Search size={13} color={focused ? t.color.brand[600] : colors.textMuted} style={{ flexShrink: 0 }} />
      <input
        type="search"
        placeholder="Buscar por código, descrição..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', background: 'transparent',
          outline: 'none', fontSize: t.font.size.sm,
          color: colors.textPrimary, fontFamily: t.font.family.sans, minWidth: 0,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: colors.textMuted }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}

// ─── Modal genérico ───────────────────────────────────────────────────────────

function Modal({
  children,
  onClose,
  width = 440,
}: {
  children: React.ReactNode
  onClose:  () => void
  width?:   number
}) {
  const { colors } = useTheme()
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: t.zIndex.modal,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.surfaceBg,
          borderRadius: t.radius['2xl'],
          padding: 28,
          width: '100%',
          maxWidth: width,
          boxShadow: t.shadow.xl,
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
