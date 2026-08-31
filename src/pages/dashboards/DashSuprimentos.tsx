import { useEffect, useState } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { SankeyFunnel } from '../../components/ui/SankeyFunnel'
import { SparklineArea } from '../../components/ui/SparklineArea'
import { BarChart } from '../../components/ui/BarChart'
import { DashboardFilters } from '../../components/ui/DashboardFilters'
import { DashboardAnalysis } from '../../components/ui/DashboardAnalysis'
import type { DashboardReadingInput } from '../../insights/dashboardReading'
import {
  DashboardGrid,
  DashboardHeader,
  DashboardRow,
  DashboardCard,
  DashboardKpiCard,
  DashboardSkeleton,
} from '../../components/ui/DashboardGrid'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
import { useUrlFilter } from '../../hooks/useUrlFilter'

// ─── Mock data ────────────────────────────────────────────────────────────────

const funnelStages = [
  { label: 'Solicitações', value: 284, sublabel: '100%' },
  { label: 'Cotações',     value: 67,  sublabel: '23,6% conv.' },
  { label: 'Pedidos',      value: 43,  sublabel: '64,2% conv.' },
  { label: 'Recebimentos', value: 38,  sublabel: '88,4% conv.' },
]

const kpiSparklines: Record<string, number[]> = {
  'Solicitações':      [210, 240, 228, 255, 262, 270, 284],
  'Cotações abertas':  [52, 58, 55, 61, 63, 65, 67],
  'Pedidos de compra': [31, 35, 38, 40, 41, 43, 43],
  'Recebimentos':      [40, 38, 39, 37, 38, 36, 38],
}

const funnelMeta = [
  { label: 'Valor médio',  values: ['R$ 1.240', 'R$ 4.820', 'R$ 12.600', 'R$ 11.900'] },
  { label: 'Lead time',    values: ['1 dia', '3 dias', '7 dias', '12 dias'] },
  { label: 'Prazo médio',  values: ['Imediato', '48h', '15 dias', '30 dias'] },
] as const

const categoriaData = [
  { label: 'Defensivos',   value: 420000 },
  { label: 'Fertilizantes', value: 380000 },
  { label: 'Sementes',     value: 260000 },
  { label: 'Combustível',  value: 180000 },
  { label: 'Peças',        value: 140000 },
  { label: 'Outros',       value: 90000 },
] as const

const fornecedores = [
  { nome: 'AgroSul Insumos',    categoria: 'Defensivos',    valor: 'R$ 284.500', badge: 'Excelente' as const, pct: 92 },
  { nome: 'Sementes Primavera', categoria: 'Sementes',      valor: 'R$ 198.200', badge: 'Excelente' as const, pct: 80 },
  { nome: 'FertMax Nutrição',   categoria: 'Fertilizantes', valor: 'R$ 156.800', badge: 'Bom'       as const, pct: 64 },
  { nome: 'CombustAgro',        categoria: 'Combustível',   valor: 'R$ 94.300',  badge: 'Bom'       as const, pct: 38 },
  { nome: 'Peças & Campo',      categoria: 'Peças',         valor: 'R$ 61.100',  badge: 'Regular'   as const, pct: 25 },
] as const

type Badge = 'Excelente' | 'Bom' | 'Regular'
const badgeStyle: Record<Badge, { color: string; bg: string }> = {
  Excelente: { color: t.color.feedback.success.text, bg: t.color.feedback.success.bg },
  Bom:       { color: t.color.feedback.info.text,    bg: t.color.feedback.info.bg },
  Regular:   { color: t.color.feedback.warning.text, bg: t.color.feedback.warning.bg },
}

// ─── Fornecedores List ────────────────────────────────────────────────────────

