import React from 'react'
import { FormSection } from '../../../../components/ui/FormSection'
import { FormField } from '../../../../components/ui/FormField'
import { StepHeader } from '../../../../components/ui/StepHeader'
import type { FazendaFormData } from '../fazendas.types'

interface Step1Props {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
}

export function Step1Identificacao({ data, errors, onChange }: Step1Props) {
  const cpfCnpjDigits = data.cpfCnpj.replace(/\D/g, '')
  const showInscricaoEstadual = cpfCnpjDigits.length >= 14

  return (
    <>
      <StepHeader
        title="Identificação da Fazenda"
        subtitle="Informe o nome, documento e telefone de contato da propriedade"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <FormField
            label="Nome da Fazenda"
            required
            error={errors.nome}
            value={data.nome}
            onChange={(e) => onChange('nome', e.target.value)}
            placeholder="Ex: Fazenda Santa Luzia"
          />
        </div>

        <FormField
          label="CPF / CNPJ"
          error={errors.cpfCnpj}
          value={data.cpfCnpj}
          onChange={(e) => onChange('cpfCnpj', e.target.value)}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />

        {showInscricaoEstadual && (
          <FormField
            label="Inscrição Estadual"
            error={errors.inscricaoEstadual}
            value={data.inscricaoEstadual}
            onChange={(e) => onChange('inscricaoEstadual', e.target.value)}
            placeholder="Número da inscrição estadual"
          />
        )}

        <FormField
          label="Telefone"
          required
          error={errors.telefone}
          value={data.telefone}
          onChange={(e) => onChange('telefone', e.target.value)}
          placeholder="(00) 00000-0000"
        />
      </div>
    </>
  )
}
