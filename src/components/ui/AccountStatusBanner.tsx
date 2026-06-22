import React from 'react'
import { AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'
import { usePlan } from '../../auth/PlanContext'
import type { AccountStatus } from '../../auth/PlanContext'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AccountStatusBannerProps {
  /**
   * Status da conta. Se omitido, lê do `usePlan()`.
   * Passe explicitamente para sobrescrever o contexto (ex.: em stories).
   */
  status?: AccountStatus
  /** Dias restantes do trial. Lido do contexto se omitido. */
  trialDaysLeft?: number
  /** Callback do botão de ação. */
  onAction?: () => void
  /** Rótulo do botão de ação. Padrão varia por status. */
  actionLabel?: string
}

// ─── Config por status ────────────────────────────────────────────────────────

interface BannerConfig {
  icon:        React.ReactNode
  bg:          string
  bgGb:        string
  border:      string
  borderGb:    string
  text:        string
  textGb:      string
  defaultMsg:  (days?: number) => string
  defaultAction: string
}

const ICON_SIZE = 16

const CONFIG: Partial<Record<AccountStatus, BannerConfig>> = {
  trial: {
    icon:         <Clock size={ICON_SIZE} aria-hidden="true" />,
    bg:           t.color.feedback.warning.bg,
    bgGb:         'rgba(217,119,6,0.12)',
    border:       t.color.feedback.warning.border,
    borderGb:     'rgba(217,119,6,0.25)',
    text:         t.color.feedback.warning.text,
    textGb:       '#fbbf24',
    defaultMsg:   (days) =>
      days !== undefined
        ? `Você está no período de avaliação. ${days} ${days === 1 ? 'dia restante' : 'dias restantes'}.`
        : 'Você está no período de avaliação gratuita.',
    defaultAction: 'Fazer upgrade',
  },
  past_due: {
    icon:         <AlertCircle size={ICON_SIZE} aria-hidden="true" />,
    bg:           t.color.feedback.warning.bg,
    bgGb:         'rgba(217,119,6,0.12)',
    border:       t.color.feedback.warning.border,
    borderGb:     'rgba(217,119,6,0.25)',
    text:         t.color.feedback.warning.text,
    textGb:       '#fbbf24',
    defaultMsg:   () => 'Pagamento em atraso. Regularize para continuar usando todos os recursos.',
    defaultAction: 'Regularizar pagamento',
  },
  suspended: {
    icon:         <AlertTriangle size={ICON_SIZE} aria-hidden="true" />,
    bg:           t.color.feedback.error.bg,
    bgGb:         'rgba(220,38,38,0.12)',
    border:       t.color.feedback.error.border,
    borderGb:     'rgba(220,38,38,0.25)',
    text:         t.color.feedback.error.text,
    textGb:       '#f87171',
    defaultMsg:   () => 'Conta suspensa. Entre em contato com o suporte ou regularize o pagamento.',
    defaultAction: 'Regularizar conta',
  },
  expired: {
    icon:         <Info size={ICON_SIZE} aria-hidden="true" />,
    bg:           t.color.feedback.error.bg,
    bgGb:         'rgba(220,38,38,0.12)',
    border:       t.color.feedback.error.border,
    borderGb:     'rgba(220,38,38,0.25)',
    text:         t.color.feedback.error.text,
    textGb:       '#f87171',
    defaultMsg:   () => 'Sua assinatura expirou. Renove para continuar acessando a plataforma.',
    defaultAction: 'Renovar assinatura',
  },
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AccountStatusBanner({
  status: statusProp,
  trialDaysLeft: trialDaysLeftProp,
  onAction,
  actionLabel,
}: AccountStatusBannerProps) {
  const plan         = usePlan()
  const { isGbMode } = useTheme()

  const status       = statusProp      ?? plan.status
  const trialDaysLeft = trialDaysLeftProp ?? plan.trialDaysLeft

  // Não renderiza nada para contas ativas
  if (status === 'active') return null

  const cfg = CONFIG[status]
  // Status desconhecido sem config — silêncio defensivo
  if (!cfg) return null

  const bg     = isGbMode ? cfg.bgGb     : cfg.bg
  const border = isGbMode ? cfg.borderGb : cfg.border
  const color  = isGbMode ? cfg.textGb   : cfg.text
  const msg    = cfg.defaultMsg(trialDaysLeft)
  const label  = actionLabel ?? cfg.defaultAction

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            t.space[3],
        padding:        `${t.space[2] + 2}px ${t.space[4]}px`,
        background:     bg,
        border:         `1px solid ${border}`,
        borderRadius:   t.radius.md,
        fontFamily:     t.font.family.sans,
      }}
    >
      {/* Ícone + mensagem */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        t.space[2],
          color,
          fontSize:   t.font.size.sm,
          fontWeight: t.font.weight.medium,
          lineHeight: t.font.lineHeight.normal,
          flexShrink: 1,
          minWidth:   0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {cfg.icon}
        </span>
        <span>{msg}</span>
      </div>

      {/* Botão de ação */}
      {onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          style={{ flexShrink: 0 }}
        >
          {label}
        </Button>
      )}
    </div>
  )
}
