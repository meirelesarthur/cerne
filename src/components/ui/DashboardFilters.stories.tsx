import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DashboardFilters } from './DashboardFilters'
import { DashboardGrid, DashboardHeader, DashboardRow, DashboardKpiCard } from './DashboardGrid'

const meta: Meta<typeof DashboardFilters> = {
  title: 'GB CERNE/DashboardFilters',
  component: DashboardFilters,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DashboardFilters>

/** Na tela real os valores vêm de `useUrlFilter`; aqui, de estado local. */
function Exemplo({ comFiltroAtivo = false }: { comFiltroAtivo?: boolean }) {
  const [periodo, setPeriodo] = useState('12')
  const [curral, setCurral] = useState(comFiltroAtivo ? 'Curral 7' : 'todos')

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Desempenho de Lotes"
        subtitle="GMD, evolução de peso e detalhamento dos lotes"
        actions={
          <DashboardFilters
            fields={[
              {
                label: 'Período',
                value: periodo,
                onChange: setPeriodo,
                defaultValue: '12',
                options: [
                  { value: '6',  label: 'Últimos 6 meses' },
                  { value: '12', label: 'Últimos 12 meses' },
                ],
              },
              {
                label: 'Curral',
                value: curral,
                onChange: setCurral,
                defaultValue: 'todos',
                options: [
                  { value: 'todos',    label: 'Todos os currais' },
                  { value: 'Curral 4', label: 'Curral 4' },
                  { value: 'Curral 7', label: 'Curral 7' },
                ],
              },
            ]}
          />
        }
      />
      <DashboardRow>
        <DashboardKpiCard label="Período" value={periodo} />
        <DashboardKpiCard label="Curral" value={curral} />
      </DashboardRow>
    </DashboardGrid>
  )
}

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => <Exemplo />,
}

// ─── Com filtro ativo ───────────────────────────────────────────────────────────
// O botão passa a mostrar a contagem, e o drawer traz o "Limpar".

export const ComFiltroAtivo: Story = {
  name: 'Com filtro ativo',
  render: () => <Exemplo comFiltroAtivo />,
}
