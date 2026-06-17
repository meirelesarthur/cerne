import { FormField }    from '../../../../components/ui/FormField'
import { FormSelect }   from '../../../../components/ui/FormSelect'
import { RepeaterList } from '../../../../components/ui/RepeaterList'
import { StepHeader }   from '../../../../components/ui/StepHeader'
import { t }            from '../../../../design/tokens'
import { PAISES }       from '../pessoas.types'
import { grid2, grid3, colStack, ToggleRow, FieldGroupLabel, type StepProps } from './parts'

export function StepCliente({ form, setRole, disabled }: StepProps) {
  const c = form.client

  return (
    <>
      <StepHeader
        title="Cliente"
        subtitle="Dados fiscais, contato comercial e inscrições estaduais do comprador."
      />

      <div style={{ maxWidth: 760, margin: '0 auto', ...colStack }}>
        <div style={grid3}>
          <FormField label="Celular" mask="phone" type="tel" value={c.cellphone} onChange={(e) => setRole('client', { cellphone: e.target.value })} disabled={disabled} />
          <FormField label="Contato" value={c.contact} onChange={(e) => setRole('client', { contact: e.target.value })} disabled={disabled} />
          <FormField label="Telefone do Contato" mask="phone" type="tel" value={c.contactPhone} onChange={(e) => setRole('client', { contactPhone: e.target.value })} disabled={disabled} />
        </div>
        <div style={grid2}>
          <FormField label="Inscrição Municipal" maxLength={20} value={c.cityRegistration} onChange={(e) => setRole('client', { cityRegistration: e.target.value })} disabled={disabled} />
          <FormField label="Nome da Fazenda" maxLength={100} value={c.farmName} onChange={(e) => setRole('client', { farmName: e.target.value })} disabled={disabled} />
        </div>
        <div style={grid2}>
          <ToggleRow label="Consumidor Final" hint="Impacta a tributação na emissão de NF-e." checked={c.finalConsumer} onChange={(v) => setRole('client', { finalConsumer: v })} disabled={disabled} />
          <ToggleRow label="Contribuinte" hint="Define se o cliente é contribuinte de ICMS (impacto fiscal)." checked={c.taxpayer} onChange={(v) => setRole('client', { taxpayer: v })} disabled={disabled} />
        </div>
        <div style={grid2}>
          <FormSelect label="País" options={PAISES} value={c.countryId} onChange={(e) => setRole('client', { countryId: e.target.value })} disabled={disabled} />
          {c.countryId !== 'BR' && (
            <FormField label="ID no Exterior" value={c.idAbroad} onChange={(e) => setRole('client', { idAbroad: e.target.value })} disabled={disabled} />
          )}
        </div>
        <div>
          <FieldGroupLabel>Inscrições Estaduais</FieldGroupLabel>
          <div style={{ marginTop: t.space[2] }}>
            <RepeaterList
              items={c.stateRegistrations}
              disabled={disabled}
              addLabel="Adicionar inscrição"
              emptyText="Nenhuma inscrição estadual cadastrada."
              removeLabel="Remover inscrição"
              onAdd={() => setRole('client', { stateRegistrations: [...c.stateRegistrations, ''] })}
              onRemove={(i) => setRole('client', { stateRegistrations: c.stateRegistrations.filter((_, idx) => idx !== i) })}
              renderRow={(value, i) => (
                <FormField
                  label={`Inscrição ${i + 1}`} value={value} disabled={disabled}
                  onChange={(e) => setRole('client', { stateRegistrations: c.stateRegistrations.map((v, idx) => idx === i ? e.target.value : v) })}
                />
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}