function FornecedoresList({ colors, isGbMode, categoria }: { colors: ReturnType<typeof useTheme>['colors']; isGbMode: boolean; categoria: string }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const visiveis = fornecedores.filter((f) => categoria === 'todas' || f.categoria === categoria)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
      {visiveis.map((f, i) => {
        const bs = badgeStyle[f.badge]
        return (
          <div key={i}
            onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)}
            style={{
              padding: `${t.space[2]}px ${t.space[2]}px`,
              borderRadius: t.radius.base,
              background: hovIdx === i ? (isGbMode ? t.color.state.row.hoverGb : t.color.state.row.hover) : 'transparent',
              transition: `background ${t.transition.base}`, cursor: 'default',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[1] }}>
              <div>
                <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                  {f.nome}
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
                  {f.categoria}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                  {f.valor}
                </span>
                <span style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.medium,
                  color: bs.color, background: bs.bg,
                  borderRadius: t.radius.full, padding: `2px ${t.space[2]}px`, fontFamily: t.font.family.sans,
                }}>
                  {f.badge}
                </span>
              </div>
            </div>
            <div style={{ height: 4, background: isGbMode ? t.color.state.track.gb : t.color.state.track.base, borderRadius: t.radius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${f.pct}%`, background: t.color.brand[600], borderRadius: t.radius.full }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── DashSuprimentos ──────────────────────────────────────────────────────────

export default function DashSuprimentos() {
  const { colors, isGbMode } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [categoria, setCategoria] = useUrlFilter('categoria', 'todas')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const showSkeleton = useDelayedLoading(isLoading)

  if (isLoading) {
    // Anti-flash: espera curta não pisca a casca; anti-flicker: uma vez
    // visível, ela fica o mínimo de `t.delay.loadingMin`.
    return showSkeleton ? <DashboardSkeleton kpis={4} blocks={[t.size.chart.md, t.size.chart.md]} /> : null
  }

  const kpis = [
    { label: 'Solicitações',     value: '284', trend: '8,3% vs mês ant.', up: true  },
    { label: 'Cotações abertas', value: '67',  trend: '4,1% vs mês ant.', up: true  },
    { label: 'Pedidos de compra', value: '43', trend: '2,7% vs mês ant.', up: true  },
    { label: 'Recebimentos',     value: '38',  trend: '1,2% vs mês ant.', up: false },
  ]

  const analise: DashboardReadingInput = {
    title: 'Suprimentos',
    scope: categoria === 'todas' ? 'todas as categorias' : `categoria ${categoria}`,
    kpis,
    blocks: [
      {
        block: 'Funil de suprimentos',
        kind: 'timeline',
        labels: funnelStages.map((stage) => stage.label),
        series: [{ name: 'Volume no estágio', data: funnelStages.map((stage) => stage.value) }],
        unit: 'documentos',
      },
      {
        block: 'Gastos por categoria',
        kind: 'composition',
        labels: categoriaData.map((c) => c.label),
        series: [{ name: 'Gasto', data: categoriaData.map((c) => c.value) }],
        currency: true,
      },
      {
        block: 'Top fornecedores',
        kind: 'composition',
        labels: fornecedores.map((f) => f.nome),
        series: [{ name: 'Compras', data: fornecedores.map((f) => Number(f.valor.replace(/[^0-9]/g, ''))) }],
        currency: true,
      },
    ],
    notes: [`Conversão de ponta a ponta do funil: ${((funnelStages[funnelStages.length - 1].value / funnelStages[0].value) * 100).toFixed(1).replace('.', ',')}%.`],
  }

  return (
    <DashboardGrid>
      <DashboardHeader
        title="Suprimentos"
        subtitle="Do pedido ao recebimento — funil, gastos e fornecedores"
        actions={
          <>
            <DashboardAnalysis input={analise} fonte="base do painel" />
            <DashboardFilters
              fields={[
                {
                  label: 'Categoria',
                  value: categoria,
                  onChange: setCategoria,
                  defaultValue: 'todas',
                  options: [
                    { value: 'todas', label: 'Todas as categorias' },
                    ...categoriaData.map((c) => ({ value: c.label, label: c.label })),
                  ],
                },
              ]}
            />
          </>
        }
      />

      {/* Fileira 1 — KPIs com sparkline */}
      <DashboardRow>
        {kpis.map((kpi) => (
          <DashboardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            up={kpi.up}
          >
            <SparklineArea
              data={kpiSparklines[kpi.label]}
              color={kpi.up ? t.color.brand[600] : t.color.feedback.error.solid}
              height={t.size.sparkline}
            />
          </DashboardKpiCard>
        ))}
      </DashboardRow>

      {/* Fileira 2 — Funil de suprimentos */}
      <DashboardCard
        title="Funil de suprimentos"
        action={
          <div style={{
            fontSize: t.font.size.xs, color: t.color.feedback.success.text,
            background: t.color.feedback.success.bg, borderRadius: t.radius.full,
            padding: `3px ${t.space[2]}px`, fontWeight: t.font.weight.medium,
          }}>
            13,4% taxa final
          </div>
        }
      >
        <SankeyFunnel stages={funnelStages} colors={colors} isGbMode={isGbMode} chartHeight={160} />

        {/* Meta table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${funnelStages.length}, 1fr)`,
          gap: t.space[2],
          marginTop: t.space[4],
          paddingTop: t.space[3],
        }}>
          {funnelStages.map((stage, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
              {funnelMeta.map((meta, j) => (
                <div key={j}>
                  <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle as string, fontFamily: t.font.family.sans }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default as string, fontFamily: t.font.family.sans }}>
                    {meta.values[i]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Fileira 3 — Gastos por categoria + Fornecedores */}
      <DashboardRow>
        <DashboardCard title="Gastos por categoria">
          <BarChart
            data={categoriaData
              .filter((c) => categoria === 'todas' || c.label === categoria)
              .map((c) => ({ label: c.label, value: c.value }))}
            horizontal
            height={t.size.chart.md}
            yFormat={(v) => `R$ ${(v / 1000).toFixed(0)}K`}
          />
        </DashboardCard>
        <DashboardCard title="Top fornecedores">
          <FornecedoresList colors={colors} isGbMode={isGbMode} categoria={categoria} />
        </DashboardCard>
      </DashboardRow>
    </DashboardGrid>
  )
}
