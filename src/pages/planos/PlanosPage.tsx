import React, { useEffect, useMemo, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { PageContainer } from '../../components/ui/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Heading } from '../../components/ui/Heading'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Tag } from '../../components/ui/Tag'
import { Divider } from '../../components/ui/Divider'
import { ToggleSwitch } from '../../components/ui/ToggleSwitch'
import { Skeleton } from '../../components/ui/Skeleton'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import { planos, formatBRL, type Plano } from './planosData'

/** Meses cobrados no plano anual (12 - 2 grátis). */
const MESES_ANUAL = 10

export default function PlanosPage() {
  const { colors, isGbMode } = useTheme()
  const [anual, setAnual] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assinando, setAssinando] = useState<Plano['id'] | null>(null)
  // add-ons marcados, por plano: { [planoId]: Set<addOnId> }
  const [selecionados, setSelecionados] = useState<Record<string, Set<string>>>({})

  // Loading inicial simulado (Skeleton) — respeita o padrão de estados da UI.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450)
    return () => window.clearTimeout(timer)
  }, [])

  const toggleAddOn = (planoId: string, addOnId: string) => {
    setSelecionados((prev) => {
      const atual = new Set(prev[planoId] ?? [])
      atual.has(addOnId) ? atual.delete(addOnId) : atual.add(addOnId)
      return { ...prev, [planoId]: atual }
    })
  }

  const handleAssinar = (planoId: Plano['id']) => {
    setAssinando(planoId)
    window.setTimeout(() => setAssinando(null), 1400)
  }

  return (
    <PageContainer>
      <style>{reducedMotionCss}</style>

      <PageHeader
        title="Planos de Contratação"
        description="Escolha o plano ideal para a sua operação agrícola"
        actions={
          <ToggleSwitch
            checked={anual}
            onChange={setAnual}
            label="Cobrança anual · 2 meses grátis"
          />
        }
      />

      {loading ? (
        <PlanosSkeleton />
      ) : (
        <div style={gridStyle}>
          {planos.map((plano) => (
            <PlanoCard
              key={plano.id}
              plano={plano}
              anual={anual}
              colors={colors}
              isGbMode={isGbMode}
              marcados={selecionados[plano.id] ?? new Set()}
              onToggleAddOn={(addOnId) => toggleAddOn(plano.id, addOnId)}
              onAssinar={() => handleAssinar(plano.id)}
              carregandoCta={assinando === plano.id}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: t.space[8] }}>
        <Divider label="Todos os planos incluem atualizações e backups automáticos" />
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
          Valores em reais (BRL), sem impostos. A cobrança anual é faturada de uma só vez.
          Você pode alterar ou cancelar seu plano a qualquer momento.
        </p>
      </div>
    </PageContainer>
  )
}

// ─── Card de plano ────────────────────────────────────────────────────────────

interface PlanoCardProps {
  plano: Plano
  anual: boolean
  colors: ReturnType<typeof useTheme>['colors']
  isGbMode: boolean
  marcados: Set<string>
  onToggleAddOn: (addOnId: string) => void
  onAssinar: () => void
  carregandoCta: boolean
}

function PlanoCard({
  plano,
  anual,
  colors,
  isGbMode,
  marcados,
  onToggleAddOn,
  onAssinar,
  carregandoCta,
}: PlanoCardProps) {
  const sobConsulta = plano.precoMensal === null

  // Preço base já considerando o ciclo (mensal exibido sempre por mês).
  const precoBaseMensal = plano.precoMensal ?? 0
  const precoBaseExibido = anual ? precoBaseMensal * MESES_ANUAL : precoBaseMensal

  const totalAddOnsMensal = useMemo(
    () =>
      plano.addOns
        .filter((a) => marcados.has(a.id))
        .reduce((soma, a) => soma + a.precoMensal, 0),
    [plano.addOns, marcados],
  )

  const totalExibido = anual
    ? (precoBaseMensal + totalAddOnsMensal) * MESES_ANUAL
    : precoBaseMensal + totalAddOnsMensal

  const cicloLabel = anual ? '/ano' : '/mês'

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
      {/* Cabeçalho do plano */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2], minHeight: 22 }}>
          <Heading level={3} size="2xl" weight="bold">
            {plano.nome}
          </Heading>
          {plano.destaque && <Badge label={plano.destaque} variant="success" />}
        </div>
        <span
          style={{
            fontSize: t.font.size.sm,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            lineHeight: t.font.lineHeight.snug,
            minHeight: 34,
          }}
        >
          {plano.subtitulo}
        </span>
      </div>

      {/* Preço base */}
      <div style={{ marginTop: t.space[4], minHeight: 52 }}>
        {sobConsulta ? (
          <Heading level={4} size="2xl" weight="bold" tone="secondary">
            Sob consulta
          </Heading>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1] }}>
            <Heading level={4} size="3xl" weight="extrabold">
              {formatBRL(precoBaseExibido)}
            </Heading>
            <span
              style={{
                fontSize: t.font.size.sm,
                color: colors.textMuted,
                fontFamily: t.font.family.sans,
                fontWeight: t.font.weight.medium,
              }}
            >
              {cicloLabel}
            </span>
          </div>
        )}
      </div>

      <div style={{ margin: `${t.space[4]}px 0` }}>
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
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[2],
              fontSize: t.font.size.base,
              color: colors.textPrimary,
              fontFamily: t.font.family.sans,
            }}
          >
            <Check
              size={15}
              color={t.color.brand[600]}
              strokeWidth={2.5}
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>

      {/* Add-ons */}
      <div style={{ margin: `${t.space[5]}px 0 ${t.space[3]}px` }}>
        <Divider label="Add-ons opcionais" />
      </div>

      {sobConsulta ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space[2] }}>
          {plano.addOns.map((addOn) => (
            <Tag key={addOn.id} label={addOn.nome} variant="brand" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
          {plano.addOns.map((addOn) => (
            <Checkbox
              key={addOn.id}
              checked={marcados.has(addOn.id)}
              onChange={() => onToggleAddOn(addOn.id)}
              label={`${addOn.nome} — ${formatBRL(addOn.precoMensal)}/mês`}
            />
          ))}
        </div>
      )}

      {/* Rodapé do card: total ao vivo + CTA */}
      <div style={{ marginTop: 'auto', paddingTop: t.space[5] }}>
        {!sobConsulta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: t.space[3],
            }}
          >
            <span
              style={{
                fontSize: t.font.size.sm,
                color: colors.textMuted,
                fontFamily: t.font.family.sans,
              }}
            >
              Total
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1] }}>
              <Heading level={5} size="xl" weight="bold">
                {formatBRL(totalExibido)}
              </Heading>
              <span
                style={{
                  fontSize: t.font.size.sm,
                  color: colors.textMuted,
                  fontFamily: t.font.family.sans,
                }}
              >
                {cicloLabel}
              </span>
            </div>
          </div>
        )}

        {sobConsulta ? (
          <Button variant="secondary" block size="lg" onClick={onAssinar}>
            Falar com vendas
          </Button>
        ) : (
          <Button
            variant={plano.popular ? 'primary' : 'secondary'}
            block
            size="lg"
            loading={carregandoCta}
            icon={plano.popular ? <Sparkles size={16} /> : undefined}
            onClick={onAssinar}
          >
            Assinar {plano.nome}
          </Button>
        )}
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
  )
}

// ─── Skeleton de carregamento ───────────────────────────────────────────────

function PlanosSkeleton() {
  return (
    <div style={gridStyle}>
      {[0, 1, 2].map((i) => (
        <Card key={i} radius="xl" shadow="md" padding={t.space[6]}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
            <Skeleton width="50%" height={24} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="40%" height={36} />
            <Skeleton width="100%" height={1} />
            {[0, 1, 2, 3, 4].map((j) => (
              <Skeleton key={j} width="90%" height={14} />
            ))}
            <Skeleton width="100%" height={44} />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Estilos compartilhados ─────────────────────────────────────────────────

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
