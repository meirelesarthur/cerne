import type { Meta, StoryObj } from '@storybook/react-vite'
import { FocusableChartCard } from './FocusableChartCard'
import { DashboardGrid, DashboardRow } from './DashboardGrid'
import { LineChart } from './LineChart'
import { GroupedBarChart } from './GroupedBarChart'
import { ChartLegend } from './ChartLegend'
import { t } from '../../design/tokens'

const meta: Meta<typeof FocusableChartCard> = {
  title: 'GB CERNE/FocusableChartCard',
  component: FocusableChartCard,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FocusableChartCard>

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago']

const REBANHO = [
  { name: 'Novilhos', data: [1820, 1860, 1910, 1880, 1940, 1990, 2010, 2060], color: t.chart.series[0] },
  { name: 'Matrizes', data: [1240, 1250, 1260, 1255, 1270, 1280, 1290, 1300], color: t.chart.series[1] },
  { name: 'Bezerros', data: [740, 752, 768, 745, 761, 774, 758, 766],         color: t.chart.series[2] },
]

const MANEJOS = [
  { name: 'Vacinação',  data: [12, 18, 9, 22, 14, 20, 11, 17], color: t.chart.series[0] },
  { name: 'Pesagem',    data: [30, 28, 34, 31, 36, 29, 33, 35], color: t.chart.series[1] },
]

// ─── Padrão ─────────────────────────────────────────────────────────────────────
// Comece em "Todas as séries" e escolha uma: ela ocupa o gráfico e o eixo se
// reescala nela — as três séries juntas achatam a variação da menor.

export const Default: Story = {
  render: () => (
    <DashboardGrid>
      <FocusableChartCard title="Evolução do rebanho" series={REBANHO}>
        {(series) => (
          <LineChart
            series={series}
            labels={MESES}
            height={t.size.chart.md}
            area
            showLegend
            yFormat={(v) => Math.round(v).toLocaleString('pt-BR')}
          />
        )}
      </FocusableChartCard>
    </DashboardGrid>
  ),
}

// ─── Com legenda no slot de ação ────────────────────────────────────────────────
// `action` recebe as séries em foco: a legenda acompanha o recorte em vez de
// listar séries que não estão mais no gráfico.

export const ComLegenda: Story = {
  name: 'Com legenda',
  render: () => (
    <DashboardGrid>
      <DashboardRow>
        <FocusableChartCard
          title="Manejos por mês"
          series={MANEJOS}
          action={(series) => (
            <ChartLegend items={series.map((serie) => ({ label: serie.name, color: serie.color }))} />
          )}
        >
          {(series) => (
            <GroupedBarChart series={series} labels={MESES} height={t.size.chart.md} showLegend={false} />
          )}
        </FocusableChartCard>
      </DashboardRow>
    </DashboardGrid>
  ),
}

// ─── Série única ────────────────────────────────────────────────────────────────
// Com uma série só não há o que focar: o seletor não aparece e o card fica
// idêntico a um `DashboardCard`.

export const SerieUnica: Story = {
  name: 'Série única',
  render: () => (
    <DashboardGrid>
      <FocusableChartCard title="Acessos diários" series={[REBANHO[0]]}>
        {(series) => (
          <LineChart series={series} labels={MESES} height={t.size.chart.md} area showLegend={false} />
        )}
      </FocusableChartCard>
    </DashboardGrid>
  ),
}
