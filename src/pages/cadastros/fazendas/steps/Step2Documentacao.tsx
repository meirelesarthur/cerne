import React from 'react'
import { FormSection } from '../../../../components/ui/FormSection'
import { FormField } from '../../../../components/ui/FormField'
import { FormSelect } from '../../../../components/ui/FormSelect'
import type { FazendaFormData } from '../fazendas.types'

interface Step2Props {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
}

const tipoExploracaoOptions = [
  { value: '', label: 'Selecione...' },
  { value: 'Agrícola', label: 'Agrícola' },
  { value: 'Pecuário', label: 'Pecuário' },
  { value: 'Misto', label: 'Misto' },
  { value: 'Silvicultura', label: 'Silvicultura' },
  { value: 'Piscicultura', label: 'Piscicultura' },
  { value: 'Outro', label: 'Outro' },
]

export function Step2Documentacao({ data, errors, onChange }: Step2Props) {
  return (
    <FormSection title="Documentação Rural">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <FormSelect
            label="Tipo de Exploração"
            required
            error={errors.tipoExploracao}
            options={tipoExploracaoOptions}
            value={data.tipoExploracao}
            onChange={(e) => onChange('tipoExploracao', e.target.value)}
          />
        </div>

        <FormField
          label="CAR"
          error={errors.car}
          value={data.car}
          onChange={(e) => onChange('car', e.target.value)}
          placeholder="Cadastro Ambiental Rural"
        />

        <FormField
          label="NIRF"
          required
          hint="Número do Imóvel na Receita Federal — emitido pelo INCRA"
          error={errors.nirf}
          value={data.nirf}
          onChange={(e) => onChange('nirf', e.target.value)}
          placeholder="Número do Imóvel"
        />

        <FormField
          label="CCIR"
          required
          hint="Certificado que comprova o cadastro do imóvel no INCRA"
          error={errors.ccir}
          value={data.ccir}
          onChange={(e) => onChange('ccir', e.target.value)}
          placeholder="Certificado de Cadastro"
        />

        <FormField
          label="CAFIR"
          required
          error={errors.cafir}
          value={data.cafir}
          onChange={(e) => onChange('cafir', e.target.value)}
          placeholder="Cadastro de Imóveis Rurais"
        />

        <FormField
          label="CAEPI"
          required
          error={errors.caepi}
          value={data.caepi}
          onChange={(e) => onChange('caepi', e.target.value)}
          placeholder="Certificado de Aprovação de EPI"
        />
      </div>
    </FormSection>
  )
}
