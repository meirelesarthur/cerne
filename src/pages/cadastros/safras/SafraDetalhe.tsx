import React from 'react'
import { ArrowLeft, Pencil, Calendar, Users, TrendingUp, Clock } from 'lucide-react'
import { Button }     from '../../../components/ui/Button'
import { Badge }      from '../../../components/ui/Badge'
import { FormPageHeader } from '../../../components/ui/FormPageHeader'
import { PageContainer } from '../../../components/ui/PageContainer'
import { PageCard }       from '../../../components/ui/PageCard'
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

// ─── Helper: campo de leitura ─────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  const { colors } = useTheme()
  return (
    <div>
      <div style={{
        fontSize: 10,
        fontWeight: t.font.weight.semibold,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 4,
        fontFamily: t.font.family.sans,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: t.font.size.base,
        color: colors.textPrimary,
        fontFamily: t.font.family.sans,
        fontWeight: t.font.weight.normal,
        minHeight: 20,
      }}>
        {value || <span style={{ color: colors.border }}>—</span>}
      </div>
    </div>
  )
}

function mesLabel(mes: string): string {
  return MONTH_FULL[MES_OPTS.findIndex(m => m.value === mes)] ?? mes
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SafraDetalhe({ safra, onBack, onEdit }: SafraDetalheProps) {
  const { colors } = useTheme()

  const isAtiva = safra.ativo === 'sim'

  const rebLabels: Record<string, string> = {
    individual: 'Individual',
    coletivo:   'Coletivo',
    nenhum:     'Nenhum',
  }
  const evoLabels: Record<string, string> = {
    habilitado:   'Habilitado',
    desabilitado: 'Desabilitado',
  }

  // Stats strip
  const stats = [
    {
      label: 'Semanas',
      value: `${safra.weeks.length} semanas`,
      icon: <Calendar size={16} color="#059669" />,
      iconBg: '#d1fae5',
    },
    {
      label: 'Controle Rebanho',
      value: rebLabels[safra.reb],
      icon: <Users size={16} color="#2563eb" />,
      iconBg: '#dbeafe',
    },
    {
      label: 'Evolução Rebanho',
      value: evoLabels[safra.evo],
      icon: <TrendingUp size={16} color="#7c3aed" />,
      iconBg: '#ede9fe',
    },
    {
      label: 'Duração',
      value: (() => {
        const ini = new Date(safra.ini + 'T00:00:00')
        const fim = new Date(safra.fim + 'T00:00:00')
        const months = Math.round((fim.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24 * 30))
        return `~${months} meses`
      })(),
      icon: <Clock size={16} color="#ea580c" />,
      iconBg: '#ffedd5',
    },
  ]

  return (
    <PageContainer style={{ paddingBottom: 0 }}>
      <PageCard
        footer={
          <>
            <Button variant="secondary" icon={<ArrowLeft size={14} />} onClick={onBack}>
              Voltar
            </Button>
            <Button variant="primary" icon={<Pencil size={14} />} onClick={onEdit}>
              Editar
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <FormPageHeader
            title={safra.desc}
            subtitle={`${fmtYMDtoDMY(safra.ini)} — ${fmtYMDtoDMY(safra.fim)} · Rebanho: ${rebLabels[safra.reb]} · Evolução: ${evoLabels[safra.evo]}`}
            onBack={onBack}
            paddingTop={t.space[4]}
            actions={
              <>
                <Badge label={isAtiva ? 'Ativa' : 'Inativa'} variant={isAtiva ? 'success' : 'neutral'} />
                <Button variant="primary" size="sm" icon={<Pencil size={13} />} onClick={onEdit}>
                  Editar
                </Button>
              </>
            }
          />

          {/* ── Stats strip ───────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {stats.map(s => (
              <div
                key={s.label}
                style={{
                  background: colors.surfaceBg,
                  borderRadius: t.radius.lg,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: t.font.weight.semibold, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.semibold, color: colors.textPrimary }}>
                    {s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Dados gerais ─────────────────────────────────────────────────── */}
          <div style={{ background: colors.surfaceBg, borderRadius: t.radius.xl, padding: 24, transition: 'background 0.2s' }}>
            <div style={{
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `1px solid ${colors.borderSubtle}`,
              fontFamily: t.font.family.sans,
            }}>
              Dados Gerais
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 28px' }}>
              <InfoField label="Data de Início" value={fmtYMDtoDMY(safra.ini)} />
              <InfoField label="Data de Fim"    value={fmtYMDtoDMY(safra.fim)} />
              <InfoField label="1º Semestre"    value={mesLabel(safra.s1)} />
              <InfoField label="2º Semestre"    value={mesLabel(safra.s2)} />
            </div>
          </div>

          {/* ── Canvas de semanas (read-only) ─────────────────────────────────── */}
          <div style={{ background: colors.surfaceBg, borderRadius: t.radius.xl, padding: 24, transition: 'background 0.2s' }}>
            <div style={{
              fontSize: t.font.size.xs,
              fontWeight: t.font.weight.semibold,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `1px solid ${colors.borderSubtle}`,
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
