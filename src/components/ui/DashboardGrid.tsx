import React, { createContext, useContext } from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { Heading } from './Heading'
import { Trend } from './Trend'
import { Skeleton } from './Skeleton'
import { useMediaQuery } from '../../hooks/useMediaQuery'

// ─── DashboardGrid ─────────────────────────────────────────────────────────────
// Casca dos dashboards no estilo "card fill sobre canvas": o dashboard não é mais
// um card único com divisores internos — cada bloco tem fill próprio e é o fundo
// (canvas) que forma os separadores.
//
// Composição canônica:
//
//   DashboardGrid                       ← canvas + gap entre as fileiras
//     ├── DashboardHeader               ← título + filtros, sobre o canvas
//     ├── DashboardRow wrap             ← fileira de KPIs
//     │     └── DashboardKpiCard ×N
//     ├── DashboardRow                  ← fileira de blocos com pesos
//     │     ├── DashboardCard flex={3}
//     │     └── DashboardCard flex={2}
//     └── DashboardCard                 ← bloco de largura total
//
// Fonte única (Lei 2): canvas, raio, sombra e gap ajustados aqui propagam para
// todos os dashboards. Não recriar esta casca inline nas páginas.

/** Empilhamento das fileiras — tablet e abaixo. */
const STACK_QUERY = `(max-width: ${t.breakpoint.md - 1}px)`

interface RowContextValue {
  /** O card está dentro de uma `DashboardRow`? Define se ele divide a largura. */
  inRow: boolean
  /** A fileira está empilhada (tablet/mobile)? */
  stacked: boolean
  /** Fileira empilhada quebra em 2 colunas em vez de 1 card por linha (KPIs). */
  wrap: boolean
}

const RowContext = createContext<RowContextValue>({ inRow: false, stacked: false, wrap: false })

// ─── DashboardGrid ─────────────────────────────────────────────────────────────

interface DashboardGridProps {
  children: React.ReactNode
}

/**
 * Canvas do dashboard. Preenche a área de conteúdo, pinta o fundo que separa os
 * blocos e distribui as fileiras com gap uniforme.
 */
export function DashboardGrid({ children }: DashboardGridProps) {
  const { colors } = useTheme()

  return (
    <div
      style={{
        minHeight: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[4],
        padding: t.space[4],
        background: colors.bg.canvas,
        borderRadius: t.radius['2xl'],
        fontFamily: t.font.family.sans,
      }}
    >
      {children}
    </div>
  )
}

// ─── DashboardHeader ───────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  title: string
  /** Linha de apoio acima do título (ex.: "Acompanhe e analise sua safra"). */
  subtitle?: string
  /** Slot de ações à direita — FilterSelect, Tabs, Button. */
  actions?: React.ReactNode
  /** Nível semântico do título. Default `2`. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Tamanho tokenizado do título. Default `2xl` — mesmo degrau do `PageHeader`
   * das listagens, para o título de um dashboard não competir em escala com o
   * de uma tela de cadastro.
   */
  size?: keyof typeof t.font.size
}

/**
 * Cabeçalho do dashboard. Fica sobre o canvas, fora dos cards — o título nunca
 * disputa espaço com um bloco de dado.
 */
export function DashboardHeader({
  title,
  subtitle,
  actions,
  level = 2,
  size = '2xl',
}: DashboardHeaderProps) {
  const { colors } = useTheme()
  const stacked = useMediaQuery(STACK_QUERY)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: t.space[3],
        padding: `0 ${t.space[1]}px`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        {subtitle && (
          <span
            style={{
              fontSize: t.font.size.sm,
              color: colors.fg.subtle as string,
              fontFamily: t.font.family.sans,
            }}
          >
            {subtitle}
          </span>
        )}
        <Heading level={level} size={size} weight="semibold">
          {title}
        </Heading>
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}

// ─── DashboardRow ──────────────────────────────────────────────────────────────

interface DashboardRowProps {
  children: React.ReactNode
  /** Alinhamento vertical dos cards da fileira. Default `stretch` (mesma altura). */
  align?: 'stretch' | 'flex-start'
  /**
   * Ao empilhar, quebra em 2 colunas em vez de 1 card por linha. Usar em
   * fileiras de KPI, onde o card é baixo e ainda cabe lado a lado no tablet.
   */
  wrap?: boolean
}

/**
 * Fileira de cards do dashboard. Distribui a largura pelos pesos de cada
 * `DashboardCard` (`flex`) e empilha abaixo de `t.breakpoint.md`.
 */
