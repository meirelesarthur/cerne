import React from 'react'
import { FormField } from '../../../../components/ui/FormField'
import { FormSelect } from '../../../../components/ui/FormSelect'
import { StepHeader } from '../../../../components/ui/StepHeader'
import type { FazendaFormData } from '../fazendas.types'

interface Step4EnderecoProps {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
}

const paisOptions = [
  { value: 'Brasil', label: 'Brasil' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Paraguai', label: 'Paraguai' },
  { value: 'Bolívia', label: 'Bolívia' },
  { value: 'Uruguai', label: 'Uruguai' },
]

export function Step4Endereco({ data, errors, onChange }: Step4EnderecoProps) {
  return (
    <div>
      <StepHeader
        title="Endereço"
        subtitle="Informe a localização da fazenda para registros e correspondências."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
          <FormSelect
            label="País"
            required
            error={errors.pais}
            options={paisOptions}
            value={data.pais}
            onChange={(e) => onChange('pais', e.target.value)}
          />

          <FormField
            label="CEP"
            required
            error={errors.cep}
            value={data.cep}
            onChange={(e) => onChange('cep', e.target.value)}
            placeholder="00000-000"
          />

          <FormField
            label="Cidade"
            required
            error={errors.cidade}
            value={data.cidade}
            onChange={(e) => onChange('cidade', e.target.value)}
            placeholder="Nome da cidade"
          />

          <FormField
            label="Local / Endereço"
            required
            error={errors.endereco}
            value={data.endereco}
            onChange={(e) => onChange('endereco', e.target.value)}
            placeholder="Rodovia, Km, estrada..."
          />

          <FormField
            label="Número"
            error={errors.numero}
            value={data.numero}
            onChange={(e) => onChange('numero', e.target.value)}
            placeholder="S/N"
          />

          <FormField
            label="Bairro"
            required
            error={errors.bairro}
            value={data.bairro}
            onChange={(e) => onChange('bairro', e.target.value)}
            placeholder="Bairro / Localidade"
          />
      </div>
    </div>
  )
}
