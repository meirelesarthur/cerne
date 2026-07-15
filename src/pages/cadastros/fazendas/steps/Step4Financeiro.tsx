import React from 'react'
import { FormField } from '../../../../components/ui/FormField'
import { FormSelect } from '../../../../components/ui/FormSelect'
import { StepHeader } from '../../../../components/ui/StepHeader'
import type { FazendaFormData } from '../fazendas.types'

interface Step4Props {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
  onBoolChange: (field: keyof FazendaFormData, value: boolean) => void
}

const moedaOptions = [
  { value: 'BRL', label: 'BRL – Real Brasileiro' },
  { value: 'USD', label: 'USD – Dólar Americano' },
  { value: 'EUR', label: 'EUR – Euro' },
]

const simNaoOptions = [
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' },
]

export function Step4Financeiro({ data, errors, onChange, onBoolChange }: Step4Props) {
  return (
    <>
      <StepHeader
        title="Dados Financeiros"
        subtitle="Configure área, valor por hectare e taxas de remuneração da propriedade"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <FormSelect
          label="Moeda"
          required
          error={errors.moeda}
          options={moedaOptions}
          value={data.moeda}
          onChange={(e) => onChange('moeda', e.target.value)}
        />

        <FormField
          label="Área Total (ha)"
          required
          error={errors.areaTotal}
          value={data.areaTotal}
          onChange={(e) => onChange('areaTotal', e.target.value)}
          placeholder="Ex: 1500"
          type="number"
          min="0"
        />

        <FormField
          label="Valor por Hectare (R$)"
          required
          hint="Valor de mercado do hectare sem benfeitorias"
          error={errors.valorHa}
          value={data.valorHa}
          onChange={(e) => onChange('valorHa', e.target.value)}
          placeholder="Ex: 15000"
          type="number"
          min="0"
        />

        <FormField
          label="Taxa de Remuneração do Capital (%/ano)"
          required
          hint="Taxa de remuneração do capital imobilizado na terra"
          error={errors.taxaRemuneracao}
          value={data.taxaRemuneracao}
          onChange={(e) => onChange('taxaRemuneracao', e.target.value)}
          placeholder="Ex: 6.0"
          type="number"
          min="0"
          step="0.01"
        />

        <FormSelect
          label="Ativo"
          error={errors.ativo}
          options={simNaoOptions}
          value={String(data.ativo)}
          onChange={(e) => onBoolChange('ativo', e.target.value === 'true')}
        />

        <FormSelect
          label="Uso no Livro Caixa"
          hint="Define se movimentações dessa fazenda aparecem no Livro Caixa"
          error={errors.usoLivroCaixa}
          options={simNaoOptions}
          value={String(data.usoLivroCaixa)}
          onChange={(e) => onBoolChange('usoLivroCaixa', e.target.value === 'true')}
        />
      </div>
    </>
  )
}
