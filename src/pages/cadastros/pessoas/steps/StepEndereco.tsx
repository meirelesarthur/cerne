import { useState } from 'react'
import { FormField }    from '../../../../components/ui/FormField'
import { SearchSelect } from '../../../../components/ui/SearchSelect'
import { StepHeader }   from '../../../../components/ui/StepHeader'
import { CIDADES }      from '../pessoas.types'
import { grid2, colStack, type StepProps } from './parts'

export function StepEndereco({ form, errors, set, disabled }: StepProps) {
  const [cityQuery, setCityQuery] = useState(
    () => CIDADES.find((c) => c.value === form.cityId)?.label ?? '',
  )
  const cityOptions = CIDADES.map((c) => ({ id: c.value, label: c.label }))

  return (
    <>
      <StepHeader
        title="Endereço"
        subtitle="Localização e endereço de correspondência da pessoa."
      />

      <div style={{ maxWidth: 760, margin: '0 auto', ...colStack }}>
        <div style={grid2}>
          <FormField
            label="CEP" mask="cep" placeholder="00000-000" autoComplete="postal-code"
            value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)}
            disabled={disabled}
          />
          <SearchSelect
            label="Cidade" required placeholder="Busque por nome ou UF…"
            query={cityQuery} onQueryChange={setCityQuery}
            options={cityOptions} selectedId={form.cityId || null}
            onSelect={(opt) => { set('cityId', opt.id); setCityQuery(opt.label) }}
            onClear={() => { set('cityId', ''); setCityQuery('') }}
            error={errors.cityId}
          />
        </div>
        <FormField
          label="Endereço" required placeholder="Rua, avenida, rodovia…"
          value={form.address} onChange={(e) => set('address', e.target.value)}
          error={errors.address} disabled={disabled}
        />
        <div style={grid2}>
          <FormField
            label="Número" required maxLength={60} placeholder="Ex: 1200 ou S/N"
            value={form.number} onChange={(e) => set('number', e.target.value)}
            error={errors.number} disabled={disabled}
          />
          <FormField
            label="Bairro" required maxLength={60} placeholder="Ex: Centro"
            value={form.district} onChange={(e) => set('district', e.target.value)}
            error={errors.district} disabled={disabled}
          />
        </div>
      </div>
    </>
  )
}
