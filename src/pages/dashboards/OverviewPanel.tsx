import { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Layers, ArrowRight, ChevronDown, TrendingUp, TrendingDown,
  DollarSign, Wheat, BarChart2, MessageCircle, Settings2, Wallet,
} from 'lucide-react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { ThemeColors } from '../../context/ThemeContext'
import { HDivider, VDivider } from '../../components/ui/SectionDividers'
import { Button } from '../../components/ui/Button'
import { FilterSelect } from '../../components/ui/FilterSelect'
import { SankeyFunnel } from '../../components/ui/SankeyFunnel'
import { Heading } from '../../components/ui/Heading'
import { Trend } from '../../components/ui/Trend'
import { Tabs } from '../../components/ui/Tabs'
import { InterpretationLetter } from '../../components/ui/InterpretationLetter'
import {
  buildOverviewCarta, headlineInsight, fmtCompact,
  type OverviewDataset,
} from '../../insights/overviewInsights'
import { useFarm } from '../../context/FarmContext'

// ─── Talhões ──────────────────────────────────────────────────────────────────

interface Talhao {
  id: string; name: string; area: string; crop: string
  yieldForecast: string; status: string; moisture: string; ndvi: string
  coords: L.LatLngTuple[]; color: string; fillColor: string; fillOpacity: number
}

const TALHAOES: Talhao[] = [
  { id: 'T1', name: 'Talhão Santa Maria', area: '320 ha', crop: 'Soja', yieldForecast: '64 sc/ha', status: 'Em crescimento', moisture: '68%', ndvi: '0.74', coords: [[-18.760,-52.650],[-18.760,-52.628],[-18.780,-52.628],[-18.780,-52.650]], color: '#059669', fillColor: '#059669', fillOpacity: 0.28 },
  { id: 'T2', name: 'Talhão Cerrado Norte', area: '480 ha', crop: 'Milho', yieldForecast: '140 sc/ha', status: 'Germinação', moisture: '72%', ndvi: '0.61', coords: [[-18.760,-52.626],[-18.760,-52.600],[-18.780,-52.600],[-18.780,-52.626]], color: '#d97706', fillColor: '#d97706', fillOpacity: 0.28 },
  { id: 'T3', name: 'Talhão Rio Verde', area: '250 ha', crop: 'Soja', yieldForecast: '60 sc/ha', status: 'Floração', moisture: '74%', ndvi: '0.81', coords: [[-18.782,-52.650],[-18.782,-52.634],[-18.797,-52.634],[-18.797,-52.650]], color: '#047857', fillColor: '#047857', fillOpacity: 0.35 },
  { id: 'T4', name: 'Talhão Sul', area: '190 ha', crop: 'Cana-de-açúcar', yieldForecast: '85 t/ha', status: 'Maturação', moisture: '65%', ndvi: '0.69', coords: [[-18.782,-52.632],[-18.782,-52.614],[-18.797,-52.614],[-18.797,-52.632]], color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.25 },
  { id: 'T5', name: 'Talhão Leste', area: '360 ha', crop: 'Milho', yieldForecast: '132 sc/ha', status: 'Em crescimento', moisture: '70%', ndvi: '0.65', coords: [[-18.782,-52.612],[-18.782,-52.596],[-18.797,-52.596],[-18.797,-52.612]], color: '#d97706', fillColor: '#d97706', fillOpacity: 0.28 },
  { id: 'T6', name: 'Talhão Reserva', area: '140 ha', crop: 'Pastagem', yieldForecast: '—', status: 'Pousio', moisture: '55%', ndvi: '0.42', coords: [[-18.799,-52.650],[-18.799,-52.632],[-18.814,-52.632],[-18.814,-52.650]], color: '#9ca3af', fillColor: '#9ca3af', fillOpacity: 0.20 },
  { id: 'T7', name: 'Talhão Água Limpa', area: '410 ha', crop: 'Soja', yieldForecast: '58 sc/ha', status: 'Enchimento de grãos', moisture: '76%', ndvi: '0.78', coords: [[-18.799,-52.630],[-18.799,-52.610],[-18.814,-52.610],[-18.814,-52.630]], color: '#059669', fillColor: '#059669', fillOpacity: 0.30 },
]

// ─── Séries mensais — realizado x previsto ────────────────────────────────────

const AREA_DATA = [
  { month: 'Ago', receitas: 320,  despesas: 280 },
  { month: 'Set', receitas: 3800, despesas: 3600 },
  { month: 'Out', receitas: 600,  despesas: 380 },
  { month: 'Nov', receitas: 820,  despesas: 540 },
  { month: 'Dez', receitas: 740,  despesas: 340 },
  { month: 'Jan', receitas: 960,  despesas: 560 },
  { month: 'Fev', receitas: 1100, despesas: 720 },
  { month: 'Mar', receitas: 940,  despesas: 500 },
  { month: 'Abr', receitas: 1320, despesas: 840 },
  { month: 'Mai', receitas: 1180, despesas: 660 },
]

const FORECAST_DATA = [
  { month: 'Jun', receitas: 980,  despesas: 640 },
  { month: 'Jul', receitas: 1050, despesas: 700 },
  { month: 'Ago', receitas: 1220, despesas: 760 },
  { month: 'Set', receitas: 1380, despesas: 820 },
  { month: 'Out', receitas: 1290, despesas: 900 },
  { month: 'Nov', receitas: 1460, despesas: 940 },
  { month: 'Dez', receitas: 1610, despesas: 1010 },
  { month: 'Jan', receitas: 1180, despesas: 860 },
  { month: 'Fev', receitas: 1340, despesas: 900 },
  { month: 'Mar', receitas: 1500, despesas: 960 },
]

const SERIE_INFO = {
  realizado: { hero: 'R$ 18,9M', label: 'Receitas mensais realizadas', trend: '27,4% nos últimos 30 dias', up: true },
  previsto:  { hero: 'R$ 21,4M', label: 'Receitas mensais previstas',  trend: '13,2% acima do realizado', up: true },
} as const

// Receitas da safra anterior, alinhadas mês a mês — linha fantasma para
// comparação YoY no gráfico de área (apenas na série "Realizado").
const PREV_SAFRA_RECEITAS = [280, 3400, 520, 700, 690, 820, 1010, 870, 1150, 1040]

// Cor de margem (3ª série do gráfico de área) — distinta de receita/despesa.
const MARGEM_COLOR = t.color.accent.purple.text

