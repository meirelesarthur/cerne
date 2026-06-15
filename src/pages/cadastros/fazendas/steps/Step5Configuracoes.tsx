import React from 'react'
import { StepHeader } from '../../../../components/ui/StepHeader'
import { FormField } from '../../../../components/ui/FormField'
import { Checkbox } from '../../../../components/ui/Checkbox'
import { t } from '../../../../design/tokens'
import { useTheme } from '../../../../context/ThemeContext'
import { mockCentrosCusto } from '../fazendas.mock'
import type { FazendaFormData } from '../fazendas.types'

interface Step5Props {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
  onCentrosCustoChange: (ids: string[]) => void
}

export function Step5Configuracoes({ data, errors, onChange, onCentrosCustoChange }: Step5Props) {
  const { colors, isGbMode } = useTheme()
  const selected = data.centrosCusto
  const allIds = mockCentrosCusto.map((c) => c.id)
  const allSelected = allIds.every((id) => selected.includes(id))
  const someSelected = selected.length > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      onCentrosCustoChange([])
    } else {
      onCentrosCustoChange(allIds)
    }
  }

  const toggleRow = (id: string) => {
    if (selected.includes(id)) {
      onCentrosCustoChange(selected.filter((s) => s !== id))
    } else {
      onCentrosCustoChange([...selected, id])
    }
  }

  return (
    <div>
      <StepHeader
        title="Centros de Custo e Configurações"
        subtitle="Vincule a fazenda aos centros de custo e adicione observações relevantes"
      />
      {/* Observações */}
      <div style={{ position: 'relative' }}>
        <FormField
          label="Observações"
          multiline
          rows={4}
          value={data.observacao}
          onChange={(e) => onChange('observacao', e.target.value)}
          maxLength={1000}
          placeholder="Informações adicionais sobre a fazenda..."
        />
        <span
          style={{
            position: 'absolute',
            bottom: 8,
            right: 10,
            fontSize: t.font.size.xs,
            color: colors.textMuted,
            fontFamily: t.font.family.sans,
            pointerEvents: 'none',
          }}
        >
          {data.observacao.length}/1000
        </span>
      </div>

      {/* Centro de Custo */}
      <div style={{ marginTop: 24 }}>
        {selected.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span
              style={{
                fontSize: 12,
                color: '#d97706',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Nenhum centro de custo selecionado. Selecione ao menos um para continuar.
            </span>
          </div>
        )}

        {/* Grid de centros de custo — 5 colunas: checkbox · código · classe · condição · descrição */}
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: t.radius.DEFAULT,
            overflow: 'hidden',
          }}
        >
          {/* Cabeçalho */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 1fr 1fr 2fr',
              background: isGbMode ? 'rgba(255,255,255,0.03)' : t.color.neutral[50],
              borderBottom: `1px solid ${colors.border}`,
              alignItems: 'center',
            }}
          >
            <div style={{ padding: `${t.space[2]}px ${t.space[3]}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                aria-label="Selecionar todos os centros de custo"
              />
            </div>
            {(['Código', 'Classe', 'Condição', 'Descrição'] as const).map((h) => (
              <div
                key={h}
                style={{
                  padding: `${t.space[2]}px ${t.space[2] + t.space[1] / 2}px`,
                  fontSize: t.font.size.xs,
                  fontWeight: t.font.weight.semibold,
                  color: colors.textSecondary,
                  fontFamily: t.font.family.sans,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Linhas */}
          {mockCentrosCusto.map((cc) => {
            const isSelected = selected.includes(cc.id)
            return (
              <div
                key={cc.id}
                role="row"
                aria-selected={isSelected}
                onClick={() => toggleRow(cc.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 1fr 1fr 2fr',
                  alignItems: 'center',
                  height: t.size.tableRow,
                  background: isSelected
                    ? t.color.row.selected
                    : colors.surfaceBg,
                  borderBottom: `1px solid ${colors.borderSubtle}`,
                  cursor: 'pointer',
                  transition: `background ${t.transition.fast}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = isGbMode ? t.color.row.hoverGb : t.color.row.hover
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = isSelected ? t.color.row.selected : colors.surfaceBg
                }}
              >
                <div
                  style={{ padding: `0 ${t.space[3]}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleRow(cc.id)}
                    aria-label={`Selecionar ${cc.codigo}`}
                  />
                </div>
                <div
                  style={{
                    padding: `0 ${t.space[2] + t.space[1] / 2}px`,
                    fontSize: t.font.size.sm,
                    fontFamily: t.font.family.sans,
                    color: colors.textPrimary,
                    fontWeight: t.font.weight.medium,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cc.codigo}
                </div>
                <div
                  style={{
                    padding: `0 ${t.space[2] + t.space[1] / 2}px`,
                    fontSize: t.font.size.sm,
                    fontFamily: t.font.family.sans,
                    color: colors.textSecondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cc.classe}
                </div>
                <div
                  style={{
                    padding: `0 ${t.space[2] + t.space[1] / 2}px`,
                    fontSize: t.font.size.sm,
                    fontFamily: t.font.family.sans,
                    color: colors.textSecondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cc.condicao}
                </div>
                <div
                  style={{
                    padding: `0 ${t.space[2] + t.space[1] / 2}px`,
                    fontSize: t.font.size.sm,
                    fontFamily: t.font.family.sans,
                    color: colors.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cc.descricao}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
