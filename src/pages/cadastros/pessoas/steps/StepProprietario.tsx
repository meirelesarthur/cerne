import { FormField }    from '../../../../components/ui/FormField'
import { FormSelect }   from '../../../../components/ui/FormSelect'
import { RepeaterList } from '../../../../components/ui/RepeaterList'
import { StepHeader }   from '../../../../components/ui/StepHeader'
import { t }            from '../../../../design/tokens'
import { FAZENDAS }     from '../pessoas.types'
import { grid2, colStack, onlyDigits, FieldGroupLabel, SELECT_PLACEHOLDER, type StepProps } from './parts'

export function StepProprietario({ form, errors, setRole, disabled }: StepProps) {
  const { inscricoes, farms } = form.proprietary

  return (
    <>
      <StepHeader
        title="Proprietário"
        subtitle="Vincule as fazendas, a participação por propriedade e as inscrições estaduais."
      />

      <div style={{ maxWidth: 760, margin: '0 auto', ...colStack }}>
        <div>
          <FieldGroupLabel>Inscrições Estaduais</FieldGroupLabel>
          <div style={{ marginTop: t.space[2] }}>
            <RepeaterList
              items={inscricoes}
              disabled={disabled}
              addLabel="Adicionar inscrição"
              emptyText="Nenhuma inscrição estadual cadastrada."
              removeLabel="Remover inscrição"
              onAdd={() => setRole('proprietary', { inscricoes: [...inscricoes, ''] })}
              onRemove={(i) => setRole('proprietary', { inscricoes: inscricoes.filter((_, idx) => idx !== i) })}
              renderRow={(value, i) => (
                <FormField
                  label={`Inscrição ${i + 1}`} inputMode="numeric" placeholder="Somente números"
                  value={value} disabled={disabled}
                  onChange={(e) => setRole('proprietary', { inscricoes: inscricoes.map((v, idx) => idx === i ? onlyDigits(e.target.value) : v) })}
                />
              )}
            />
          </div>
        </div>

        <div>
          <FieldGroupLabel>Fazendas e Participação</FieldGroupLabel>
          <div style={{ marginTop: t.space[2] }}>
            <RepeaterList
              items={farms}
              disabled={disabled}
              align="start"
              addLabel="Adicionar fazenda"
              emptyText="Nenhuma fazenda vinculada."
              removeLabel="Remover fazenda"
              onAdd={() => setRole('proprietary', { farms: [...farms, { farmId: '', percentage: '' }] })}
              onRemove={(i) => setRole('proprietary', { farms: farms.filter((_, idx) => idx !== i) })}
              renderRow={(fs, i) => (
                <div style={{ ...grid2, gridTemplateColumns: '2fr 1fr' }}>
                  <FormSelect
                    label="Fazenda" options={[SELECT_PLACEHOLDER, ...FAZENDAS]} value={fs.farmId}
                    onChange={(e) => setRole('proprietary', { farms: farms.map((x, idx) => idx === i ? { ...x, farmId: e.target.value } : x) })}
                    error={errors[`prop_farm_${i}`]} disabled={disabled}
                  />
                  <FormField
                    label="Participação (%)" inputMode="decimal" placeholder="0–100" value={fs.percentage}
                    onChange={(e) => setRole('proprietary', { farms: farms.map((x, idx) => idx === i ? { ...x, percentage: e.target.value } : x) })}
                    error={errors[`prop_pct_${i}`]} disabled={disabled}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}