// ─── Cruzamentos derivados ──────────────────────────────────────────────────
// Em vez de "produção total" solta, cruzamos os talhões em distribuição de área
// por cultura (ha × cultura). Cores estáveis por cultura.

const CROP_COLOR: Record<string, string> = {
  'Soja':           t.color.brand[600],
  'Milho':          t.color.feedback.warning.solid,
  'Cana-de-açúcar': t.color.accent.purple.text,
  'Pastagem':       t.color.neutral[400],
}

const AREA_BY_CROP = (() => {
  const acc = new Map<string, number>()
  for (const tl of TALHAOES) {
    const ha = parseInt(tl.area, 10) || 0
    acc.set(tl.crop, (acc.get(tl.crop) ?? 0) + ha)
  }
  return [...acc.entries()].sort((a, b) => b[1] - a[1])
})()
const TOTAL_HA = AREA_BY_CROP.reduce((s, [, ha]) => s + ha, 0)

// Resultado operacional (DRE) — receita decrescendo através das camadas de custo
// até o resultado. Cruza o total de receita com a composição de custo (COE/COT).
const DRE_STAGES = [
  { label: 'Receita bruta',  value: 18900, sublabel: 'R$ 18,9M' },
  { label: 'Após COE',       value: 11000, sublabel: '− custeio' },
  { label: 'Após COT',       value: 7400,  sublabel: '− c. total' },
  { label: 'Resultado',      value: 3500,  sublabel: 'R$ 3,5M'  },
]

// ─── Previsão de fluxo (contas a receber/pagar em aberto) ─────────────────────

const CASH_FORECAST = { aReceber: 3_084_785.19, aPagar: 3_975_108.84 }

// Aging dos títulos em aberto — mesma lógica do "backlog por idade": título
// envelhecendo silenciosamente é o maior risco de caixa.
const AGING_BUCKETS = [
  { label: 'até 7 dias', receber: 1_240_000, pagar: 1_610_000 },
  { label: '8–15 dias',  receber: 830_000,   pagar: 1_120_000 },
  { label: '16–30 dias', receber: 620_000,   pagar: 890_000 },
  { label: '+30 dias',   receber: 394_785.19, pagar: 355_108.84 },
]

// Fluxo líquido projetado (mil R$) — a curva acumulada revela QUANDO o caixa
// cruza o zero, não só o saldo pontual.
const CASHFLOW_12M = [
  { month: 'Jun', net: -320 }, { month: 'Jul', net: -410 }, { month: 'Ago', net: 180 },
  { month: 'Set', net: -540 }, { month: 'Out', net: -620 }, { month: 'Nov', net: 240 },
  { month: 'Dez', net: 1600 }, { month: 'Jan', net: -380 }, { month: 'Fev', net: 440 },
  { month: 'Mar', net: 540 },  { month: 'Abr', net: 620 },  { month: 'Mai', net: 520 },
]

// Cobertura de estoque dos insumos críticos (dias) contra o mínimo operacional.
const STOCK_COVERAGE = [
  { item: 'Fertilizante NPK',      dias: 12, min: 15 },
  { item: 'Óleo diesel',           dias: 9,  min: 10 },
  { item: 'Defensivo — glifosato', dias: 34, min: 15 },
  { item: 'Semente de milho',      dias: 58, min: 20 },
]

// Concentração de receita por comprador — >40% em um único canal é risco estrutural.
const REVENUE_SHARE = [
  { label: 'Coop. Vale Verde', pct: 44 },
  { label: 'Trading AgroSul',  pct: 27 },
  { label: 'Nutrien',          pct: 17 },
  { label: 'Outros',           pct: 12 },
]

// Exceções da semana — gestão por exceção, não por relatório.
const EXCEPTIONS: { label: string; value?: string; tone: 'error' | 'warning' | 'info' }[] = [
  { label: '7 títulos vencem nos próximos 5 dias', value: 'R$ 412,3K', tone: 'warning' },
  { label: 'Óleo diesel abaixo da cobertura mínima', value: '9 dias', tone: 'error' },
  { label: '3 DFe recebidas aguardam manifestação', tone: 'info' },
  { label: 'Safra 25/26 sem configuração de semanas', tone: 'info' },
]

// ─── Resultado operacional realizado x previsto x atrasado ───────────────────

const RESULTADO_OPERACIONAL = [
  { label: 'Realizado', receitas: 117_770_940.25, despesas: 118_078_959.96 },
  { label: 'Previsto',  receitas: 434_220.26,     despesas: 1_704_232.53 },
  { label: 'Atrasado',  receitas: 11_289_853.67,  despesas: 7_661_796.79 },
]
const SALDO_TOTAL_OPERACIONAL = 2_050_030.84

// ─── Composição de custo — COE x COT ──────────────────────────────────────────

const COST_LABEL_COLOR: Record<string, string> = {
  'Insumos':                    t.chart.series[0],
  'Operações mecanizadas':      t.chart.series[1],
  'Mão de obra':                t.chart.series[2],
  'Arrendamento':                t.chart.series[3],
  'Despesas administrativas':   t.chart.series[4],
  'Financeiras':                 t.chart.series[5],
  'Outros':                      t.chart.series[6],
}

const COE_COMPOSITION = [
  { label: 'Insumos',               pct: 42 },
  { label: 'Operações mecanizadas', pct: 26 },
  { label: 'Mão de obra',           pct: 19 },
  { label: 'Arrendamento',          pct: 9  },
  { label: 'Outros',                pct: 4  },
]

const COT_COMPOSITION = [
  { label: 'Insumos',                  pct: 33 },
  { label: 'Operações mecanizadas',    pct: 20 },
  { label: 'Mão de obra',              pct: 15 },
  { label: 'Arrendamento',             pct: 7  },
  { label: 'Despesas administrativas', pct: 14 },
  { label: 'Financeiras',              pct: 8  },
  { label: 'Outros',                   pct: 3  },
]

const COST_LEGEND_LABELS = [...new Set([...COE_COMPOSITION, ...COT_COMPOSITION].map(s => s.label))]

// ─── Resultado por cultura ─────────────────────────────────────────────────────

