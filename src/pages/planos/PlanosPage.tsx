import React, { useEffect, useState } from 'react'
import { Check, Minus, Plus, Sparkles } from 'lucide-react'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
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
  type PlanoId, type LinhaComparacao,
} from './planosData'

const N_MIN = 1
const N_MAX = 200
const COMP_COLS = '2fr repeat(3, 1fr)'

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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlanosPage() {
  const { colors, isGbMode } = useTheme()
  const [nUsuarios, setNUsuarios] = useState(5)
  const [anual, setAnual] = useState(true)
  const [loading, setLoading] = useState(true)
  const [comprando, setComprando] = useState<PlanoId | null>(null)

  useEffect(() => {
    const timerId = window.setTimeout(() => setLoading(false), 450)
    return () => window.clearTimeout(timerId)
  }, [])

  const handleComprar = (planoId: PlanoId) => {
    setComprando(planoId)
    window.setTimeout(() => setComprando(null), 1600)
  }

  return (
    <PageContainer>
      <style>{reducedMotionCss}</style>

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
                comprando={comprando === plano.id}
                onComprar={() => handleComprar(plano.id)}
              />
            ))}
          </div>

          <SecaoAddOns nUsuarios={nUsuarios} colors={colors} />
          <TabelaComparativa colors={colors} />
        </>
      )}

      <div style={{ marginTop: t.space[10] }}>
        <Divider />
        <p
          style={{
            marginTop: t.space[4],
            textAlign: 'center',
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            lineHeight: t.font.lineHeight.relaxed,
          }}
        >
          ¹ Valores em reais (BRL), sem impostos incluídos. &nbsp;·&nbsp;
          ² Licença por usuário ativo ao mês. &nbsp;·&nbsp;
          ³ Cobrança anual faturada de uma só vez; mensal renovada todo mês. &nbsp;·&nbsp;
          ⁴ Usuários podem ser adicionados ou removidos a qualquer momento — a fatura é ajustada proporcionalmente.
        </p>
      </div>
    </PageContainer>
  )
}

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

// ─── Plan card ────────────────────────────────────────────────────────────────

interface PlanoCardProps {
  plano: typeof planos[0]
  nUsuarios: number
  anual: boolean
  colors: ReturnType<typeof useTheme>['colors']
  isGbMode: boolean
  comprando: boolean
  onComprar: () => void
}

