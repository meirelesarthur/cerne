import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Check, ChevronRight, Minus, Plus, Sparkles } from 'lucide-react'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { FormPageHeader } from '../../components/ui/FormPageHeader'
import { Card } from '../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Heading } from '../../components/ui/Heading'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Tag } from '../../components/ui/Tag'
import { Divider } from '../../components/ui/Divider'
import { ToggleSwitch } from '../../components/ui/ToggleSwitch'
import { Skeleton } from '../../components/ui/Skeleton'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import {
  planos, addOns, tabelaComparativa, formatBRL,
  type Plano, type PlanoId, type LinhaComparacao,
} from './planosData'

const N_MIN = 1
const N_MAX = 200

/** Ordem das faixas (do menor para o maior) — base da lógica de upsell. */
const TIER_ORDER: PlanoId[] = ['essencial', 'profissional', 'enterprise']

/** Plano que o usuário possui hoje (mock — trocar por dado da assinatura real). */
const PLANO_ATUAL_ID: PlanoId = 'essencial'

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: t.space[5],
  alignItems: 'stretch',
}

const reducedMotionCss = `
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`

const planoPorId = (id: PlanoId) => planos.find((p) => p.id === id)!

/**
 * Colunas do benchmark de upsell: plano atual + selecionado + a faixa
 * imediatamente acima da maior das duas — para sempre oferecer um próximo passo.
 */
