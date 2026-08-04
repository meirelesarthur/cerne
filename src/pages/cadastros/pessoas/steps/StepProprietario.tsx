import { EditableFieldTable } from '../../../../components/ui/EditableFieldTable'
import { FormField }    from '../../../../components/ui/FormField'
import { FormSelect }   from '../../../../components/ui/FormSelect'
import { RepeaterList } from '../../../../components/ui/RepeaterList'
import { StepHeader }   from '../../../../components/ui/StepHeader'
import { t }            from '../../../../design/tokens'
import { FAZENDAS, type FarmShare } from '../pessoas.types'
import { colStack, onlyDigits, FieldGroupLabel, SELECT_PLACEHOLDER, type StepProps } from './parts'

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
            <EditableFieldTable<FarmShare>
              items={farms}
              disabled={disabled}
              addLabel="Adicionar fazenda"
              emptyText="Nenhuma fazenda vinculada."
              removeLabel="Remover fazenda"
              emptyItem={() => ({ farmId: '', percentage: '' })}
              onChange={(next) => setRole('proprietary', { farms: next })}
              getError={(i, key) => key === 'farmId' ? errors[`prop_farm_${i}`] : errors[`prop_pct_${i}`]}
              columns={[
                {
                  key: 'farmId',
                  label: 'Fazenda',
                  render: (fs) => FAZENDAS.find((option) => option.value === fs.farmId)?.label ?? '—',
                  renderEdit: (fs, onChange, error) => (
                    <FormSelect
                      options={[SELECT_PLACEHOLDER, ...FAZENDAS]}
                      value={fs.farmId}
                      onChange={(e) => onChange({ farmId: e.target.value })}
                      error={error}
                      disabled={disabled}
                    />
                  ),
                },
                {
                  key: 'percentage',
                  label: 'Participação (%)',
                  width: 180,
                  align: 'right',
                  render: (fs) => fs.percentage ? `${fs.percentage}%` : '—',
                  renderEdit: (fs, onChange, error) => (
                    <FormField
                      inputMode="decimal"
                      placeholder="0–100"
                      value={fs.percentage}
                      onChange={(e) => onChange({ percentage: e.target.value })}
                      error={error}
                      disabled={disabled}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
