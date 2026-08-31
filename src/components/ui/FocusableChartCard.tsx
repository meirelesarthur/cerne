import { DashboardCard } from './DashboardGrid'
import type { DashboardCardProps } from './DashboardGrid'
import { useSeriesFocus } from '../../hooks/useSeriesFocus'

interface FocusableChartCardProps<T extends { name: string }>
  extends Omit<DashboardCardProps, 'children' | 'action'> {
  /** Séries do bloco — o seletor lista uma opção por série. */
  series: T[]
  /** Gráfico do bloco, recebendo as séries em foco. */
  children: (series: T[], focused: string | null) => React.ReactNode
  /** Rótulo da opção que mostra tudo. Default `Todas as séries`. */
  allLabel?: string
  /**
   * Conteúdo à esquerda do seletor no slot de ação — recebe as séries em foco
   * para que a legenda acompanhe o recorte em vez de listar séries ocultas.
   */
  action?: (series: T[]) => React.ReactNode
}

/**
 * Bloco de gráfico com foco de série: `DashboardCard` + seletor no canto direito
 * do rótulo. Com "Todas as séries" o gráfico fica como está; ao escolher uma,
 * ela ocupa o gráfico inteiro e o eixo se reescala nela — comparar é uma
 * leitura, olhar uma série de perto é outra.
 *
 * O estado do foco mora aqui, no card: a tela não ganha hook nem estado, e o
 * seletor nunca aparece quando há uma série só.
 *
 * ```tsx
 * <FocusableChartCard title="Evolução do rebanho" flex={2} series={rebanhoSeries}>
 *   {(series) => <LineChart series={series} labels={labels} height={t.size.chart.lg} />}
 * </FocusableChartCard>
 * ```
 */
export function FocusableChartCard<T extends { name: string }>({
  series,
  children,
  allLabel,
  action,
  ...cardProps
}: FocusableChartCardProps<T>) {
  const foco = useSeriesFocus(series, allLabel)

  return (
    <DashboardCard
      {...cardProps}
      action={
        <>
          {action?.(foco.series)}
          {foco.selector}
        </>
      }
    >
      {children(foco.series, foco.focused)}
    </DashboardCard>
  )
}