function benchmarkColunasIds(atualId: PlanoId, selecionadoId: PlanoId): PlanoId[] {
  const idxAtual = TIER_ORDER.indexOf(atualId)
  const idxSel = TIER_ORDER.indexOf(selecionadoId)
  const acimaIdx = Math.max(idxAtual, idxSel) + 1
  const ids = new Set<PlanoId>([atualId, selecionadoId])
  if (acimaIdx < TIER_ORDER.length) ids.add(TIER_ORDER[acimaIdx])
  return TIER_ORDER.filter((id) => ids.has(id))
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function PlanosPage() {
  const { colors, isGbMode } = useTheme()
  const [nUsuarios, setNUsuarios] = useState(5)
  const [anual, setAnual] = useState(true)
  const [loading, setLoading] = useState(true)
  const [comprando, setComprando] = useState<PlanoId | null>(null)
  const [detalheId, setDetalheId] = useState<PlanoId | null>(null)

  useEffect(() => {
    const timerId = window.setTimeout(() => setLoading(false), 450)
    return () => window.clearTimeout(timerId)
  }, [])

  const handleComprar = (planoId: PlanoId) => {
    setComprando(planoId)
    window.setTimeout(() => setComprando(null), 1600)
  }

  const planoDetalhe = detalheId ? planoPorId(detalheId) : null

  return (
    <PageContainer>
      <style>{reducedMotionCss}</style>

      {planoDetalhe ? (
        <PlanoDetalhe
          plano={planoDetalhe}
          nUsuarios={nUsuarios}
          setNUsuarios={setNUsuarios}
          anual={anual}
          setAnual={setAnual}
          colors={colors}
          isGbMode={isGbMode}
          comprando={comprando === planoDetalhe.id}
          onComprar={() => handleComprar(planoDetalhe.id)}
          onVoltar={() => setDetalheId(null)}
        />
      ) : (
        <>
          <PageHeader
            title="Planos e Preços"
            description="Licenças por usuário, sem taxa de setup"
          />

          {loading ? (
            <PlanosSkeleton />
          ) : (
            <>
              <BarraControles
                nUsuarios={nUsuarios}
                setNUsuarios={setNUsuarios}
                anual={anual}
                setAnual={setAnual}
                colors={colors}
              />

              <div style={{ ...gridStyle, marginTop: t.space[6] }}>
                {planos.map((plano) => (
                  <PlanoCard
                    key={plano.id}
                    plano={plano}
                    nUsuarios={nUsuarios}
                    anual={anual}
                    colors={colors}
                    isGbMode={isGbMode}
                    atual={plano.id === PLANO_ATUAL_ID}
                    comprando={comprando === plano.id}
                    onComprar={() => handleComprar(plano.id)}
                    onVerDetalhes={() => setDetalheId(plano.id)}
                  />
                ))}
              </div>

              <SecaoAddOns nUsuarios={nUsuarios} colors={colors} />

              <TabelaComparacao
                titulo="Comparativo de recursos"
                colunas={planos.map((p) => ({
                  planoId: p.id,
                  badge: p.popular ? { label: 'Popular', variant: 'success' as BadgeVariant } : undefined,
                }))}
                colors={colors}
              />
            </>
          )}

          <div style={{ marginTop: t.space[10] }}>
            <Divider />
            <p style={notaRodapeStyle(colors)}>
              ¹ Valores em reais (BRL), sem impostos incluídos. &nbsp;·&nbsp;
              ² Licença por usuário ativo ao mês. &nbsp;·&nbsp;
              ³ Cobrança anual faturada de uma só vez; mensal renovada todo mês. &nbsp;·&nbsp;
              ⁴ Usuários podem ser adicionados ou removidos a qualquer momento — a fatura é ajustada proporcionalmente.
            </p>
          </div>
        </>
      )}
    </PageContainer>
  )
}

const notaRodapeStyle = (colors: ReturnType<typeof useTheme>['colors']): React.CSSProperties => ({
  marginTop: t.space[4],
  textAlign: 'center',
  fontSize: t.font.size.xs,
  color: colors.textMuted,
  fontFamily: t.font.family.sans,
  lineHeight: t.font.lineHeight.relaxed,
})

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PlanosSkeleton() {
  return (
    <>
      <Card radius="xl" shadow="sm" padding={t.space[4]} style={{ marginTop: t.space[6] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={220} height={36} />
          <Skeleton width={200} height={36} />
        </div>
      </Card>
      <div style={{ ...gridStyle, marginTop: t.space[6] }}>
        {[0, 1, 2].map((i) => (
          <Card key={i} radius="xl" shadow="md" padding={t.space[6]}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
              <Skeleton width="50%" height={24} />
              <Skeleton width="75%" height={14} />
              <Skeleton width="45%" height={38} />
              <Skeleton width="100%" height={58} />
              <Skeleton width="100%" height={42} />
              <Skeleton width="100%" height={42} />
              <Skeleton width="100%" height={1} />
              {[0, 1, 2, 3, 4].map((j) => <Skeleton key={j} width="85%" height={14} />)}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

// ─── Controls bar ─────────────────────────────────────────────────────────────

interface BarraControlesProps {
  nUsuarios: number
  setNUsuarios: (n: number) => void
  anual: boolean
  setAnual: (v: boolean) => void
  colors: ReturnType<typeof useTheme>['colors']
}

function BarraControles({ nUsuarios, setNUsuarios, anual, setAnual, colors }: BarraControlesProps) {
  return (
    <Card radius="xl" shadow="sm" padding={t.space[4]} style={{ marginTop: t.space[6] }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: t.space[4],
          justifyContent: 'space-between',
        }}
      >
        {/* User stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          <span
            style={{
              fontSize: t.font.size.base,
              fontWeight: t.font.weight.medium,
              color: colors.textSecondary,
              fontFamily: t.font.family.sans,
              marginRight: t.space[1],
            }}
          >
            Usuários
          </span>
          <IconButton
            icon={<Minus size={13} />}
            variant="outline"
            size="sm"
            aria-label="Diminuir número de usuários"
            disabled={nUsuarios <= N_MIN}
            onClick={() => setNUsuarios(Math.max(N_MIN, nUsuarios - 1))}
          />
          <div
            style={{
              minWidth: 52,
              textAlign: 'center',
              fontSize: t.font.size['2xl'],
              fontWeight: t.font.weight.bold,
              fontFamily: t.font.family.sans,
              color: colors.textPrimary,
              userSelect: 'none',
            }}
          >
            {nUsuarios}
          </div>
          <IconButton
            icon={<Plus size={13} />}
            variant="outline"
            size="sm"
            aria-label="Aumentar número de usuários"
            disabled={nUsuarios >= N_MAX}
            onClick={() => setNUsuarios(Math.min(N_MAX, nUsuarios + 1))}
          />
          {nUsuarios >= 150 && (
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.textMuted,
                fontFamily: t.font.family.sans,
                marginLeft: t.space[1],
              }}
            >
              Para +200 usuários, consulte o Enterprise
            </span>
          )}
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3] }}>
          <ToggleSwitch checked={anual} onChange={setAnual} label="Cobrança anual" />
          {anual && <Badge label="Economize 17%" variant="success" />}
        </div>
      </div>
    </Card>
  )
}

// ─── Reusable price + total blocks ─────────────────────────────────────────────

function BlocoPreco({
  plano, anual, colors,
}: {
  plano: Plano
  anual: boolean
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const preco = anual ? plano.precoUsuarioMesAnual : plano.precoUsuarioMesMensal
  if (preco === null) {
    return (
      <Heading level={4} size="2xl" weight="bold" tone="secondary">
        Sob consulta
      </Heading>
    )
  }
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1] }}>
        <Heading level={4} size="4xl" weight="extrabold">{formatBRL(preco)}</Heading>
        <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
          /usuário/mês
        </span>
      </div>
      {anual && (
        <span
          style={{
            display: 'block',
            marginTop: t.space[1],
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
          }}
        >
          Cobrança anual — {formatBRL(preco * 12)}/usuário/ano
        </span>
      )}
    </>
  )
}

function BlocoTotal({
  plano, nUsuarios, anual, colors,
}: {
  plano: Plano
  nUsuarios: number
  anual: boolean
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const preco = anual ? plano.precoUsuarioMesAnual : plano.precoUsuarioMesMensal
  if (preco === null) return null
  const totalMes = nUsuarios * preco

  return (
    <div
      style={{
        background: colors.brandBg,
        borderRadius: t.radius.lg,
        padding: `${t.space[3]}px ${t.space[4]}px`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
          {nUsuarios} {nUsuarios === 1 ? 'usuário' : 'usuários'}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1] }}>
          <span
            style={{
              fontSize: t.font.size['2xl'],
              fontWeight: t.font.weight.extrabold,
              fontFamily: t.font.family.sans,
              color: colors.brand,
            }}
          >
            {formatBRL(totalMes)}
          </span>
          <span style={{ fontSize: t.font.size.sm, color: colors.textMuted, fontFamily: t.font.family.sans }}>
            /mês
          </span>
        </div>
      </div>
      {anual && (
        <span
          style={{
            display: 'block',
            marginTop: t.space[1],
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            textAlign: 'right',
          }}
        >
          {formatBRL(totalMes * 12)}/ano
        </span>
      )}
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

interface PlanoCardProps {
  plano: Plano
  nUsuarios: number
  anual: boolean
  colors: ReturnType<typeof useTheme>['colors']
  isGbMode: boolean
  atual: boolean
  comprando: boolean
  onComprar: () => void
  onVerDetalhes: () => void
}

function PlanoCard({
  plano, nUsuarios, anual, colors, isGbMode, atual, comprando, onComprar, onVerDetalhes,
}: PlanoCardProps) {
  const sobConsulta = plano.precoUsuarioMesAnual === null

  return (
    <Card
      radius="xl"
      shadow={plano.popular ? 'lg' : 'md'}
      padding={t.space[6]}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        border: plano.popular
          ? `1.5px solid ${t.color.brand[600]}`
          : `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: t.space[2] }}>
        <Heading level={3} size="2xl" weight="bold">{plano.nome}</Heading>
        {plano.destaque && <Badge label={plano.destaque} variant="success" />}
        {atual && <Badge label="Seu plano atual" variant="info" />}
      </div>
      <p
        style={{
          margin: `${t.space[1]}px 0 0`,
          fontSize: t.font.size.sm,
          color: colors.textMuted,
          fontFamily: t.font.family.sans,
          lineHeight: t.font.lineHeight.snug,
          minHeight: 32,
        }}
      >
        {plano.subtitulo}
      </p>

      {/* Price */}
      <div style={{ marginTop: t.space[5] }}>
        <BlocoPreco plano={plano} anual={anual} colors={colors} />
      </div>

      {/* Live total */}
      {!sobConsulta && (
        <div style={{ marginTop: t.space[4] }}>
          <BlocoTotal plano={plano} nUsuarios={nUsuarios} anual={anual} colors={colors} />
        </div>
      )}

      {/* CTAs */}
      <div style={{ marginTop: t.space[5], display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
        {sobConsulta ? (
          <Button variant="secondary" block size="lg" loading={comprando} onClick={onComprar}>
            Falar com vendas
          </Button>
        ) : (
          <>
            <Button
              variant={plano.popular ? 'primary' : 'secondary'}
              block
              size="lg"
              loading={comprando}
              icon={plano.popular ? <Sparkles size={15} /> : undefined}
              onClick={onComprar}
            >
              Comprar agora
            </Button>
            <Button variant="ghost" block size="md">
              Testar {plano.trialDias} dias grátis
            </Button>
          </>
        )}
      </div>

      <div style={{ margin: `${t.space[5]}px 0` }}>
        <Divider />
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: t.space[2],
        }}
      >
        {plano.features.map((feature) => (
          <li
            key={feature.label}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: t.space[2],
              fontSize: t.font.size.base,
              color: colors.textPrimary,
              fontFamily: t.font.family.sans,
            }}
          >
            <Check
              size={14}
              color={t.color.brand[600]}
              strokeWidth={2.5}
              style={{ flexShrink: 0, marginTop: 1 }}
              aria-hidden="true"
            />
            {feature.label}
          </li>
        ))}
      </ul>

      {/* Detail link (Microsoft "Detalhes") */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: t.space[5],
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button variant="ghost" size="md" onClick={onVerDetalhes} icon={<ChevronRight size={14} />}>
          Ver detalhes e comparar
        </Button>
      </div>

      {/* GBMode glow for popular plan */}
      {isGbMode && plano.popular && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: t.radius.xl,
            boxShadow: t.glow.brandLg,
            pointerEvents: 'none',
          }}
        />
      )}
    </Card>
  )
}

// ─── Plan detail view (Microsoft-style upsell benchmark) ────────────────────────

interface PlanoDetalheProps {
  plano: Plano
  nUsuarios: number
  setNUsuarios: (n: number) => void
  anual: boolean
  setAnual: (v: boolean) => void
  colors: ReturnType<typeof useTheme>['colors']
  isGbMode: boolean
  comprando: boolean
  onComprar: () => void
  onVoltar: () => void
}

function PlanoDetalhe({
  plano, nUsuarios, setNUsuarios, anual, setAnual, colors, isGbMode, comprando, onComprar, onVoltar,
}: PlanoDetalheProps) {
  const sobConsulta = plano.precoUsuarioMesAnual === null
  const ehAtual = plano.id === PLANO_ATUAL_ID

  // Benchmark de upsell: atual + selecionado + faixa acima.
  const colunasIds = benchmarkColunasIds(PLANO_ATUAL_ID, plano.id)
  const acimaIdx = Math.max(TIER_ORDER.indexOf(PLANO_ATUAL_ID), TIER_ORDER.indexOf(plano.id)) + 1
  const acimaId: PlanoId | undefined = TIER_ORDER[acimaIdx]

  const colunas: ColunaComp[] = colunasIds.map((id) => {
    if (id === acimaId) return { planoId: id, badge: { label: 'Recomendado ↑', variant: 'purple' }, destacar: true }
    if (id === plano.id && id === PLANO_ATUAL_ID) return { planoId: id, badge: { label: 'Atual · Selecionado', variant: 'success' } }
    if (id === plano.id) return { planoId: id, badge: { label: 'Selecionado', variant: 'success' } }
    if (id === PLANO_ATUAL_ID) return { planoId: id, badge: { label: 'Seu plano atual', variant: 'info' } }
    return { planoId: id }
  })

  const planoAcima = acimaId ? planoPorId(acimaId) : null

  return (
    <>
      <FormPageHeader
        title={`Plano ${plano.nome}`}
        subtitle={plano.subtitulo}
        onBack={onVoltar}
        backLabel="Voltar aos planos"
      />

      <BarraControles
        nUsuarios={nUsuarios}
        setNUsuarios={setNUsuarios}
        anual={anual}
        setAnual={setAnual}
        colors={colors}
      />

      {/* Hero — selected plan */}
      <Card
        radius="xl"
        shadow="lg"
        padding={t.space[6]}
        style={{
          position: 'relative',
          marginTop: t.space[6],
          border: plano.popular ? `1.5px solid ${t.color.brand[600]}` : `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: t.space[6],
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: identity + price */}
          <div style={{ flex: '1 1 240px', minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: t.space[2] }}>
              <Heading level={2} size="3xl" weight="extrabold">{plano.nome}</Heading>
              {plano.destaque && <Badge label={plano.destaque} variant="success" />}
              {ehAtual && <Badge label="Seu plano atual" variant="info" />}
            </div>
            <div style={{ marginTop: t.space[4] }}>
              <BlocoPreco plano={plano} anual={anual} colors={colors} />
            </div>
          </div>

          {/* Right: total + CTAs */}
          <div style={{ flex: '0 1 320px', minWidth: 260, display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
            {!sobConsulta && <BlocoTotal plano={plano} nUsuarios={nUsuarios} anual={anual} colors={colors} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
              {sobConsulta ? (
                <Button variant="secondary" block size="lg" loading={comprando} onClick={onComprar}>
                  Falar com vendas
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    block
                    size="lg"
                    loading={comprando}
                    icon={<Sparkles size={15} />}
                    onClick={onComprar}
                  >
                    Comprar agora
                  </Button>
                  <Button variant="ghost" block size="md">
                    Testar {plano.trialDias} dias grátis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isGbMode && plano.popular && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: t.radius.xl,
              boxShadow: t.glow.brandLg,
              pointerEvents: 'none',
            }}
          />
        )}
      </Card>

      {/* Upsell nudge */}
      {planoAcima && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[3],
            marginTop: t.space[6],
            padding: `${t.space[3]}px ${t.space[4]}px`,
            borderRadius: t.radius.lg,
            background: colors.brandBg,
            border: `1px solid ${t.color.brand[200]}`,
          }}
        >
          <ArrowUpRight size={18} color={t.color.brand[600]} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: t.font.size.base,
              color: colors.textSecondary,
              fontFamily: t.font.family.sans,
              lineHeight: t.font.lineHeight.snug,
            }}
          >
            Quer ir além? O plano <strong style={{ color: colors.brand }}>{planoAcima.nome}</strong>{' '}
            desbloqueia ainda mais recursos para a sua operação crescer.
          </span>
        </div>
      )}

      {/* Benchmark comparison */}
      <TabelaComparacao
        titulo="Compare e escolha o ideal para crescer"
        colunas={colunas}
        colors={colors}
      />

      <div style={{ marginTop: t.space[8] }}>
        <Divider />
        <p style={notaRodapeStyle(colors)}>
          Comparativo entre o seu plano atual, o plano selecionado e a faixa recomendada.
          Valores em BRL por usuário/mês, sem impostos.
        </p>
      </div>
    </>
  )
}

// ─── Add-ons section ──────────────────────────────────────────────────────────

interface SecaoAddOnsProps {
  nUsuarios: number
  colors: ReturnType<typeof useTheme>['colors']
}

function SecaoAddOns({ nUsuarios, colors }: SecaoAddOnsProps) {
  const planoNomes: Record<PlanoId, string> = {
    essencial: 'Essencial',
    profissional: 'Profissional',
    enterprise: 'Enterprise',
  }

  return (
    <div style={{ marginTop: t.space[12] }}>
      <Heading level={2} size="2xl" weight="bold">
        Expanda com módulos opcionais
      </Heading>
      <p
        style={{
          margin: `${t.space[2]}px 0 0`,
          fontSize: t.font.size.base,
          color: colors.textMuted,
          fontFamily: t.font.family.sans,
        }}
      >
        Todos os add-ons são cobrados por usuário/mês e somados à fatura do plano base.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: t.space[4],
          marginTop: t.space[6],
        }}
      >
        {addOns.map((addon) => {
          const totalMes = nUsuarios * addon.precoUsuarioMesAnual

          return (
            <Card
              key={addon.id}
              radius="xl"
              shadow="sm"
              padding={t.space[5]}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: t.space[3],
                border: `1px solid ${colors.border}`,
              }}
            >
              <Heading level={3} size="lg" weight="semibold">{addon.nome}</Heading>
              <p
                style={{
                  margin: 0,
                  fontSize: t.font.size.sm,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                  lineHeight: t.font.lineHeight.snug,
                  flex: 1,
                }}
              >
                {addon.descricao}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1] }}>
                <span
                  style={{
                    fontSize: t.font.size['2xl'],
                    fontWeight: t.font.weight.bold,
                    fontFamily: t.font.family.sans,
                    color: colors.textPrimary,
                  }}
                >
                  {formatBRL(addon.precoUsuarioMesAnual)}
                </span>
                <span style={{ fontSize: t.font.size.xs, color: colors.textMuted, fontFamily: t.font.family.sans }}>
                  /usuário/mês
                </span>
              </div>

              <span style={{ fontSize: t.font.size.xs, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
                Total para {nUsuarios} usuários: {formatBRL(totalMes)}/mês
              </span>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[1] }}>
                {addon.disponivelEm.map((planoId) => (
                  <Tag key={planoId} label={planoNomes[planoId]} variant="brand" />
                ))}
              </div>

              <div style={{ marginTop: t.space[1] }}>
                <Button variant="secondary" block size="sm">
                  Saiba mais
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Comparison table (parameterized by columns) ────────────────────────────────

interface ColunaComp {
  planoId: PlanoId
  badge?: { label: string; variant: BadgeVariant }
  destacar?: boolean
}

interface TabelaComparacaoProps {
  titulo: string
  colunas: ColunaComp[]
  colors: ReturnType<typeof useTheme>['colors']
}

function CelulaComparacao({
  value,
  colors,
}: {
  value: boolean | string
  colors: ReturnType<typeof useTheme>['colors']
}) {
  if (value === true) {
    return <Check size={14} color={t.color.brand[600]} strokeWidth={2.5} aria-label="Incluído" />
  }
  if (value === false) {
    return (
      <span
        aria-label="Não incluído"
        style={{ fontSize: t.font.size.lg, color: colors.textMuted, fontFamily: t.font.family.sans, lineHeight: 1 }}
      >
        —
      </span>
    )
  }
  if (value === 'Add-on') {
    return <Tag label="Add-on" variant="brand" />
  }
  return (
    <span style={{ fontSize: t.font.size.sm, color: colors.textSecondary, fontFamily: t.font.family.sans }}>
      {value}
    </span>
  )
}

function TabelaComparacao({ titulo, colunas, colors }: TabelaComparacaoProps) {
  const gridCols = `2fr repeat(${colunas.length}, 1fr)`

  const headerCell: React.CSSProperties = {
    padding: `${t.space[3]}px ${t.space[4]}px`,
    fontSize: t.font.size.sm,
    fontWeight: t.font.weight.semibold,
    fontFamily: t.font.family.sans,
    color: colors.textSecondary,
  }

  const featureCell: React.CSSProperties = {
    padding: `${t.space[3]}px ${t.space[4]}px`,
    fontSize: t.font.size.base,
    color: colors.textSecondary,
    fontFamily: t.font.family.sans,
  }

  return (
    <div style={{ marginTop: t.space[12] }}>
      <Heading level={2} size="2xl" weight="bold" style={{ marginBottom: t.space[6] }}>
        {titulo}
      </Heading>

      <div style={{ overflowX: 'auto' }}>
        <Card radius="xl" shadow="md" padding={0} style={{ overflow: 'hidden', minWidth: 560 }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              background: colors.surfaceSubtle,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={headerCell}>Recurso</div>
            {colunas.map((col) => {
              const plano = planoPorId(col.planoId)
              return (
                <div
                  key={col.planoId}
                  style={{
                    ...headerCell,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: t.space[1],
                    textAlign: 'center',
                    borderLeft: `1px solid ${colors.border}`,
                    background: col.destacar ? colors.brandBg : undefined,
                    color: col.destacar ? colors.brand : colors.textPrimary,
                  }}
                >
                  {plano.nome}
                  {col.badge && <Badge label={col.badge.label} variant={col.badge.variant} />}
                </div>
              )
            })}
          </div>

          {/* Categories */}
          {tabelaComparativa.map((cat) => (
            <div key={cat.id}>
              <div
                style={{
                  padding: `${t.space[2]}px ${t.space[4]}px`,
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.semibold,
                  fontFamily: t.font.family.sans,
                  color: t.color.brand[600],
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: colors.surfaceSubtle,
                  borderTop: `2px solid ${t.color.brand[600]}`,
                }}
              >
                {cat.titulo}
              </div>

              {cat.linhas.map((linha: LinhaComparacao) => (
                <div
                  key={linha.feature}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: gridCols,
                    borderTop: `1px solid ${colors.borderSubtle}`,
                  }}
                >
                  <div style={featureCell}>{linha.feature}</div>
                  {colunas.map((col) => (
                    <div
                      key={col.planoId}
                      style={{
                        padding: `${t.space[3]}px ${t.space[4]}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: `1px solid ${colors.borderSubtle}`,
                        background: col.destacar ? colors.brandBg : undefined,
                      }}
                    >
                      <CelulaComparacao value={linha[col.planoId]} colors={colors} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