const CROP_PERFORMANCE: Record<string, {
  realizada: number; aRealizar: number
  produtividade: number; unidProd: string
  margemHa: number; custoMedio: number; precoMedio: number; unidPreco: string
}> = {
  'Soja':           { realizada: 42_300_000, aRealizar: 8_200_000, produtividade: 62,  unidProd: 'sc/ha', margemHa: 3_850, custoMedio: 108, precoMedio: 132, unidPreco: 'R$/sc' },
  'Milho':          { realizada: 31_800_000, aRealizar: 5_100_000, produtividade: 136, unidProd: 'sc/ha', margemHa: 2_640, custoMedio: 52,  precoMedio: 58,  unidPreco: 'R$/sc' },
  'Cana-de-açúcar': { realizada: 9_400_000,  aRealizar: 1_600_000, produtividade: 85,  unidProd: 't/ha',  margemHa: 1_980, custoMedio: 96,  precoMedio: 118, unidPreco: 'R$/t'  },
  'Pastagem':       { realizada: 0,          aRealizar: 0,         produtividade: 0,   unidProd: '—',     margemHa: 0,    custoMedio: 0,   precoMedio: 0,   unidPreco: '—'    },
}

// ─── Dataset consolidado para o motor de interpretação ───────────────────────

const OVERVIEW_DATASET: OverviewDataset = {
  monthly: AREA_DATA,
  resultado: RESULTADO_OPERACIONAL,
  saldoTotal: SALDO_TOTAL_OPERACIONAL,
  aReceber: CASH_FORECAST.aReceber,
  aPagar: CASH_FORECAST.aPagar,
  aging: AGING_BUCKETS,
  crops: AREA_BY_CROP.map(([crop, ha]) => {
    const p = CROP_PERFORMANCE[crop]
    return {
      crop, ha,
      realizada: p?.realizada ?? 0, aRealizar: p?.aRealizar ?? 0,
      margemHa: p?.margemHa ?? 0, custoMedio: p?.custoMedio ?? 0,
      precoMedio: p?.precoMedio ?? 0, unidPreco: p?.unidPreco ?? '—',
    }
  }),
  cashflow12m: CASHFLOW_12M,
}

// ─── Talhões Map ──────────────────────────────────────────────────────────────

function TalhoesMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([-18.787,-52.625], 13)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    TALHAOES.forEach(talhao => {
      const poly = L.polygon(talhao.coords, { color: talhao.color, fillColor: talhao.fillColor, fillOpacity: talhao.fillOpacity, weight: 2.5 })
      poly.bindTooltip(`<div style="font-family:Outfit,sans-serif;font-size:12px;padding:4px 8px"><b>${talhao.name}</b><br/>${talhao.crop} · ${talhao.area}</div>`, { sticky: true, opacity: 1, offset: [10,0] })
      poly.on('mouseover', () => poly.setStyle({ weight: 3.5, fillOpacity: Math.min(talhao.fillOpacity + 0.18, 0.65) }))
      poly.on('mouseout', () => poly.setStyle({ weight: 2.5, fillOpacity: talhao.fillOpacity }))
      poly.addTo(map)
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])
  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}

// ─── KPI stat (top row, efferd style) ────────────────────────────────────────

function KpiTop({ label, value, trend, up, colors }: { label: string; value: string; trend: string; up: boolean; colors: ThemeColors }) {
  return (
    <div style={{ flex: 1, padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
      <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, marginBottom: t.space[1] }}>
        {label}
      </div>
      <div style={{ fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, fontFamily: t.font.family.sans, lineHeight: 1.1, marginBottom: t.space[2] }}>
        {value}
      </div>
      <Trend value={trend} up={up} />
    </div>
  )
}

// ─── Area chart (smooth SVG) ──────────────────────────────────────────────────

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]; const c = pts[i]
    const cx = (p[0] + c[0]) / 2
    d += ` C ${cx} ${p[1]}, ${cx} ${c[1]}, ${c[0]} ${c[1]}`
  }
  return d
}

