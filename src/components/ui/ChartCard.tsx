import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { DashboardCard } from './DashboardGrid'
import { IconButton } from './IconButton'
import { Modal } from './Modal'

// ─── ChartCard ─────────────────────────────────────────────────────────────────
// Bloco de gráfico com expansão em modal. O frame (fill, raio, sombra, borda por
// tema, tipografia do título) vem do `DashboardCard` — fonte única (Lei 2): um
// ChartCard e um DashboardCard lado a lado no mesmo dashboard são
// indistinguíveis, e o que o ChartCard adiciona é só o "expandir".

interface ChartCardProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  /** Peso da largura dentro de uma `DashboardRow`. Default `1`. */
  flex?: number
  /**
   * Ícone opcional antes do título. Mantido por compatibilidade; nos dashboards
   * o rótulo de bloco é texto puro (ver Regra G).
   */
  icon?: React.ElementType
}

export function ChartCard({ title, action, children, flex, icon: Icon }: ChartCardProps) {
  const { colors } = useTheme()
  const [expanded, setExpanded] = useState(false)

  return (
    <DashboardCard
      flex={flex}
      title={
        Icon ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.space[2] }}>
            <Icon size={t.icon.xs} color={colors.fg.subtle as string} aria-hidden="true" />
            {title}
          </span>
        ) : (
          title
        )
      }
      action={
        <>
          {action}
          <IconButton
            icon={<ArrowUpRight size={t.icon.xs} />}
            aria-label={`Expandir ${title}`}
            onClick={() => setExpanded(true)}
            size="sm"
          />
        </>
      }
    >
      {children}

      <Modal open={expanded} onClose={() => setExpanded(false)} title={title} size="lg">
        {children}
      </Modal>
    </DashboardCard>
  )
}
