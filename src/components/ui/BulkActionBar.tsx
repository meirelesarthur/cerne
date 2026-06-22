import { useState } from 'react'
import { CheckSquare, X } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

export interface BulkAction {
  label:   string
  onClick: () => void
  danger?: boolean
}

interface BulkActionBarProps {
  /** Quantidade de itens selecionados. Barra some quando 0. */
  count:   number
  actions: BulkAction[]
  onClose: () => void
  /** Substantivo singular para a contagem (default: "selecionado"). */
  noun?:   string
}

/**
 * Barra flutuante de ações em massa (fixada no rodapé central) exibida quando há
 * itens selecionados em uma listagem. Substitui o `BulkBtn`/bulk-bar inline da
 * ProdutosLista (Lei 1 / Regra A) e centraliza o padrão para outras listas.
 */
export function BulkActionBar({ count, actions, onClose, noun = 'selecionado' }: BulkActionBarProps) {
  const { isGbMode } = useTheme()
  if (count <= 0) return null
  const plural = count !== 1 ? 's' : ''

  // GBMode: translucent green-tinted surface; light: solid neutral[800]
  const barBg      = isGbMode ? t.color.gb.surface  : t.color.neutral[800]
  const barBorder  = isGbMode ? `1px solid ${t.color.brand[700]}` : 'none'
  const accentColor = isGbMode ? t.color.gb.accent  : t.color.brand[400]
  const textColor  = t.color.neutral[0]
  const dividerColor = isGbMode ? t.color.brand[700] : t.color.neutral[600]

  return (
    <div
      role="toolbar"
      aria-label="Ações em massa"
      style={{
        position:     'fixed',
        bottom:       t.space[7],
        left:         '50%',
        transform:    'translateX(-50%)',
        background:   barBg,
        border:       barBorder,
        borderRadius: t.radius.xl,
        padding:      `${t.space[2] + 2}px ${t.space[5]}px`,
        display:      'flex',
        alignItems:   'center',
        gap:          t.space[3],
        boxShadow:    t.shadow.lg,
        zIndex:       t.zIndex.toast,
        whiteSpace:   'nowrap',
      }}
    >
      <CheckSquare size={15} color={accentColor} aria-hidden="true" />
      <span style={{
        fontSize:   t.font.size.sm,
        fontWeight: t.font.weight.semibold,
        color:      textColor,
        fontFamily: t.font.family.sans,
      }}>
        {count} {noun}{plural}
      </span>

      <span aria-hidden="true" style={{ width: 1, height: t.space[5], background: dividerColor }} />

      {actions.map((a) => (
        <BarButton key={a.label} action={a} />
      ))}

      <button
        type="button"
        onClick={onClose}
        aria-label="Limpar seleção"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: t.color.neutral[400], padding: t.space[1],
          display: 'flex', alignItems: 'center', marginLeft: t.space[1],
          borderRadius: t.radius.sm,
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

function BarButton({ action }: { action: BulkAction }) {
  const [hov, setHov] = useState(false)
  const { label, onClick, danger } = action

  const bg = hov
    ? (danger ? t.color.feedback.error.solid : t.color.brand[600])
    : (danger ? t.color.feedback.error.solid + '33' : t.color.neutral[700])
  const color = danger && !hov ? t.color.feedback.error.border : t.color.neutral[0]

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:      `${t.space[1]}px ${t.space[3]}px`,
        borderRadius: t.radius.base,
        border:       'none',
        cursor:       'pointer',
        fontSize:     t.font.size.xs,
        fontWeight:   t.font.weight.semibold,
        fontFamily:   t.font.family.sans,
        background:   bg,
        color,
        transition:   `background ${t.transition.base}, color ${t.transition.base}`,
      }}
    >
      {label}
    </button>
  )
}
