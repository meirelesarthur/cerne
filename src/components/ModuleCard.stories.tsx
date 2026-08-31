import type { Meta, StoryObj } from '@storybook/react-vite'
import { type IconName } from './ui/Icon'
import { ModuleCard, type ModuleCardConfig } from './ModuleCard'
import type { NavModule } from '../data/menuData'

const meta: Meta<typeof ModuleCard> = {
  title: 'GB CERNE/ModuleCard',
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
    module: makeModule('painel', 'Home', 'dashboard'),
    config: configs.painel,
  },
}

export const Financeiro: Story = {
  args: {
    module: makeModule('financeiro', 'Financeiro', 'wallet'),
    config: configs.financeiro,
  },
}

export const Fiscal: Story = {
  args: {
    module: makeModule('fiscal', 'Fiscal', 'receipt'),
    config: configs.fiscal,
  },
}

export const AllModules: Story = {
  render: () => {
    const modules: Array<{ id: string; label: string; icon: NavModule['icon'] }> = [
      { id: 'painel', label: 'Home', icon: 'dashboard' },
      { id: 'favoritos', label: 'Favoritos', icon: 'star' },
      { id: 'dashboards', label: 'Dashboards', icon: 'trend-up' },
      { id: 'cadastros', label: 'Cadastros', icon: 'layers' },
      { id: 'administrativo', label: 'Administrativo', icon: 'building' },
      { id: 'operacional', label: 'Operacional', icon: 'gauge' },
      { id: 'financeiro', label: 'Financeiro', icon: 'wallet' },
      { id: 'frota', label: 'Frota', icon: 'truck' },
      { id: 'fiscal', label: 'Fiscal', icon: 'receipt' },
      { id: 'relatorios', label: 'Relatórios', icon: 'chart-column' },
      { id: 'integracoes', label: 'Integrações', icon: 'network' },
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
