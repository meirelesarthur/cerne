import React, { useState } from 'react'
import { FormSection } from '../../../../components/ui/FormSection'
import { StepHeader } from '../../../../components/ui/StepHeader'
import { mockCentrosCusto } from '../fazendas.mock'
import type { FazendaFormData } from '../fazendas.types'

interface Step5Props {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
  onCentrosCustoChange: (ids: string[]) => void
}

export function Step5Configuracoes({ data, errors, onChange, onCentrosCustoChange }: Step5Props) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
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
      {/* Observações Section */}
      <FormSection title="Observações">
        <div style={{ position: 'relative' }}>
          <textarea
            value={data.observacao}
            onChange={(e) => onChange('observacao', e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Informações adicionais sobre a fazenda..."
            style={{
              width: '100%',
              border: '1.5px solid #e5e5e5',
              borderRadius: 8,
              padding: '10px',
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              color: '#1a1a1a',
              background: 'white',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: 1.5,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#059669' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e5e5' }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              right: 10,
              fontSize: 11,
              color: '#9ca3af',
              fontFamily: "'Outfit', sans-serif",
              pointerEvents: 'none',
            }}
          >
            {data.observacao.length}/1000
          </span>
        </div>
      </FormSection>

      {/* Centro de Custo Section */}
      <FormSection title="Centro de Custo">
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

        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '8px 12px', width: 36, borderBottom: '1px solid #f0f0f0' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: '#059669' }}
                  />
                </th>
                {['Código', 'Classe', 'Condição', 'Descrição'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#616161',
                      fontFamily: "'Outfit', sans-serif",
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'left',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCentrosCusto.map((cc) => {
                const isSelected = selected.includes(cc.id)
                return (
                  <tr
                    key={cc.id}
                    onMouseEnter={() => setHoveredRow(cc.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => toggleRow(cc.id)}
                    style={{
                      background: isSelected ? '#f0fdf4' : hoveredRow === cc.id ? '#fafafa' : 'white',
                      borderBottom: '1px solid #f9f9f9',
                      cursor: 'pointer',
                      height: 36,
                    }}
                  >
                    <td style={{ padding: '0 12px', width: 36 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(cc.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: 'pointer', accentColor: '#059669' }}
                      />
                    </td>
                    <td
                      style={{
                        padding: '0 10px',
                        fontSize: 12,
                        fontFamily: "'Outfit', sans-serif",
                        color: '#1a1a1a',
                        fontWeight: 500,
                      }}
                    >
                      {cc.codigo}
                    </td>
                    <td
                      style={{
                        padding: '0 10px',
                        fontSize: 12,
                        fontFamily: "'Outfit', sans-serif",
                        color: '#616161',
                      }}
                    >
                      {cc.classe}
                    </td>
                    <td
                      style={{
                        padding: '0 10px',
                        fontSize: 12,
                        fontFamily: "'Outfit', sans-serif",
                        color: '#616161',
                      }}
                    >
                      {cc.condicao}
                    </td>
                    <td
                      style={{
                        padding: '0 10px',
                        fontSize: 12,
                        fontFamily: "'Outfit', sans-serif",
                        color: '#1a1a1a',
                      }}
                    >
                      {cc.descricao}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </FormSection>
    </div>
  )
}