function AreaChart({ colors, isGbMode, data = AREA_DATA, prevSeries }: {
  colors: ThemeColors; isGbMode: boolean; data?: typeof AREA_DATA
  /** Receitas da safra anterior alinhadas por índice — linha fantasma YoY. */
  prevSeries?: number[]
}) {
  const [hov, setHov] = useState<number | null>(null)
  const W = 700; const H = 200; const PL = 40; const PT = 16; const PR = 8; const PB = 32
  const cW = W - PL - PR; const cH = H - PT - PB
  const maxV = Math.max(...data.map(d => d.receitas), ...(prevSeries ?? [])) * 1.12
  const pts = (key: 'receitas' | 'despesas'): [number, number][] =>
    data.map((d, i) => [PL + (i / (data.length - 1)) * cW, PT + cH - (d[key] / maxV) * cH])

  const recPts = pts('receitas')
  const dspPts = pts('despesas')
  const prevPts: [number, number][] = (prevSeries ?? []).slice(-data.length).map((v, i) => [
    PL + (i / (data.length - 1)) * cW,
    PT + cH - (v / maxV) * cH,
  ])
  // Margem = receitas − despesas (cruzamento dos dois totais numa 3ª série)
  const mgPts: [number, number][] = data.map((d, i) => [
    PL + (i / (data.length - 1)) * cW,
    PT + cH - ((d.receitas - d.despesas) / maxV) * cH,
  ])

  const recPath = smoothPath(recPts)
  const dspPath = smoothPath(dspPts)
  const mgPath  = smoothPath(mgPts)

  const areaClose = (path: string, baseY: number) =>
    `${path} L ${PL + cW} ${baseY} L ${PL} ${baseY} Z`

  const yVals = [0, maxV * 0.25, maxV * 0.5, maxV * 0.75, maxV].map(v => ({
    v, y: PT + cH - (v / maxV) * cH,
    label: v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`,
  }))

  const recGradId = isGbMode ? 'recGbGrad' : 'recGrad'
  const dspGradId = isGbMode ? 'dspGbGrad' : 'dspGrad'

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxHeight: H }}>
        <defs>
          <linearGradient id={recGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color.brand[600]} stopOpacity={isGbMode ? 0.35 : 0.18} />
            <stop offset="100%" stopColor={t.color.brand[600]} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={dspGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color.feedback.error.solid} stopOpacity={isGbMode ? 0.25 : 0.10} />
            <stop offset="100%" stopColor={t.color.feedback.error.solid} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {yVals.map((yl, i) => (
          <g key={i}>
            <line x1={PL} y1={yl.y} x2={W - PR} y2={yl.y}
              stroke={colors.border.default} strokeWidth={0.5} strokeDasharray={i === 0 ? undefined : '4 3'} />
            <text x={PL - 6} y={yl.y + 4} textAnchor="end" fontSize={9}
              fill={colors.fg.subtle as string} fontFamily="Outfit,sans-serif">{yl.label}</text>
          </g>
        ))}

        {/* Area fills */}
        <path d={areaClose(recPath, PT + cH)} fill={`url(#${recGradId})`} />
        <path d={areaClose(dspPath, PT + cH)} fill={`url(#${dspGradId})`} />

        {/* Lines */}
        {prevPts.length > 1 && (
          <path d={smoothPath(prevPts)} fill="none" stroke={colors.fg.subtle as string} strokeWidth={1.25}
            strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 4" opacity={0.7} />
        )}
        <path d={recPath} fill="none" stroke={t.color.brand[600]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={dspPath} fill="none" stroke={t.color.feedback.error.solid} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 3" />
        <path d={mgPath} fill="none" stroke={MARGEM_COLOR} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />

        {/* X labels */}
        {data.map((d, i) => {
          const x = PL + (i / (data.length - 1)) * cW
          const isH = hov === i
          return (
            <g key={i}>
              <text x={x} y={PT + cH + 18} textAnchor="middle" fontSize={9}
                fill={isH ? (colors.fg.default as string) : (colors.fg.subtle as string)}
                fontFamily="Outfit,sans-serif" fontWeight={isH ? 600 : 400}>
                {d.month}
              </text>
              {/* Hover zone */}
              <rect x={x - 20} y={PT} width={40} height={cH} fill="transparent"
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'crosshair' }} />
              {/* Hover dot + line */}
              {isH && (
                <g>
                  <line x1={x} y1={PT} x2={x} y2={PT + cH} stroke={colors.border.default} strokeWidth={1} strokeDasharray="3 2" />
                  <circle cx={recPts[i][0]} cy={recPts[i][1]} r={4} fill={t.color.brand[600]} stroke={colors.bg.surface} strokeWidth={2} />
                  <circle cx={dspPts[i][0]} cy={dspPts[i][1]} r={3.5} fill={t.color.feedback.error.solid} stroke={colors.bg.surface} strokeWidth={2} />
                  <circle cx={mgPts[i][0]} cy={mgPts[i][1]} r={3.5} fill={MARGEM_COLOR} stroke={colors.bg.surface} strokeWidth={2} />
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Radial gauge (dashed circle, efferd style) ───────────────────────────────

function RadialGauge({ value, label, sub, pct, colors, isGbMode }: {
  value: string; label: string; sub: string; pct: number; colors: ThemeColors; isGbMode: boolean
}) {
  const cx = 110; const cy = 110; const R = 88
  const DASHES = 60; const dashLen = 8; const dashGap = 3.5
  const filled = Math.round(pct * DASHES)

  const dashes = Array.from({ length: DASHES }, (_, i) => {
    const angleDeg = -90 + (360 / DASHES) * i
    const rad = (angleDeg * Math.PI) / 180
    const x1 = cx + (R - dashLen / 2) * Math.cos(rad)
    const y1 = cy + (R - dashLen / 2) * Math.sin(rad)
    const x2 = cx + (R + dashLen / 2) * Math.cos(rad)
    const y2 = cy + (R + dashLen / 2) * Math.sin(rad)
    return { x1, y1, x2, y2, active: i < filled }
  })

  const activeColor = isGbMode ? t.color.brand[400] : t.color.neutral[800]
  const inactiveColor = isGbMode ? 'rgba(255,255,255,0.10)' : t.color.neutral[200]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ display: 'block' }}>
        {dashes.map((d, i) => (
          <line key={i} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
            stroke={d.active ? activeColor : inactiveColor}
            strokeWidth={3.5} strokeLinecap="round" />
        ))}
        {/* Center icon + text */}
        <foreignObject x={cx - 56} y={cy - 42} width={112} height={84}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: t.font.family.sans }}>
            <BarChart2 size={18} color={colors.fg.subtle as string} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
            <span style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.bold, color: colors.fg.default }}>{value}</span>
          </div>
        </foreignObject>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: t.space[3], marginTop: -t.space[3] }}>
        {[
          { dot: activeColor,   label: 'Margem' },
          { dot: inactiveColor === t.color.neutral[200] ? t.color.neutral[400] : inactiveColor, label: sub },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: item.dot, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Segmented bar (efferd active customers style) ────────────────────────────

function SegmentedBar({ segments, colors }: {
  segments: { color: string; pct: number; label: string }[]
  colors: ThemeColors
}) {
  return (
    <div>
      <div style={{ display: 'flex', height: 10, borderRadius: 2, overflow: 'hidden', gap: 2, marginBottom: t.space[2] }}>
        {segments.map((s, i) => (
          <div key={i} style={{ flex: s.pct, background: s.color, borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: t.space[3] }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini diverging bar (receitas x despesas, escala local) ──────────────────

function MiniDivergingBar({ label, positive, negative, colors }: {
  label: string; positive: number; negative: number; colors: ThemeColors
}) {
  const max = Math.max(positive, negative) || 1
  const saldo = positive - negative
  const saldoUp = saldo >= 0

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginBottom: t.space[2] }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: t.space[2] }}>
        <div style={{ height: 6, borderRadius: t.radius.full, background: colors.bg.subtle, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(positive / max) * 100}%`, background: t.color.brand[600], borderRadius: t.radius.full }} />
        </div>
        <div style={{ height: 6, borderRadius: t.radius.full, background: colors.bg.subtle, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(negative / max) * 100}%`, background: t.color.feedback.error.solid, borderRadius: t.radius.full }} />
        </div>
      </div>
      <div style={{
        fontSize: t.font.size.sm, fontWeight: t.font.weight.bold,
        color: saldoUp ? t.color.feedback.success.text : t.color.feedback.error.text,
      }}>
        {fmtCompact(saldo)}
      </div>
    </div>
  )
}

// ─── Barra de composição de custo (segmentos categóricos, ordem fixa) ────────

function CostCompositionBar({ label, total, segments, colors }: {
  label: string; total: string
  segments: { label: string; pct: number }[]
  colors: ThemeColors
}) {
  return (
    <div style={{ marginBottom: t.space[3] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{label}</span>
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>{total}</span>
      </div>
      <div style={{ display: 'flex', height: 10, borderRadius: 2, overflow: 'hidden', gap: 2 }}>
        {segments.map(s => (
          <div
            key={s.label}
            title={`${s.label} — ${s.pct}%`}
            style={{ flex: s.pct, background: COST_LABEL_COLOR[s.label] ?? t.color.neutral[400], borderRadius: 2 }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Fluxo de caixa projetado — barras líquidas + curva acumulada ─────────────

function CashflowChart({ colors, isGbMode }: { colors: ThemeColors; isGbMode: boolean }) {
  const [hov, setHov] = useState<number | null>(null)
  const W = 700; const H = 170; const PL = 44; const PT = 12; const PR = 8; const PB = 26
  const cW = W - PL - PR; const cH = H - PT - PB
  const data = CASHFLOW_12M

  const cum: number[] = []
  data.reduce((acc, m) => { const v = acc + m.net; cum.push(v); return v }, 0)

  const maxAbs = Math.max(...data.map(d => Math.abs(d.net)), ...cum.map(Math.abs)) * 1.15
  const y = (v: number) => PT + cH / 2 - (v / maxAbs) * (cH / 2)
  const x = (i: number) => PL + (i / (data.length - 1)) * cW
  const barW = (cW / data.length) * 0.42

  const cumPts: [number, number][] = cum.map((v, i) => [x(i), y(v)])
  const zeroY = y(0)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxHeight: H }}>
      {/* Zona negativa */}
      <rect x={PL} y={zeroY} width={cW} height={PT + cH - zeroY}
        fill={t.color.feedback.error.solid} opacity={isGbMode ? 0.06 : 0.04} />
      {/* Linha do zero */}
      <line x1={PL} y1={zeroY} x2={W - PR} y2={zeroY} stroke={colors.border.default} strokeWidth={1} />
      <text x={PL - 6} y={zeroY + 3} textAnchor="end" fontSize={9} fill={colors.fg.subtle as string} fontFamily="Outfit,sans-serif">0</text>

      {/* Barras de fluxo líquido mensal */}
      {data.map((d, i) => {
        const bx = x(i) - barW / 2
        const by = d.net >= 0 ? y(d.net) : zeroY
        const bh = Math.abs(y(d.net) - zeroY)
        const isH = hov === i
        return (
          <g key={d.month}>
            <rect x={bx} y={by} width={barW} height={Math.max(bh, 1)} rx={2}
              fill={d.net >= 0 ? t.color.brand[600] : t.color.feedback.error.solid}
              opacity={hov === null ? 0.55 : isH ? 0.9 : 0.25}
              style={{ transition: `opacity ${t.transition.fast}` }} />
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={9}
              fill={isH ? (colors.fg.default as string) : (colors.fg.subtle as string)}
              fontFamily="Outfit,sans-serif" fontWeight={isH ? 600 : 400}>
              {d.month}
            </text>
            <rect x={x(i) - cW / data.length / 2} y={PT} width={cW / data.length} height={cH} fill="transparent"
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'crosshair' }} />
          </g>
        )
      })}

      {/* Curva acumulada */}
      <path d={smoothPath(cumPts)} fill="none" stroke={t.color.accent.purple.text} strokeWidth={2}
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Hover: valores */}
      {hov !== null && (
        <g>
          <circle cx={cumPts[hov][0]} cy={cumPts[hov][1]} r={4} fill={t.color.accent.purple.text} stroke={colors.bg.surface} strokeWidth={2} />
          <text x={x(hov)} y={PT + 2} textAnchor="middle" fontSize={9} fontWeight={600}
            fill={colors.fg.default as string} fontFamily="Outfit,sans-serif">
            {`líq. ${fmtCompact(data[hov].net * 1000)} · acum. ${fmtCompact(cum[hov] * 1000)}`}
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── Aging de títulos em aberto ───────────────────────────────────────────────

function AgingRows({ colors }: { colors: ThemeColors }) {
  const max = Math.max(...AGING_BUCKETS.flatMap(b => [b.receber, b.pagar])) || 1
  return (
    <div>
      {AGING_BUCKETS.map((b, i) => {
        const isOld = i === AGING_BUCKETS.length - 1
        return (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[1] + 2 }}>
            <span style={{
              width: 68, flexShrink: 0, fontSize: t.font.size.xs,
              color: isOld ? t.color.feedback.error.text : colors.fg.subtle,
              fontWeight: isOld ? t.font.weight.semibold : t.font.weight.normal,
            }}>
              {b.label}
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ height: 5, borderRadius: t.radius.full, background: colors.bg.subtle, overflow: 'hidden' }}
                title={`A receber ${b.label}: ${fmtCompact(b.receber)}`}>
                <div style={{ height: '100%', width: `${(b.receber / max) * 100}%`, background: t.color.brand[600], borderRadius: t.radius.full }} />
              </div>
              <div style={{ height: 5, borderRadius: t.radius.full, background: colors.bg.subtle, overflow: 'hidden' }}
                title={`A pagar ${b.label}: ${fmtCompact(b.pagar)}`}>
                <div style={{ height: '100%', width: `${(b.pagar / max) * 100}%`, background: t.color.feedback.error.solid, borderRadius: t.radius.full }} />
              </div>
            </div>
            <span style={{ width: 60, flexShrink: 0, textAlign: 'right', fontSize: t.font.size.xs, color: colors.fg.subtle }}>
              {fmtCompact(b.receber)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StatMini({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <div style={{ textAlign: 'right', minWidth: 76, flexShrink: 0 }}>
      <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{label}</div>
      <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>{value}</div>
    </div>
  )
}

function CropPerformanceRow({ crop, ha, colors }: { crop: string; ha: number; colors: ThemeColors }) {
  const perf = CROP_PERFORMANCE[crop] ?? { realizada: 0, aRealizar: 0, produtividade: 0, unidProd: '—', margemHa: 0, custoMedio: 0, precoMedio: 0, unidPreco: '—' }
  const total = perf.realizada + perf.aRealizar
  const color = CROP_COLOR[crop] ?? t.color.neutral[400]
  // Folga de breakeven — distância entre preço médio e custo médio; abaixo de
  // 15% uma oscilação de mercado dessa ordem zera a margem da cultura.
  const folga = perf.custoMedio > 0 ? ((perf.precoMedio - perf.custoMedio) / perf.custoMedio) * 100 : null
  const folgaApertada = folga !== null && folga < 15

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[4], padding: `${t.space[2] + 2}px 0`, borderBottom: `1px solid ${colors.border.subtle}` }}>
      <div style={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: t.radius.full, background: color, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{crop}</div>
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{ha.toLocaleString('pt-BR')} ha</div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {total > 0 ? (
          <>
            <div style={{ display: 'flex', height: 8, borderRadius: t.radius.full, overflow: 'hidden', gap: 2 }}>
              <div style={{ flex: perf.realizada, background: t.color.brand[600], borderRadius: t.radius.full }} />
              <div style={{ flex: perf.aRealizar, background: t.color.brand[200], borderRadius: t.radius.full }} />
            </div>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginTop: 4 }}>
              {fmtCompact(total)} em receita
            </div>
          </>
        ) : (
          <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Sem produção comercial no período</div>
        )}
      </div>

      {total > 0 && (
        <div style={{ display: 'flex', gap: t.space[4], flexShrink: 0, alignItems: 'center' }}>
          <StatMini label="Produtividade" value={`${perf.produtividade} ${perf.unidProd}`} colors={colors} />
          <StatMini label="Margem/ha"     value={`R$ ${perf.margemHa.toLocaleString('pt-BR')}`} colors={colors} />
          <StatMini label="Custo médio"   value={`${perf.custoMedio} ${perf.unidPreco}`} colors={colors} />
          <StatMini label="Preço médio"   value={`${perf.precoMedio} ${perf.unidPreco}`} colors={colors} />
          {folga !== null && (
            <div
              title={`Folga do preço médio sobre o custo médio (breakeven)${folgaApertada ? ' — abaixo de 15%: oscilação de preço dessa ordem zera a margem' : ''}`}
              style={{
                textAlign: 'center', minWidth: 64, flexShrink: 0,
                padding: `${t.space[1]}px ${t.space[2]}px`, borderRadius: t.radius.md,
                background: folgaApertada ? t.color.feedback.warning.bg : t.color.feedback.success.bg,
              }}
            >
              <div style={{ fontSize: t.font.size.xs, color: folgaApertada ? t.color.feedback.warning.text : t.color.feedback.success.text }}>Folga s/ custo</div>
              <div style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, color: folgaApertada ? t.color.feedback.warning.text : t.color.feedback.success.text }}>
                {folga.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Div({ colors }: { colors: ThemeColors }) {
  return <div style={{ height: 1, background: colors.border.default }} />
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

export default function OverviewPanel() {
  const { colors, isGbMode } = useTheme()
  const { currentFarm } = useFarm()
  // Filtros — aplicados sobre os mocks; trocar por chamada filtrada quando houver API
  const [periodo, setPeriodo] = useState('10')
  const [serie, setSerie] = useState<'realizado' | 'previsto'>('realizado')
  const [cartaOpen, setCartaOpen] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  // Período fatia os últimos N meses da série ativa (realizado ou previsto)
  const activeData = (serie === 'realizado' ? AREA_DATA : FORECAST_DATA).slice(-Number(periodo))
  const serieInfo = SERIE_INFO[serie]

  // Motor de interpretação — insight de destaque e carta completa, ambos
  // computados dos mesmos dados que alimentam os charts (nunca inventados).
  const insight = headlineInsight(OVERVIEW_DATASET)
  const carta = buildOverviewCarta(OVERVIEW_DATASET)

  const saldoPrevisto = CASH_FORECAST.aReceber - CASH_FORECAST.aPagar
  const fluxoMax = Math.max(CASH_FORECAST.aReceber, CASH_FORECAST.aPagar)

  const bc = colors.border.default as string

  const cardStyle: React.CSSProperties = {
    margin: `${t.space[5]}px ${t.space[6]}px`,
    display: 'flex', flexDirection: 'column',
    background: colors.bg.surface,
    borderRadius: t.radius['2xl'],
    border: `1px solid ${bc}`,
    boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
    overflow: 'hidden',
    fontFamily: t.font.family.sans,
  }

  return (
    <div style={cardStyle}>

      {/* ── Map strip ────────────────────────────────────────────────────────── */}
      <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: t.space[3], left: t.space[4], zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: t.space[1],
          background: 'rgba(255,255,255,0.92)', borderRadius: t.radius.base,
          padding: `5px ${t.space[2]}px`, backdropFilter: 'blur(4px)',
          boxShadow: t.shadow.sm, cursor: 'pointer',
        }}>
          <Layers size={11} color={t.color.neutral[500]} />
          <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[700], fontWeight: t.font.weight.medium }}>Talhões</span>
          <ChevronDown size={11} color={t.color.neutral[400]} />
        </div>
        <div style={{
          position: 'absolute', top: t.space[3], right: t.space[4], zIndex: 1000,
          background: t.color.brand[600], borderRadius: t.radius.full,
          padding: `4px ${t.space[2]}px`, display: 'flex', alignItems: 'center', gap: t.space[1],
        }}>
          <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[0], fontWeight: t.font.weight.semibold }}>{TALHAOES.length} talhões</span>
          <ArrowRight size={10} color={t.color.neutral[0]} />
        </div>
        <TalhoesMap />
      </div>

      <HDivider color={bc} />

      {/* ── Content grid ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Main column ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Greeting + filter bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px`,
          }}>
            <Heading level={1} size="2xl" weight="bold">{greeting}</Heading>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
              <FilterSelect
                ariaLabel="Filtrar por período"
                options={[
                  { value: '3',  label: 'Últimos 3 meses' },
                  { value: '6',  label: 'Últimos 6 meses' },
                  { value: '10', label: 'Últimos 10 meses' },
                ]}
                value={periodo}
                onChange={setPeriodo}
              />
              <Button variant="secondary" size="sm" icon={<Settings2 size={12} />} disabled title="Personalização em breve">
                Personalizar
              </Button>
            </div>
          </div>

          <HDivider color={bc} />

          {/* KPI top row */}
          <div style={{ display: 'flex' }}>
            {[
              { label: 'Margem bruta',         value: '12,5%',    trend: '2,7% vs 30 dias', up: true  },
              { label: 'Receitas realizadas',   value: 'R$ 18,9M', trend: '4,1% vs 30 dias', up: true  },
              { label: 'Saldo operacional',     value: 'R$ 14,5M', trend: '1,3% vs 30 dias', up: false },
            ].flatMap((kpi, i) => [
              i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
              <div key={kpi.label} style={{ flex: 1 }}>
                <KpiTop label={kpi.label} value={kpi.value} trend={kpi.trend} up={kpi.up} colors={colors} />
              </div>,
            ])}
          </div>

          <HDivider color={bc} />

          {/* Area chart — Receitas mensais (realizado x previsto) */}
          <div style={{ padding: `${t.space[5]}px ${t.space[5]}px ${t.space[3]}px` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[4], gap: t.space[4] }}>
              <div>
                <div style={{ fontSize: t.font.size['3xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, lineHeight: 1 }}>
                  {serieInfo.hero}
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginTop: t.space[1] }}>
                  {serieInfo.label}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: t.space[2], flexShrink: 0 }}>
                <Tabs
                  label="Série"
                  items={[{ id: 'realizado', label: 'Realizado' }, { id: 'previsto', label: 'Previsto' }]}
                  activeId={serie}
                  onChange={(id) => setSerie(id as 'realizado' | 'previsto')}
                />
                <Trend value={serieInfo.trend} up={serieInfo.up} />
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[3] }}>
              {[
                { color: t.color.brand[600], label: 'Receitas' },
                { color: t.color.feedback.error.solid, label: 'Despesas' },
                { color: MARGEM_COLOR, label: 'Margem' },
                ...(serie === 'realizado' ? [{ color: colors.fg.subtle as string, label: 'Safra anterior' }] : []),
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{s.label}</span>
                </div>
              ))}
            </div>
            <AreaChart
              colors={colors}
              isGbMode={isGbMode}
              data={activeData}
              prevSeries={serie === 'realizado' ? PREV_SAFRA_RECEITAS.slice(-Number(periodo)) : undefined}
            />
          </div>

          <HDivider color={bc} />

          {/* Bottom row: Insight + Budget */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

            {/* Insight computado pelo motor de interpretação */}
            <div style={{ flex: 1, padding: t.space[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1] }}>
                  <BarChart2 size={13} color={colors.fg.subtle as string} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Insights</span>
                </div>
                <Button variant="secondary" size="sm" icon={<MessageCircle size={11} />} onClick={() => setCartaOpen(true)}>
                  Ver carta completa
                </Button>
              </div>
              <p style={{ fontSize: t.font.size.lg, color: colors.fg.subtle, lineHeight: 1.6, margin: 0, fontWeight: t.font.weight.normal }}>
                {insight.text}
                <strong style={{ color: colors.fg.default, fontWeight: t.font.weight.bold }}>{insight.strong}</strong>
                {insight.tail}
              </p>
            </div>

            <VDivider color={bc} />

            {/* Resultado operacional (DRE) — receita → custos → resultado */}
            <div style={{ flex: 1, padding: t.space[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[2] }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Resultado operacional (DRE)</span>
                <Button variant="ghost" size="sm" icon={<Wheat size={11} />}>
                  Detalhes
                </Button>
              </div>
              <SankeyFunnel stages={DRE_STAGES} colors={colors} isGbMode={isGbMode} chartHeight={150} />
            </div>

          </div>

          <HDivider color={bc} />

          {/* Resultado operacional — realizado x previsto x atrasado */}
          <div style={{ padding: `${t.space[5]}px ${t.space[5]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.space[4] }}>
              <div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginBottom: t.space[1] }}>
                  Resultado operacional · saldo total no período
                </div>
                <div style={{
                  fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, lineHeight: 1.1,
                  color: SALDO_TOTAL_OPERACIONAL >= 0 ? t.color.feedback.success.text : t.color.feedback.error.text,
                }}>
                  {fmtCompact(SALDO_TOTAL_OPERACIONAL)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: t.space[4], flexShrink: 0, paddingTop: t.space[1] }}>
                {[
                  { color: t.color.brand[600], label: 'Receitas' },
                  { color: t.color.feedback.error.solid, label: 'Despesas' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                    <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: t.space[6] }}>
              {RESULTADO_OPERACIONAL.map(r => (
                <MiniDivergingBar key={r.label} label={r.label} positive={r.receitas} negative={r.despesas} colors={colors} />
              ))}
            </div>
          </div>

          <HDivider color={bc} />

          {/* Fluxo de caixa projetado — acumulado 12 meses */}
          <div style={{ padding: `${t.space[4]}px ${t.space[5]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[2] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>
                Fluxo de caixa projetado — próximos 12 meses
              </span>
              <div style={{ display: 'flex', gap: t.space[3] }}>
                {[
                  { color: t.color.brand[600], label: 'Fluxo líquido +' },
                  { color: t.color.feedback.error.solid, label: 'Fluxo líquido −' },
                  { color: t.color.accent.purple.text, label: 'Acumulado' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                    <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <CashflowChart colors={colors} isGbMode={isGbMode} />
          </div>

          <HDivider color={bc} />

          {/* Área plantada por cultura — cruza os talhões (ha × cultura) */}
          <div style={{ padding: `${t.space[4]}px ${t.space[5]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Área plantada por cultura</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>
                {TOTAL_HA.toLocaleString('pt-BR')} ha · {TALHAOES.length} talhões
              </span>
            </div>
            <SegmentedBar
              colors={colors}
              segments={AREA_BY_CROP.map(([crop, ha]) => ({
                color: CROP_COLOR[crop] ?? t.color.neutral[400],
                pct: ha,
                label: `${crop} — ${Math.round((ha / TOTAL_HA) * 100)}%`,
              }))}
            />
          </div>

          <HDivider color={bc} />

          {/* Resultado por cultura — receita realizada/a realizar + indicadores agronômicos */}
          <div style={{ padding: `${t.space[4]}px ${t.space[5]}px ${t.space[5]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[2] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Resultado por cultura</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: t.color.brand[600], display: 'inline-block' }} />
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Realizada</span>
                <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: t.color.brand[200], display: 'inline-block', marginLeft: t.space[2] }} />
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>A realizar</span>
              </div>
            </div>
            {AREA_BY_CROP.map(([crop, ha]) => (
              <CropPerformanceRow key={crop} crop={crop} ha={ha} colors={colors} />
            ))}
          </div>

        </div>

        <VDivider color={bc} />

        {/* ── Right aside ────────────────────────────────────────────────────── */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Radial gauge */}
          <div style={{ padding: `${t.space[5]}px ${t.space[4]}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RadialGauge
              value="R$ 14,5M"
              label="Margem operacional"
              sub="Custos"
              pct={0.77}
              colors={colors}
              isGbMode={isGbMode}
            />
            <Button variant="secondary" size="sm" block iconRight={<ArrowRight size={11} />} style={{ marginTop: t.space[3] }}>
              Ver detalhe
            </Button>
          </div>

          <HDivider color={bc} />

          {/* Realizado progress */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Receitas realizadas</span>
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>78%</span>
            </div>
            <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, lineHeight: 1, marginBottom: t.space[3] }}>
              18.993
            </div>
            {/* Segmented ticks */}
            <div style={{ display: 'flex', gap: 2, marginBottom: t.space[2] }}>
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: 10, borderRadius: 1,
                  background: i < 31
                    ? (isGbMode ? t.color.brand[500] : t.color.neutral[700])
                    : (isGbMode ? 'rgba(255,255,255,0.10)' : t.color.neutral[200]),
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: t.space[3] }}>
              {[
                { color: isGbMode ? t.color.brand[500] : t.color.neutral[700], label: 'Realizado' },
                { color: isGbMode ? 'rgba(255,255,255,0.15)' : t.color.neutral[200], label: 'Previsto' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <HDivider color={bc} />

          {/* Custo de produção — composição COE x COT */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[3] }}>
              <TrendingUp size={11} color={t.color.brand[600]} />
              <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>
                Custo de produção — COE x COT
              </span>
            </div>

            <div style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[4] }}>
              <div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Margem bruta</div>
                <div style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: colors.fg.default }}>R$ 56,1M</div>
              </div>
              <div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Margem líquida</div>
                <div style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: colors.fg.default }}>R$ 56,0M</div>
              </div>
            </div>

            <CostCompositionBar label="COE — Custo Operacional Efetivo" total="R$ 62,4M" segments={COE_COMPOSITION} colors={colors} />
            <CostCompositionBar label="COT — Custo Operacional Total"   total="R$ 73,4M" segments={COT_COMPOSITION} colors={colors} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[2], marginTop: t.space[1] }}>
              {COST_LEGEND_LABELS.map(label => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: t.radius.full, background: COST_LABEL_COLOR[label], display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{label}</span>
                </div>
              ))}
            </div>

            <Button variant="secondary" size="sm" block iconRight={<ArrowRight size={11} />} style={{ marginTop: t.space[3] }}>
              Ver detalhes
            </Button>
          </div>

          <HDivider color={bc} />

          {/* Previsão de receitas x despesas (contas em aberto) */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px`, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[3] }}>
              <Wallet size={11} color={colors.fg.subtle as string} />
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Previsão de receitas x despesas</span>
            </div>

            {[
              { label: 'A receber', value: CASH_FORECAST.aReceber, color: t.color.brand[600] },
              { label: 'A pagar',   value: CASH_FORECAST.aPagar,   color: t.color.feedback.error.solid },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: t.space[3] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>{row.label}</span>
                  <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: colors.fg.default }}>{fmtCompact(row.value)}</span>
                </div>
                <div style={{ height: 6, borderRadius: t.radius.full, background: colors.bg.subtle, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(row.value / fluxoMax) * 100}%`, background: row.color, borderRadius: t.radius.full }} />
                </div>
              </div>
            ))}

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: t.space[2], borderTop: `1px solid ${colors.border.default}`,
              marginBottom: t.space[3],
            }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Saldo previsto</span>
              <span style={{
                fontSize: t.font.size.base, fontWeight: t.font.weight.bold,
                color: saldoPrevisto >= 0 ? t.color.feedback.success.text : t.color.feedback.error.text,
              }}>
                {fmtCompact(saldoPrevisto)}
              </span>
            </div>

            {/* Aging dos títulos em aberto */}
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginBottom: t.space[2] }}>
              Aging dos títulos em aberto
            </div>
            <AgingRows colors={colors} />
          </div>

          <HDivider color={bc} />

          {/* Cobertura de estoque — insumos críticos */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px` }}>
            <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, marginBottom: t.space[3] }}>
              Cobertura de estoque — insumos críticos
            </div>
            {STOCK_COVERAGE.map(s => {
              const abaixo = s.dias < s.min
              return (
                <div key={s.item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[2] }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.medium, color: colors.fg.default, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.item}
                    </div>
                    <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>mínimo {s.min} dias</div>
                  </div>
                  <span style={{
                    flexShrink: 0, fontSize: t.font.size.xs, fontWeight: t.font.weight.bold,
                    padding: `2px ${t.space[2]}px`, borderRadius: t.radius.full,
                    color: abaixo ? t.color.feedback.error.text : t.color.feedback.success.text,
                    background: abaixo ? t.color.feedback.error.bg : t.color.feedback.success.bg,
                  }}>
                    {s.dias} dias
                  </span>
                </div>
              )
            })}
          </div>

          <HDivider color={bc} />

          {/* Concentração de receita por comprador */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[3] }}>
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Concentração de receita</span>
              {REVENUE_SHARE[0].pct > 40 && (
                <span style={{
                  fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
                  color: t.color.feedback.warning.text, background: t.color.feedback.warning.bg,
                  padding: `2px ${t.space[2]}px`, borderRadius: t.radius.full,
                }}>
                  {REVENUE_SHARE[0].pct}% em 1 comprador
                </span>
              )}
            </div>
            <SegmentedBar
              colors={colors}
              segments={REVENUE_SHARE.map((r, i) => ({
                color: t.chart.series[i],
                pct: r.pct,
                label: `${r.label} — ${r.pct}%`,
              }))}
            />
          </div>

          <HDivider color={bc} />

          {/* Exceções da semana */}
          <div style={{ padding: `${t.space[4]}px ${t.space[4]}px`, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], marginBottom: t.space[2] }}>
              <TrendingDown size={11} color={t.color.feedback.error.text} />
              <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Exceções da semana</span>
            </div>
            {EXCEPTIONS.map(ex => (
              <div key={ex.label} style={{ display: 'flex', alignItems: 'center', gap: t.space[2], marginBottom: t.space[1] + 2 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: t.radius.full, flexShrink: 0,
                  background: t.color.feedback[ex.tone].solid,
                }} aria-hidden="true" />
                <span style={{ flex: 1, minWidth: 0, fontSize: t.font.size.xs, color: colors.fg.muted }}>{ex.label}</span>
                {ex.value && (
                  <span style={{ flexShrink: 0, fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.color.feedback[ex.tone].text }}>
                    {ex.value}
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Carta de Interpretação — leitura técnica dos dados do painel */}
      <InterpretationLetter
        open={cartaOpen}
        onClose={() => setCartaOpen(false)}
        carta={carta}
        fonte={currentFarm ? `${currentFarm.name} · base do painel` : undefined}
      />
    </div>
  )
}