export function DashboardRow({ children, align = 'stretch', wrap = false }: DashboardRowProps) {
  const stacked = useMediaQuery(STACK_QUERY)
  const wrapped = stacked && wrap

  return (
    <RowContext.Provider value={{ inRow: true, stacked, wrap }}>
      <div
        style={{
          display: 'flex',
          flexDirection: stacked && !wrap ? 'column' : 'row',
          flexWrap: wrapped ? 'wrap' : undefined,
          alignItems: align,
          gap: t.space[4],
        }}
      >
        {children}
      </div>
    </RowContext.Provider>
  )
}

// ─── DashboardStack ────────────────────────────────────────────────────────────

interface DashboardStackProps {
  children: React.ReactNode
  /** Peso da largura dentro de uma `DashboardRow`. Default `1`. */
  flex?: number
  /**
   * Largura fixa em px — coluna que não deve esticar (ex.: painel lateral de
   * 320px do Painel Geral). Ignorada quando a fileira empilha. Tem precedência
   * sobre `flex`.
   */
  width?: number
}

/**
 * Coluna de cards dentro de uma fileira — para quando uma célula da fileira
 * carrega dois blocos empilhados (ex.: donut acima, gauge abaixo). Mantém o
 * mesmo gap do canvas e devolve largura total aos cards internos.
 */
export function DashboardStack({ children, flex, width }: DashboardStackProps) {
  const { inRow, stacked, wrap } = useContext(RowContext)

  const fixed = width !== undefined && !stacked

  const flexValue = !inRow
    ? undefined
    : fixed
      ? '0 0 auto'
      : stacked
        ? (wrap ? '1 1 45%' : undefined)
        : `${flex ?? 1} 1 0%`

  return (
    <div
      style={{
        flex: flexValue,
        width: fixed ? width : undefined,
        minWidth: inRow && !fixed ? 0 : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: t.space[4],
      }}
    >
      {/* Cards internos voltam a ser de largura total dentro da coluna. */}
      <RowContext.Provider value={{ inRow: false, stacked, wrap: false }}>
        {children}
      </RowContext.Provider>
    </div>
  )
}

// ─── DashboardCard ─────────────────────────────────────────────────────────────

interface DashboardCardProps {
  children: React.ReactNode
  /** Rótulo do bloco, no topo do card. Aceita nó para rótulos com ícone/legenda. */
  title?: React.ReactNode
  /** Slot à direita do rótulo — FilterSelect, Tabs, Button, IconButton. */
  action?: React.ReactNode
  /** Peso da largura dentro de uma `DashboardRow`. Default `1`. */
  flex?: number
  /** Remove o padding interno — blocos que sangram até a borda (mapa, tabela). */
  bare?: boolean
  /** Altura mínima do bloco. */
  minHeight?: number
  /**
   * Tom do bloco. `default` usa a superfície neutra; `warning` pinta o fill de
   * aviso (`feedback.warning.bg`) para blocos que comunicam atenção — evita o
   * card de alerta montado à mão na tela.
   */
  tone?: 'default' | 'warning'
}

/**
 * Bloco preenchido do dashboard — a unidade visual do estilo de referência:
 * fill próprio, raio e sombra do tema, sem borda no tema claro (quem separa é o
 * canvas). No GBMode mantém a hairline verde, necessária sobre fundo escuro.
 */
