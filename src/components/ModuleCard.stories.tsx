import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  LayoutDashboard, Star, TrendingUp, Layers,
  Building2, Gauge, Wallet, Truck, Receipt, BarChart3, Network,
} from 'lucide-react'
import { ModuleCard, type ModuleCardConfig } from './ModuleCard'
import type { NavModule } from '../data/menuData'

const meta: Meta<typeof ModuleCard> = {
  title: 'UI/ModuleCard',
  component: ModuleCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ModuleCard>

const makeModule = (id: string, label: string, icon: NavModule['icon']): NavModule => ({
  id,
  label,
  icon,
  emoji: '',
  groups: [],
  flatItems: [],
})

const configs: Record<string, ModuleCardConfig> = {
  painel:         { desc: 'Visão geral e indicadores' },
  favoritos:      { desc: 'Seus atalhos mais usados' },
  dashboards:     { desc: 'Análises e gráficos interativos' },
  cadastros:      { desc: 'Estrutura, pessoas e produtos' },
  administrativo: { desc: 'Suprimentos, estoque e RH' },
  operacional:    { desc: 'Agricultura, pecuária e OS' },
  financeiro:     { desc: 'Contas, fluxo e conciliações' },
  frota:          { desc: 'Manutenções e abastecimentos' },
  fiscal:         { desc: 'NF-e, CT-e, MDF-e e LCDPR' },
  relatorios:     { desc: 'Todos os relatórios do sistema' },
  integracoes:    { desc: 'Domínio, CSV e exportações' },
}

export const Home: Story = {
  args: {
    module: makeModule('painel', 'Home', LayoutDashboard),
    config: configs.painel,
  },
}

export const Financeiro: Story = {
  args: {
    module: makeModule('financeiro', 'Financeiro', Wallet),
    config: configs.financeiro,
  },
}

export const Fiscal: Story = {
  args: {
    module: makeModule('fiscal', 'Fiscal', Receipt),
    config: configs.fiscal,
  },
}

export const AllModules: Story = {
  render: () => {
    const modules: Array<{ id: string; label: string; icon: NavModule['icon'] }> = [
      { id: 'painel', label: 'Home', icon: LayoutDashboard },
      { id: 'favoritos', label: 'Favoritos', icon: Star },
      { id: 'dashboards', label: 'Dashboards', icon: TrendingUp },
      { id: 'cadastros', label: 'Cadastros', icon: Layers },
      { id: 'administrativo', label: 'Administrativo', icon: Building2 },
      { id: 'operacional', label: 'Operacional', icon: Gauge },
      { id: 'financeiro', label: 'Financeiro', icon: Wallet },
      { id: 'frota', label: 'Frota', icon: Truck },
      { id: 'fiscal', label: 'Fiscal', icon: Receipt },
      { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
      { id: 'integracoes', label: 'Integrações', icon: Network },
    ]

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          maxWidth: 'calc(6 * 180px + 5 * 12px)',
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 16,
        }}
      >
        {modules.map((m) => (
          <ModuleCard
            key={m.id}
            module={makeModule(m.id, m.label, m.icon)}
            config={configs[m.id]}
          />
        ))}
      </div>
    )
  },
}