function PlanoCard({ plano, nUsuarios, anual, colors, isGbMode, comprando, onComprar }: PlanoCardProps) {
  const sobConsulta = plano.precoUsuarioMesAnual === null
  const preco = anual ? plano.precoUsuarioMesAnual : plano.precoUsuarioMesMensal
  const totalMes = preco ? nUsuarios * preco : 0
  const totalAno = totalMes * 12

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
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
        <Heading level={3} size="2xl" weight="bold">{plano.nome}</Heading>
        {plano.destaque && <Badge label={plano.destaque} variant="success" />}
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
        {sobConsulta ? (
          <Heading level={4} size="2xl" weight="bold" tone="secondary">
            Sob consulta
          </Heading>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1] }}>
              <Heading level={4} size="4xl" weight="extrabold">
                {formatBRL(preco ?? 0)}
              </Heading>
              <span
                style={{
                  fontSize: t.font.size.sm,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                }}
              >
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
                Cobrança anual — {formatBRL((preco ?? 0) * 12)}/usuário/ano
              </span>
            )}
          </>
        )}
      </div>

      {/* Live total */}
      {!sobConsulta && (
        <div
          style={{
            marginTop: t.space[4],
            background: colors.brandBg,
            borderRadius: t.radius.lg,
            padding: `${t.space[3]}px ${t.space[4]}px`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: t.font.size.sm,
                color: colors.textSecondary,
                fontFamily: t.font.family.sans,
              }}
            >
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
              <span
                style={{
                  fontSize: t.font.size.sm,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                }}
              >
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
              {formatBRL(totalAno)}/ano
            </span>
          )}
        </div>
      )}

      {/* CTAs */}
      <div
        style={{
          marginTop: t.space[5],
          display: 'flex',
          flexDirection: 'column',
          gap: t.space[2],
        }}
      >
        {sobConsulta ? (
          <>
            <Button variant="secondary" block size="lg" loading={comprando} onClick={onComprar}>
              Falar com vendas
            </Button>
            <Button variant="ghost" block size="md">
              Ver todos os recursos
            </Button>
          </>
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
                <span
                  style={{
                    fontSize: t.font.size.xs,
                    color: colors.textMuted,
                    fontFamily: t.font.family.sans,
                  }}
                >
                  /usuário/mês
                </span>
              </div>

              <span
                style={{
                  fontSize: t.font.size.xs,
                  color: colors.textSecondary,
                  fontFamily: t.font.family.sans,
                }}
              >
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

// ─── Comparison table ─────────────────────────────────────────────────────────

interface TabelaComparativaProps {
  colors: ReturnType<typeof useTheme>['colors']
}

const PLANO_KEYS = ['essencial', 'profissional', 'enterprise'] as const

function CelulaComparacao({
  value,
  colors,
}: {
  value: boolean | string
  colors: ReturnType<typeof useTheme>['colors']
}) {
  if (value === true) {
    return (
      <Check size={14} color={t.color.brand[600]} strokeWidth={2.5} aria-label="Incluído" />
    )
  }
  if (value === false) {
    return (
      <span
        aria-label="Não incluído"
        style={{
          fontSize: t.font.size.lg,
          color: colors.textMuted,
          fontFamily: t.font.family.sans,
          lineHeight: 1,
        }}
      >
        —
      </span>
    )
  }
  if (value === 'Add-on') {
    return <Tag label="Add-on" variant="brand" />
  }
  return (
    <span
      style={{
        fontSize: t.font.size.sm,
        color: colors.textSecondary,
        fontFamily: t.font.family.sans,
      }}
    >
      {value}
    </span>
  )
}

function TabelaComparativa({ colors }: TabelaComparativaProps) {
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

  const valueCell: React.CSSProperties = {
    padding: `${t.space[3]}px ${t.space[4]}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: `1px solid ${colors.borderSubtle}`,
  }

  return (
    <div style={{ marginTop: t.space[12] }}>
      <Heading level={2} size="2xl" weight="bold" style={{ marginBottom: t.space[6] }}>
        Comparativo de recursos
      </Heading>

      <div style={{ overflowX: 'auto' }}>
        <Card radius="xl" shadow="md" padding={0} style={{ overflow: 'hidden', minWidth: 600 }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: COMP_COLS,
              background: colors.surfaceSubtle,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={headerCell}>Recurso</div>
            {planos.map((p) => (
              <div
                key={p.id}
                style={{
                  ...headerCell,
                  textAlign: 'center',
                  borderLeft: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: t.space[2],
                }}
              >
                {p.nome}
                {p.popular && <Badge label="Popular" variant="success" />}
              </div>
            ))}
          </div>

          {/* Categories */}
          {tabelaComparativa.map((cat) => (
            <div key={cat.id}>
              {/* Category header */}
              <div
                style={{
                  padding: `${t.space[2]}px ${t.space[4]}px`,
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.semibold,
                  fontFamily: t.font.family.sans,
                  color: t.color.brand[600],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  background: colors.surfaceSubtle,
                  borderTop: `2px solid ${t.color.brand[600]}`,
                }}
              >
                {cat.titulo}
              </div>

              {/* Feature rows */}
              {cat.linhas.map((linha: LinhaComparacao) => (
                <div
                  key={linha.feature}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: COMP_COLS,
                    borderTop: `1px solid ${colors.borderSubtle}`,
                  }}
                >
                  <div style={featureCell}>{linha.feature}</div>
                  {PLANO_KEYS.map((key) => (
                    <div key={key} style={valueCell}>
                      <CelulaComparacao value={linha[key]} colors={colors} />
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