export function DashboardCard({
  children,
  title,
  action,
  flex,
  bare = false,
  minHeight,
  tone = 'default',
}: DashboardCardProps) {
  const { colors, isGbMode } = useTheme()
  const { inRow, stacked, wrap } = useContext(RowContext)

  // Fora de fileira o card é de largura total (altura pelo conteúdo); dentro da
  // fileira divide a largura pelo peso, e ao empilhar vira 1 ou 2 por linha.
  const flexValue = !inRow
    ? undefined
    : stacked
      ? (wrap ? '1 1 45%' : undefined)
      : `${flex ?? 1} 1 0%`

  return (
    <div
      style={{
        flex: flexValue,
        minWidth: inRow ? 0 : undefined,
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        background: isGbMode
          ? t.color.gb.surface
          : (tone === 'warning' ? t.color.feedback.warning.bg : colors.bg.surface),
        backdropFilter: isGbMode ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: isGbMode ? 'blur(20px)' : undefined,
        border: isGbMode ? `1px solid ${colors.border.default}` : 'none',
        borderRadius: t.radius['2xl'],
        boxShadow: isGbMode ? t.shadow.cardDark : t.shadow.card,
        padding: bare ? 0 : t.space[5],
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: t.font.family.sans,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: t.space[3],
            marginBottom: t.space[4],
            padding: bare ? `${t.space[4]}px ${t.space[5]}px 0` : undefined,
          }}
        >
          {title ? (
            <Heading level={3} size="sm" weight="medium" tone="secondary">
              {title}
            </Heading>
          ) : (
            <span />
          )}
          {action && (
            // `flexWrap` deixa legenda longa quebrar em vez de ser cortada pela
            // borda do card; controles (FilterSelect/Button) não encolhem abaixo
            // do próprio conteúdo, então continuam íntegros.
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              flexWrap: 'wrap', gap: `${t.space[1]}px ${t.space[2]}px`, minWidth: 0,
            }}>
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── DashboardSkeleton ─────────────────────────────────────────────────────────

interface DashboardSkeletonProps {
  /** Quantidade de KPIs da primeira fileira. Default `4`. Use `0` para omitir. */
  kpis?: number
  /** Altura dos blocos de conteúdo, na ordem em que aparecem. */
  blocks?: number[]
}

/**
 * Estado de loading do dashboard. Reproduz a própria grade de cards — mesma
 * quantidade de KPIs e mesmos blocos — para o conteúdo real entrar sem layout
 * shift.
 */
export function DashboardSkeleton({ kpis = 4, blocks = [260, 200] }: DashboardSkeletonProps) {
  return (
    <DashboardGrid>
      <div style={{ padding: `0 ${t.space[1]}px` }}>
        <Skeleton height={26} width={200} />
      </div>
      {kpis > 0 && (
        <DashboardRow wrap>
          {Array.from({ length: kpis }, (_, i) => (
            <DashboardCard key={i}>
              <Skeleton height={62} />
            </DashboardCard>
          ))}
        </DashboardRow>
      )}
      {blocks.map((height, i) => (
        <DashboardCard key={i}>
          <Skeleton height={height} />
        </DashboardCard>
      ))}
    </DashboardGrid>
  )
}

// ─── DashboardKpiCard ──────────────────────────────────────────────────────────

interface DashboardKpiCardProps {
  label: string
  value: string
  /** Variação percentual (ex.: `'5,4%'`). Ausente/`null` omite o `Trend`. */
  trend?: string | null
  /** Direção da variação. Default `true` (alta). */
  up?: boolean
  /** Texto de apoio abaixo do valor. */
  sub?: string
  /** Peso da largura dentro da fileira. Default `1`. */
  flex?: number
  /**
   * Tamanho do valor principal. Por padrão desce em degraus conforme o
   * comprimento do texto (ver `kpiValueSize`) — informe para forçar um degrau
   * fixo.
   */
  valueSize?: keyof typeof t.font.size
  /**
   * Cor do valor quando ele carrega semântica própria (ex.: verde para
   * "currais disponíveis", vermelho para "nenhum disponível"). Default: cor de
   * texto padrão do tema.
   */
  valueColor?: string
  /** Conteúdo extra na base do card — ex.: `SparklineArea` da série do KPI. */
  children?: React.ReactNode
}

/**
 * KPI como card preenchido — substitui as cópias locais de "rótulo + valor
 * grande + Trend" que antes viviam separadas por `VDivider` dentro do card único.
 */
/**
 * Degraus graduais do valor do KPI. Número curto ocupa o degrau grande; texto
 * longo ("Déficit Hídrico", "0,82 kg/dia") desce um degrau em vez de estourar o
 * card em duas linhas. Mesma lógica do `KpiStatCard`, calibrada para o teto de
 * `2xl` — o degrau do título do dashboard.
 */
function kpiValueSize(value: string): keyof typeof t.font.size {
  if (value.length > 18) return 'md'
  if (value.length > 13) return 'xl'
  return '2xl'
}

export function DashboardKpiCard({
  label,
  value,
  trend,
  up = true,
  sub,
  flex,
  valueSize,
  valueColor,
  children,
}: DashboardKpiCardProps) {
  const { colors } = useTheme()
  const resolvedValueSize = valueSize ?? kpiValueSize(value)

  return (
    <DashboardCard flex={flex}>
      <div
        style={{
          fontSize: t.font.size.xs,
          color: colors.fg.subtle as string,
          marginBottom: t.space[1],
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: t.font.size[resolvedValueSize],
          fontWeight: t.font.weight.bold,
          color: valueColor ?? (colors.fg.default as string),
          lineHeight: t.font.lineHeight.tight,
          marginBottom: trend || sub ? t.space[2] : 0,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: t.font.size.xs,
            color: colors.fg.subtle as string,
            marginBottom: trend ? t.space[2] : 0,
          }}
        >
          {sub}
        </div>
      )}
      {trend && <Trend value={trend} up={up} />}
      {children && <div style={{ marginTop: t.space[3] }}>{children}</div>}
    </DashboardCard>
  )
}
