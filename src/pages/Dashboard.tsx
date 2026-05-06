import { ArrowRight, Plus, ExternalLink } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { ModuleCard, type ModuleCardConfig } from '../components/ModuleCard'
import { menuModules } from '../data/menuData'
import { useNavigation } from '../context/NavigationContext'

const moduleCardConfig: Record<string, ModuleCardConfig> = {
  painel:         { desc: 'Visão geral e indicadores',       iconBg: '#dcfce7', iconColor: '#059669' },
  favoritos:      { desc: 'Seus atalhos mais usados',        iconBg: '#fef9c3', iconColor: '#d97706' },
  dashboards:     { desc: 'Análises e gráficos interativos', iconBg: '#dbeafe', iconColor: '#2563eb' },
  cadastros:      { desc: 'Estrutura, pessoas e produtos',   iconBg: '#ede9fe', iconColor: '#7c3aed' },
  administrativo: { desc: 'Suprimentos, estoque e RH',       iconBg: '#f3e8ff', iconColor: '#9333ea' },
  operacional:    { desc: 'Agricultura, pecuária e OS',      iconBg: '#d1fae5', iconColor: '#059669' },
  financeiro:     { desc: 'Contas, fluxo e conciliações',    iconBg: '#ffedd5', iconColor: '#ea580c' },
  frota:          { desc: 'Manutenções e abastecimentos',    iconBg: '#fef3c7', iconColor: '#d97706' },
  fiscal:         { desc: 'NF-e, CT-e, MDF-e e LCDPR',      iconBg: '#fee2e2', iconColor: '#dc2626' },
  relatorios:     { desc: 'Todos os relatórios do sistema',  iconBg: '#e0f2fe', iconColor: '#0284c7' },
  integracoes:    { desc: 'Domínio, CSV e exportações',      iconBg: '#f1f5f9', iconColor: '#475569' },
}

const recentItems = [
  { label: 'Fazendas', module: 'Cadastros Base', moduleId: 'cadastros', itemId: 'cad-est-faz' },
  { label: 'Contas a Pagar', module: 'Financeiro', moduleId: 'financeiro' },
  { label: 'DFe Recebidas', module: 'Fiscal', moduleId: 'fiscal' },
  { label: 'Mov. Caixa / Bancário', module: 'Financeiro', moduleId: 'financeiro' },
]

const farms = [
  { name: 'Fazenda São João', area: '1.240 ha', status: 'Ativa', statusColor: '#059669', statusBg: '#d1fae5' },
  { name: 'Fazenda Paraíso', area: '860 ha', status: 'Ativa', statusColor: '#059669', statusBg: '#d1fae5' },
  { name: 'Fazenda Nova Esperança', area: '530 ha', status: 'Inativa', statusColor: '#9ca3af', statusBg: '#f5f5f5' },
]

const favorites = [
  { label: 'DFe Recebidas', module: 'Fiscal', moduleId: 'fiscal', emoji: '📄' },
  { label: 'C. a Pagar', module: 'Financeiro', moduleId: 'financeiro', emoji: '💰' },
  { label: 'C. a Receber', module: 'Financeiro', moduleId: 'financeiro', emoji: '💰' },
  { label: 'Importação OFX', module: 'Financeiro', moduleId: 'financeiro', emoji: '🔄' },
  { label: 'Mov. Caixa/Bancário', module: 'Financeiro', moduleId: 'financeiro', emoji: '🏦' },
]

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{title}</h3>
      {action && (
        <button
          style={{
            fontSize: 11,
            color: '#059669',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontWeight: 500,
          }}
        >
          {action} <ArrowRight size={11} />
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { navigateTo } = useNavigation()

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Welcome + Search */}
      <div style={{ marginBottom: 28, textAlign: 'center', paddingBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: 4,
            letterSpacing: '-0.4px',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Bom dia, vamos começar!
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SearchBar />
        </div>
      </div>

      {/* Module Cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          maxWidth: 'calc(6 * 180px + 5 * 12px)',
          margin: '0 auto 28px',
        }}
      >
        {menuModules.map((mod) => {
          const config = moduleCardConfig[mod.id]
          if (!config) return null
          return (
            <ModuleCard
              key={mod.id}
              module={mod}
              config={config}
              onClick={() => navigateTo(mod.id)}
            />
          )
        })}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 12 }}>

        {/* Últimos acessos */}
        <div style={{ background: 'white', borderRadius: 12, padding: 18 }}>
          <SectionHeader title="Últimos acessos" action="Ver todos" />
          {recentItems.map((item) => (
            <div
              key={item.label}
              onClick={() => navigateTo(item.moduleId, item.itemId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid #f9f9f9',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{item.module}</div>
              </div>
              <ExternalLink size={12} color="#d4d4d4" />
            </div>
          ))}
        </div>

        {/* Fazendas */}
        <div style={{ background: 'white', borderRadius: 12, padding: 18 }}>
          <SectionHeader title="Fazendas" action="Ver todas" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {farms.map((farm) => (
              <div
                key={farm.name}
                onClick={() => navigateTo('cadastros', 'cad-est-faz')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>{farm.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{farm.area}</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: farm.statusColor,
                    background: farm.statusBg,
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  {farm.status}
                </span>
              </div>
            ))}
            <button
              onClick={() => navigateTo('cadastros', 'cad-est-faz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px',
                borderRadius: 8,
                border: '1px dashed #d4d4d4',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                color: '#9ca3af',
              }}
            >
              <Plus size={13} /> Nova fazenda
            </button>
          </div>
        </div>

        {/* Favoritos */}
        <div style={{ background: 'white', borderRadius: 12, padding: 18 }}>
          <SectionHeader title="Favoritos" action="Gerenciar" />
          {favorites.map((fav) => (
            <div
              key={fav.label}
              onClick={() => navigateTo(fav.moduleId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid #f9f9f9',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  background: '#f5f5f5',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {fav.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fav.label}
                </div>
              </div>
              <ArrowRight size={12} color="#d4d4d4" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
