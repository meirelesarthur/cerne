import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Heading } from './Heading'
import { Modal } from './Modal'

// ─── ChartCard ─────────────────────────────────────────────────────────────────
// Wrapper com tab-chip header (ícone + título), expand icon e hover shadow lift.
// Inspirado no estilo efferd.com/blocks/dashboard.

interface ChartCardProps {
  icon: React.ElementType
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  /** Adiciona padding vertical extra (útil para seções densas). */
  compact?: boolean
}

export function ChartCard({ icon: Icon, title, action, children, compact }: ChartCardProps) {
  const { colors, isGbMode } = useTheme()
  const [hov, setHov] = useState(false)
  const [btnHov, setBtnHov] = useState(false)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isGbMode ? t.color.gb.surface : colors.bg.surface,
        backdropFilter: isGbMode ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
        borderRadius: t.radius['2xl'],
        border: `1px solid ${colors.border.default}`,
        boxShadow: hov
          ? (isGbMode ? t.shadow.cardDarkHover : t.shadow.cardHover)
          : (isGbMode ? t.shadow.cardDark     : t.shadow.card),
        transition: `box-shadow ${t.transition.smooth}`,
        padding: compact ? `${t.space[3]}px ${t.space[4]}px` : t.space[4],
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Tab-chip header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: compact ? t.space[3] : t.space[4],
        }}
      >
        {/* Left: icon + title chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[2],
            background: isGbMode ? 'rgba(255,255,255,0.06)' : t.color.neutral[100],
            borderRadius: t.radius.base,
            padding: `${t.space[1]}px ${t.space[2] + 2}px`,
          }}
        >
          <Icon size={12} color={colors.fg.subtle as string} />
          <Heading
            level={3}
            size="xs"
            weight="medium"
            tone="secondary"
            letterSpacing="0.01em"
          >
            {title}
          </Heading>
        </div>

        {/* Right: action slot + expand icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          {action}
          <button
            type="button"
            className="gb-focusable"
            aria-label={`Expandir ${title}`}
            onClick={() => setExpanded(true)}
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              width: 28,
              height: 28,
              borderRadius: t.radius.base,
              border: `1px solid ${colors.border.default}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: btnHov
                ? (isGbMode ? 'rgba(255,255,255,0.08)' : t.color.neutral[100])
                : 'transparent',
              transition: `background ${t.animation.duration.fast}`,
              opacity: hov ? 1 : 0.5,
              padding: 0,
            }}
          >
            <ArrowUpRight size={13} color={colors.fg.subtle as string} />
          </button>
        </div>
      </div>

      {children}

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={title}
        size="lg"
      >
        {children}
      </Modal>
    </div>
  )
}
