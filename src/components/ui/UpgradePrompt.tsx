import React from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'
import type { PlanTier } from '../../auth/PlanContext'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  /** Título do prompt. Padrão: "Recurso disponível em planos superiores" */
  title?: string
  /** Descrição orientativa. Padrão: genérica. */
  message?: string
  /** Plano mínimo necessário para acessar a feature. */
  requiredPlan?: PlanTier
  /** Callback do botão de upgrade. */
  onUpgrade?: () => void
  /**
   * `'card'`  — bloco de upsell completo com fundo, borda e padding (padrão).
   * `'inline'` — versão compacta para encaixar dentro de outras telas.
   */
  variant?: 'card' | 'inline'
}

// ─── Labels dos planos ───────────────────────────────────────────────────────

const PLAN_LABEL: Record<PlanTier, string> = {
  trial:         'Avaliação',
  essencial:     'Essencial',
  profissional:  'Profissional',
  enterprise:    'Enterprise',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UpgradePrompt({
  title,
  message,
  requiredPlan,
  onUpgrade,
  variant = 'card',
}: UpgradePromptProps) {
  const { colors, isGbMode } = useTheme()

  const resolvedTitle = title ?? 'Recurso disponível em planos superiores'
  const resolvedMsg = message ?? (
    requiredPlan
      ? `Este recurso está disponível a partir do plano ${PLAN_LABEL[requiredPlan]}. Faça upgrade para continuar.`
      : 'Faça upgrade do seu plano para desbloquear este recurso.'
  )

  // ─── Variante inline ──────────────────────────────────────────────────────

  if (variant === 'inline') {
    return (
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        t.space[2],
          padding:    `${t.space[2]}px ${t.space[3]}px`,
          background: isGbMode ? 'rgba(16,185,129,0.06)' : t.color.brand[50],
          border:     `1px solid ${isGbMode ? colors.accent.default : t.color.brand[200]}`,
          borderRadius: t.radius.md,
          fontFamily: t.font.family.sans,
        }}
      >
        <Lock
          size={14}
          aria-hidden="true"
          style={{ color: colors.accent.default, flexShrink: 0 }}
        />
        <span
          style={{
            fontSize:   t.font.size.sm,
            color:      colors.fg.muted,
            lineHeight: t.font.lineHeight.normal,
            flex:       1,
            minWidth:   0,
          }}
        >
          {resolvedMsg}
        </span>
        {onUpgrade && (
          <Button variant="primary" size="sm" onClick={onUpgrade} style={{ flexShrink: 0 }}>
            Fazer upgrade
          </Button>
        )}
      </div>
    )
  }

  // ─── Variante card (padrão) ───────────────────────────────────────────────

  const cardBg     = isGbMode ? t.color.gb.surface      : colors.bg.surface
  const cardBorder = isGbMode ? colors.border.default           : t.color.brand[100]

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        textAlign:      'center',
        gap:            t.space[3],
        padding:        `${t.space[8]}px ${t.space[6]}px`,
        background:     cardBg,
        border:         `1px solid ${cardBorder}`,
        borderRadius:   t.radius.xl,
        boxShadow:      isGbMode ? t.shadow.cardDark : t.shadow.card,
        fontFamily:     t.font.family.sans,
      }}
    >
      {/* Ícone decorativo */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          48,
          height:         48,
          borderRadius:   t.radius.full,
          background:     isGbMode ? 'rgba(16,185,129,0.10)' : t.color.brand[50],
          color:          colors.accent.default,
          flexShrink:     0,
        }}
      >
        <Sparkles size={22} aria-hidden="true" />
      </div>

      {/* Título */}
      <span
        style={{
          fontSize:   t.font.size.md,
          fontWeight: t.font.weight.semibold,
          color:      colors.fg.default,
          lineHeight: t.font.lineHeight.snug,
          maxWidth:   320,
        }}
      >
        {resolvedTitle}
      </span>

      {/* Mensagem */}
      <span
        style={{
          fontSize:   t.font.size.sm,
          color:      colors.fg.subtle,
          lineHeight: t.font.lineHeight.normal,
          maxWidth:   360,
        }}
      >
        {resolvedMsg}
      </span>

      {/* Badge do plano requerido */}
      {requiredPlan && (
        <div
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          t.space[1],
            padding:      `${t.space[1]}px ${t.space[3]}px`,
            borderRadius: t.radius.full,
            background:   isGbMode ? 'rgba(16,185,129,0.08)' : t.color.brand[50],
            border:       `1px solid ${isGbMode ? colors.border.default : t.color.brand[200]}`,
            fontSize:     t.font.size.xs,
            fontWeight:   t.font.weight.semibold,
            color:        colors.accent.default,
          }}
        >
          <Lock size={10} aria-hidden="true" />
          A partir do plano {PLAN_LABEL[requiredPlan]}
        </div>
      )}

      {/* Botão de ação */}
      {onUpgrade && (
        <Button
          variant="primary"
          size="md"
          onClick={onUpgrade}
          icon={<Sparkles size={14} aria-hidden="true" />}
          style={{ marginTop: t.space[1] }}
        >
          Fazer upgrade
        </Button>
      )}
    </div>
  )
}
