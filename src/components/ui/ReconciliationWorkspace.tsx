import { ArrowRight, Link2, Plus } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Badge } from './Badge'
import { Button } from './Button'
import { formatCurrency } from './CurrencyField'
import { EmptyState } from './EmptyState'

export type ReconciliationStatus = 'pending' | 'matched' | 'created'

export interface ReconciliationItem {
  id: string
  date: string
  description: string
  amount: number
  status?: ReconciliationStatus
}

interface ReconciliationWorkspaceProps {
  bankItems: ReconciliationItem[]
  systemItems: ReconciliationItem[]
  onLink: (bankItem: ReconciliationItem) => void
  onCreate: (bankItem: ReconciliationItem) => void
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'warning' as const },
  matched: { label: 'Conciliado', variant: 'success' as const },
  created: { label: 'Movimento criado', variant: 'info' as const },
}

function MovementCard({ item, actions }: { item: ReconciliationItem; actions?: React.ReactNode }) {
  const { colors } = useTheme()
  const status = statusConfig[item.status ?? 'pending']
  return (
    <article style={{ padding: t.space[4], border: `1px solid ${colors.border.default}`, borderRadius: t.radius.lg, background: colors.bg.surface }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: t.space[3] }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.base, fontWeight: t.font.weight.semibold }}>{item.description}</div>
          <div style={{ marginTop: t.space[1], color: colors.fg.subtle, fontFamily: t.font.family.sans, fontSize: t.font.size.sm }}>{item.date}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: item.amount < 0 ? t.color.feedback.error.text : t.color.feedback.success.text, fontFamily: t.font.family.sans, fontSize: t.font.size.base, fontWeight: t.font.weight.bold }}>{formatCurrency(item.amount)}</div>
          <div style={{ marginTop: t.space[1] }}><Badge label={status.label} variant={status.variant} /></div>
        </div>
      </div>
      {actions && <div style={{ display: 'flex', gap: t.space[2], justifyContent: 'flex-end', marginTop: t.space[3], paddingTop: t.space[3], borderTop: `1px solid ${colors.border.subtle}` }}>{actions}</div>}
    </article>
  )
}

export function ReconciliationWorkspace({ bankItems, systemItems, onLink, onCreate }: ReconciliationWorkspaceProps) {
  const { colors } = useTheme()
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]" style={{ gap: t.space[4], alignItems: 'start' }}>
      <section aria-labelledby="bank-movements-title">
        <h2 id="bank-movements-title" style={{ margin: `0 0 ${t.space[3]}px`, color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.md, fontWeight: t.font.weight.semibold }}>Arquivo do banco</h2>
        <div style={{ display: 'grid', gap: t.space[3] }}>
          {bankItems.length === 0 ? <EmptyState message="Nenhum movimento bancário pendente." /> : bankItems.map((item) => (
            <MovementCard key={item.id} item={item} actions={item.status === 'pending' || !item.status ? <><Button variant="ghost" size="sm" icon={<Link2 size={14} />} onClick={() => onLink(item)}>Vincular título</Button><Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => onCreate(item)}>Criar movimento</Button></> : undefined} />
          ))}
        </div>
      </section>
      <div aria-hidden="true" className="rotate-90 xl:rotate-0" style={{ width: t.size.iconBtn.md, height: t.size.iconBtn.md, marginTop: t.space[8], borderRadius: t.radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.accent.subtle, color: colors.accent.default }}><ArrowRight size={t.icon.xs} /></div>
      <section aria-labelledby="system-movements-title">
        <h2 id="system-movements-title" style={{ margin: `0 0 ${t.space[3]}px`, color: colors.fg.default, fontFamily: t.font.family.sans, fontSize: t.font.size.md, fontWeight: t.font.weight.semibold }}>Movimentos do sistema</h2>
        <div style={{ display: 'grid', gap: t.space[3] }}>
          {systemItems.length === 0 ? <EmptyState message="Nenhum movimento compatível encontrado." /> : systemItems.map((item) => <MovementCard key={item.id} item={item} />)}
        </div>
      </section>
    </div>
  )
}
