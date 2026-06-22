import { FormField }  from '../../../../components/ui/FormField'
import { FormSelect } from '../../../../components/ui/FormSelect'
import { DatePicker } from '../../../../components/ui/DatePicker'
import { StepHeader } from '../../../../components/ui/StepHeader'
import { t }          from '../../../../design/tokens'
import { useTheme }   from '../../../../context/ThemeContext'
import { usePermission } from '../../../../auth'
import { FUNCOES_CBO, CENTROS_CUSTO } from '../pessoas.types'
import { grid2, grid3, colStack, BankFields, SELECT_PLACEHOLDER, type StepProps } from './parts'

const todayIso = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

export function StepFuncionario({ form, errors, setRole, disabled }: StepProps) {
  const { colors } = useTheme()
  const { can } = usePermission()
  const canViewSalary = can('pessoa.salary_view')
  const e = form.employee

  return (
    <>
      <StepHeader
        title="Funcionário"
        subtitle="Cargo, função, centro de custo e dados bancários do colaborador."
      />

      <div style={{ maxWidth: 760, margin: '0 auto', ...colStack }}>
        <div style={grid2}>
          <FormField label="Cargo" placeholder="Ex: Operador de máquinas" value={e.office} onChange={(ev) => setRole('employee', { office: ev.target.value })} disabled={disabled} />
          <FormSelect label="Função (CBO)" options={[SELECT_PLACEHOLDER, ...FUNCOES_CBO]} value={e.functionId} onChange={(ev) => setRole('employee', { functionId: ev.target.value })} disabled={disabled} />
        </div>
        <div style={grid3}>
          <FormSelect label="Centro de Custo" options={[SELECT_PLACEHOLDER, ...CENTROS_CUSTO]} value={e.centerId} onChange={(ev) => setRole('employee', { centerId: ev.target.value })} disabled={disabled} />
          <FormField label="Valor por Hora" mask="currency" inputMode="numeric" placeholder="R$ 0,00" value={e.hourValue} onChange={(ev) => setRole('employee', { hourValue: ev.target.value })} disabled={disabled} />
          <DatePicker label="Data de Nascimento" value={e.birthday} max={todayIso} onChange={(iso) => setRole('employee', { birthday: iso })} disabled={disabled} />
        </div>

        {canViewSalary ? (
          <div style={grid2}>
            <FormField label="Salário Base" mask="currency" inputMode="numeric" hint="Dado sensível — visível apenas com permissão." placeholder="R$ 0,00" value={e.baseSalary} onChange={(ev) => setRole('employee', { baseSalary: ev.target.value })} disabled={disabled} />
            <FormField label="Salário Meta" mask="currency" inputMode="numeric" placeholder="R$ 0,00" value={e.goalSalary} onChange={(ev) => setRole('employee', { goalSalary: ev.target.value })} disabled={disabled} />
          </div>
        ) : (
          <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans, padding: `${t.space[2]}px ${t.space[3]}px`, background: colors.bg.subtle, borderRadius: t.radius.DEFAULT }}>
            Dados salariais ocultos — requer permissão <code>pessoa.salary_view</code>.
          </div>
        )}

        <BankFields
          bankId={e.bankId} accountType={e.accountType} agency={e.agency} account={e.account}
          pixType={e.pixType} pix={e.pix} pixError={errors.emp_pix}
          onChange={(patch) => setRole('employee', patch)} disabled={disabled}
        />
      </div>
    </>
  )
}
