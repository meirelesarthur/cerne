import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { Button }     from '../../../components/ui/Button'
import { Badge }      from '../../../components/ui/Badge'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
import { DetailGrid } from '../../../components/ui/DetailGrid'
import { VDivider }   from '../../../components/ui/SectionDividers'
import { t }          from '../../../design/tokens'
import { useTheme }   from '../../../context/ThemeContext'
import { WeekCanvas } from './WeekCanvas'
import {
  fmtYMDtoDMY, MONTH_FULL, MES_OPTS,
  type Safra,
} from './safras.types'

// ─── Props ───────────────────────────────────────────────────────────────────

interface SafraDetalheProps {
  safra:  Safra
  onBack: () => void
  onEdit: () => void
}

// ─── Helper: rótulo de mês ────────────────────────────────────────────────────

function mesLabel(mes: string): string {
  return MONTH_FULL[MES_OPTS.findIndex(m => m.value === mes)] ?? mes
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SafraDetalhe({ safra, onBack, onEdit }: SafraDetalheProps) {
  const { colors } = useTheme()

  const isAtiva = safra.ativo === 'sim'
  const bc = colors.border.default as string

  const rebLabels: Record<string, string> = {
    individual: 'Individual',
    coletivo:   'Coletivo',
    nenhum:     'Nenhum',
  }
  const evoLabels: Record<string, string> = {
    habilitado:   'Habilitado',
    desabilitado: 'Desabilitado',
  }

  // Stats strip — mesmo padrão visual dos dashboards (Financeiro/Pecuária):
  // card único com divisórias finas (VDivider) em vez de cartões com ícone.
  const stats = [
    {
      label: 'Semanas',
      value: `${safra.weeks.length} semanas`,
    },
    {
      label: 'Controle Rebanho',
      value: rebLabels[safra.reb],
    },
    {
      label: 'Evolução Rebanho',
      value: evoLabels[safra.evo],
    },
    {
      label: 'Duração',
      value: (() => {
        const ini = new Date(safra.ini + 'T00:00:00')
        const fim = new Date(safra.fim + 'T00:00:00')
        const months = Math.round((fim.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24 * 30))
        return `~${months} meses`
      })(),
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" icon={<Icon name="arrow-left" size={14} />} onClick={onBack}>
              Voltar
            </Button>
            <Button variant="primary" icon={<Icon name="edit" size={14} />} onClick={onEdit}>
              Editar
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <FormPageHeader
            title="Visualizar Safra"
            subtitle={safra.desc}
            onBack={onBack}
            paddingTop={t.space[4]}
            actions={
              <>
                <Badge label={isAtiva ? 'Ativa' : 'Inativa'} variant={isAtiva ? 'success' : 'neutral'} />
                <Button variant="primary" size="sm" icon={<Icon name="edit" size={13} />} onClick={onEdit}>
                  Editar
                </Button>
              </>
            }
          />

          {/* ── Stats strip ───────────────────────────────────────────────────── */}
          <div
            style={{
              background: colors.bg.surface,
              borderRadius: t.radius['2xl'],
              border: `1px solid ${bc}`,
              overflow: 'hidden',
              transition: `background ${t.animation.duration.normal}`,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {stats.flatMap((s, i) => [
                i > 0 ? <VDivider key={`d${i}`} color={bc} /> : null,
                <div key={s.label} style={{ flex: '1 1 180px', padding: `${t.space[4]}px ${t.space[5]}px` }}>
                  <div style={{ fontSize: t.font.size.xs, color: colors.fg.subtle, fontFamily: t.font.family.sans, marginBottom: t.space[1] }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: t.font.size['2xl'], fontWeight: t.font.weight.bold, color: colors.fg.default, lineHeight: 1.1 }}>
                    {s.value}
                  </div>
                </div>,
              ])}
            </div>
          </div>

          {/* ── Dados gerais ─────────────────────────────────────────────────── */}
          <div style={{ background: colors.bg.surface, borderRadius: t.radius.xl, padding: 24, transition: `background ${t.animation.duration.normal}` }}>
            <div style={{
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              color: colors.fg.subtle,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `1px solid ${colors.border.subtle}`,
              fontFamily: t.font.family.sans,
            }}>
              Dados Gerais
            </div>
            <DetailGrid columns={4} items={[
              { label: 'Data de Início', value: fmtYMDtoDMY(safra.ini) },
              { label: 'Data de Fim',    value: fmtYMDtoDMY(safra.fim) },
              { label: '1º Semestre',    value: mesLabel(safra.s1) },
              { label: '2º Semestre',    value: mesLabel(safra.s2) },
            ]} />
          </div>

          {/* ── Canvas de semanas (read-only) ─────────────────────────────────── */}
          <div style={{ background: colors.bg.surface, borderRadius: t.radius.xl, padding: 24, transition: `background ${t.animation.duration.normal}` }}>
            <div style={{
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              color: colors.fg.subtle,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `1px solid ${colors.border.subtle}`,
              fontFamily: t.font.family.sans,
            }}>
              Código Visual de Semanas
            </div>
            <WeekCanvas
              weeks={safra.weeks}
              iniLabel={fmtYMDtoDMY(safra.ini)}
              fimLabel={fmtYMDtoDMY(safra.fim)}
              editable={false}
            />
          </div>

        </div>
      </PageCard>
    </PageContainer>
  )
}
