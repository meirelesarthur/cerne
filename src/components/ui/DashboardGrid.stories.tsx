import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  DashboardGrid,
  DashboardHeader,
  DashboardRow,
  DashboardCard,
  DashboardKpiCard,
} from './DashboardGrid'
import { LineChart } from './LineChart'
import { DonutChart } from './DonutChart'
import { FilterSelect } from './FilterSelect'
import { t } from '../../design/tokens'

const meta: Meta<typeof DashboardGrid> = {
  title: 'GB CERNE/DashboardGrid',
  component: DashboardGrid,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DashboardGrid>

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

const RECEITA = [
  { name: 'Receitas', data: [1.2, 1.8, 1.5, 2.1, 2.4, 2.2], color: t.color.brand[600] },
]

const COMPOSICAO = [
  { label: 'Café', value: 62, color: t.color.brand[600] },
  { label: 'Milho', value: 24, color: t.color.brand[400] },
  { label: 'Soja', value: 14, color: t.color.brand[200] },
]

// ─── Padrão ─────────────────────────────────────────────────────────────────────
// Casca completa: cabeçalho sobre o canvas, fileira de KPIs, fileira com pesos
// diferentes e bloco de largura total.

export const Default: Story = {
  render: () => (
    <DashboardGrid>
      <DashboardHeader
        title="Financeiro"
        subtitle="Acompanhe receitas, despesas e margem da safra"
        actions={
          <FilterSelect
            ariaLabel="Filtrar por período"
            options={[
              { value: '6', label: 'Últimos 6 meses' },
              { value: '12', label: 'Últimos 12 meses' },
            ]}
            value="6"
            onChange={() => {}}
          />
        }
      />

      <DashboardRow wrap>
        <DashboardKpiCard label="Receita realizada" value="R$ 18,9M" trend="4,1%" up />
        <DashboardKpiCard label="Margem bruta" value="12,5%" trend="2,7%" up />
        <DashboardKpiCard label="Saldo operacional" value="R$ 14,5M" trend="1,3%" up={false} />
        <DashboardKpiCard label="Custo por saca" value="R$ 412" trend="0,8%" up={false} />
      </DashboardRow>

      <DashboardRow>
        <DashboardCard title="Receitas mensais" flex={2}>
          <LineChart series={RECEITA} labels={MESES} height={220} area showLegend />
        </DashboardCard>
        <DashboardCard title="Composição da receita" flex={1}>
          <DonutChart
            data={COMPOSICAO}
            height={200}
            centerValue="R$ 18,9M"
            centerLabel="total"
            showLegend
            valueFormat={(v) => `${v}%`}
          />
        </DashboardCard>
      </DashboardRow>

      <DashboardCard title="Despesas por centro de custo">
        <LineChart series={RECEITA} labels={MESES} height={160} showLegend={false} />
      </DashboardCard>
    </DashboardGrid>
  ),
}

// ─── Fileira única ──────────────────────────────────────────────────────────────

export const FileiraDeKpis: Story = {
  render: () => (
    <DashboardGrid>
      <DashboardRow wrap>
        <DashboardKpiCard label="Total de ativos" value="342" trend="5,4%" up />
        <DashboardKpiCard label="Em operação" value="298" trend="3,2%" up />
        <DashboardKpiCard label="Em manutenção" value="31" trend="12,4%" up={false} />
      </DashboardRow>
    </DashboardGrid>
  ),
}

// ─── Bloco sem padding ──────────────────────────────────────────────────────────
// `bare` para conteúdo que sangra até a borda do card (mapa, tabela).

export const BlocoSemPadding: Story = {
  render: () => (
    <DashboardGrid>
      <DashboardCard title="Talhões" bare>
        <div
          style={{
            height: 200,
            background: `linear-gradient(135deg, ${t.color.brand[600]}, ${t.color.brand[300]})`,
          }}
        />
      </DashboardCard>
    </DashboardGrid>
  ),
}
