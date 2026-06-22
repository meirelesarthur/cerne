import { ArrowRight, Plus, ExternalLink } from 'lucide-react'
import t from '../design/tokens'
import SearchBar from '../components/SearchBar'
import { ModuleCard, type ModuleCardConfig } from '../components/ModuleCard'
import { menuModules } from '../data/menuData'
import { useNavigation } from '../context/NavigationContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'

const moduleCardConfig: Record<string, ModuleCardConfig> = {
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

const recentItems = [
  { label: 'Fazendas', module: 'Cadastros Base', moduleId: 'cadastros', itemId: 'cad-est-faz' },
  { label: 'Contas a Pagar', module: 'Financeiro', moduleId: 'financeiro' },
  { label: 'DFe Recebidas', module: 'Fiscal', moduleId: 'fiscal' },
  { label: 'Mov. Caixa / Bancário', module: 'Financeiro', moduleId: 'financeiro' },
]

const farms = [
  { name: 'Fazenda São João', area: '1.240 ha', status: 'Ativa', statusColor: t.color.brand[600], statusBg: t.color.brand[100] },
  { name: 'Fazenda Paraíso', area: '860 ha', status: 'Ativa', statusColor: t.color.brand[600], statusBg: t.color.brand[100] },
  { name: 'Fazenda Nova Esperança', area: '530 ha', status: 'Inativa', statusColor: t.color.neutral[400], statusBg: t.color.neutral[100] },
]

const favorites = [
  { label: 'DFe Recebidas', module: 'Fiscal', moduleId: 'fiscal', emoji: '📄' },
  { label: 'C. a Pagar', module: 'Financeiro', moduleId: 'financeiro', emoji: '💰' },
  { label: 'C. a Receber', module: 'Financeiro', moduleId: 'financeiro', emoji: '💰' },
  { label: 'Importação OFX', module: 'Financeiro', moduleId: 'financeiro', emoji: '🔄' },
  { label: 'Mov. Caixa/Bancário', module: 'Financeiro', moduleId: 'financeiro', emoji: '🏦' },
]

function SectionHeader({ title, action }: { title: string; action?: string }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.space[3] }}>
      <Heading level={3} size="base" weight="semibold">{title}</Heading>
      {action && (
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight size={11} />}
          style={{
            fontSize: t.font.size.xs,
            color: colors.accent.default,
            fontWeight: t.font.weight.medium,
            height: 'auto',
            padding: `${t.space[1]}px ${t.space[2]}px`,
          }}
        >
          {action}
        </Button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { navigateTo } = useNavigation()
  const { colors } = useTheme()

  return (
    <div style={{ padding: `${t.space[7]}px ${t.space[6]}px`, maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Welcome + Search */}
      <div style={{ marginBottom: t.space[7], textAlign: 'center', paddingBottom: t.space[7] }}>
        <Heading
          level={1}
          size="3xl"
          weight="semibold"
          letterSpacing="-0.4px"
          style={{ marginBottom: t.space[2] }}
        >
          Bom dia, vamos começar!
        </Heading>
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
          gap: t.space[3],
          maxWidth: 'calc(6 * 180px + 5 * 12px)',
          margin: `0 auto ${t.space[7]}px`,
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: t.space[3] }}>

        {/* Últimos acessos */}
        <div style={{ background: colors.bg.surface, borderRadius: t.radius.xl, padding: 18, transition: `background ${t.transition.smooth}` }}>
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
                borderBottom: `1px solid ${colors.border.subtle}`,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, transition: `color ${t.transition.smooth}` }}>{item.label}</div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginTop: t.space[0] + 1, transition: `color ${t.transition.smooth}` }}>{item.module}</div>
              </div>
              <ExternalLink size={12} color={colors.border.default} />
            </div>
          ))}
        </div>

        {/* Fazendas */}
        <div style={{ background: colors.bg.surface, borderRadius: t.radius.xl, padding: 18, transition: `background ${t.transition.smooth}` }}>
          <SectionHeader title="Fazendas" action="Ver todas" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
            {farms.map((farm) => (
              <div
                key={farm.name}
                onClick={() => navigateTo('cadastros', 'cad-est-faz')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `10px ${t.space[3]}px`,
                  background: colors.bg.subtle,
                  borderRadius: t.radius.DEFAULT,
                  cursor: 'pointer',
                  border: `1px solid ${colors.border.default}`,
                  transition: `background ${t.transition.smooth}`,
                }}
              >
                <div>
                  <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, transition: `color ${t.transition.smooth}` }}>{farm.name}</div>
                  <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginTop: t.space[0] + 2, transition: `color ${t.transition.smooth}` }}>{farm.area}</div>
                </div>
                <span
                  style={{
                    fontSize: t.font.size.xs,
                    fontWeight: t.font.weight.medium,
                    color: farm.statusColor,
                    background: farm.statusBg,
                    padding: `${t.space[0] + 2}px ${t.space[2]}px`,
                    borderRadius: t.radius.full,
                  }}
                >
                  {farm.status}
                </span>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => navigateTo('cadastros', 'cad-est-faz')}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '9px',
                border: `1px dashed ${colors.border.default}`,
                borderRadius: t.radius.DEFAULT,
                color: colors.fg.subtle,
                fontSize: t.font.size.sm,
                fontWeight: t.font.weight.medium,
                transition: `color ${t.transition.smooth}`,
              }}
            >
              Nova fazenda
            </Button>
          </div>
        </div>

        {/* Favoritos */}
        <div style={{ background: colors.bg.surface, borderRadius: t.radius.xl, padding: 18, transition: `background ${t.transition.smooth}` }}>
          <SectionHeader title="Favoritos" action="Gerenciar" />
          {favorites.map((fav) => (
            <div
              key={fav.label}
              onClick={() => navigateTo(fav.moduleId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.space[2] + 2, // ~10px
                padding: `${t.space[2]}px 0`,
                borderBottom: `1px solid ${colors.border.subtle}`,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  background: colors.bg.subtle,
                  borderRadius: t.radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: t.font.size.base,
                  flexShrink: 0,
                  transition: `background ${t.transition.smooth}`,
                }}
              >
                {fav.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: t.font.size.sm,
                    fontWeight: t.font.weight.medium,
                    color: colors.fg.default,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: `color ${t.transition.smooth}`,
                  }}
                >
                  {fav.label}
                </div>
              </div>
              <ArrowRight size={12} color={colors.border.default} style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
