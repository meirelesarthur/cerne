import { FormField }    from '../../../../components/ui/FormField'
import { FormSelect }   from '../../../../components/ui/FormSelect'
import { RepeaterList } from '../../../../components/ui/RepeaterList'
import { StepHeader }   from '../../../../components/ui/StepHeader'
import { t }            from '../../../../design/tokens'
import { useTheme }     from '../../../../context/ThemeContext'
import { TIPO_FORNECEDOR, CIDADES } from '../pessoas.types'
import { grid2, grid3, colStack, BankFields, FieldGroupLabel, SELECT_PLACEHOLDER, type StepProps } from './parts'

export function StepFornecedor({ form, errors, setRole, disabled }: StepProps) {
  const { colors } = useTheme()
  const p = form.provider

  return (
    <>
      <StepHeader
        title="Fornecedor"
        subtitle="Tipo de fornecimento, dados bancários, filiais e vendedores."
      />

      <div style={{ maxWidth: 760, margin: '0 auto', ...colStack }}>
        <div style={grid3}>
          <FormSelect label="Tipo de Fornecedor" options={[SELECT_PLACEHOLDER, ...TIPO_FORNECEDOR]} value={p.type} onChange={(e) => setRole('provider', { type: e.target.value })} disabled={disabled} />
          {p.type === '5' && (
            <FormField label="Comissão (%)" required inputMode="decimal" placeholder="0–100" value={p.commission} onChange={(e) => setRole('provider', { commission: e.target.value })} error={errors.prov_commission} disabled={disabled} />
          )}
          {p.type === '3' && (
            <FormField label="Valor por Hora" required mask="currency" inputMode="numeric" placeholder="R$ 0,00" value={p.hourValue} onChange={(e) => setRole('provider', { hourValue: e.target.value })} error={errors.prov_hour} disabled={disabled} />
          )}
        </div>
        <div style={grid2}>
          <FormField label="Inscrição Estadual" value={p.stateRegistration} onChange={(e) => setRole('provider', { stateRegistration: e.target.value })} disabled={disabled} />
          <FormField label="Inscrição Municipal" value={p.cityRegistration} onChange={(e) => setRole('provider', { cityRegistration: e.target.value })} disabled={disabled} />
        </div>
        <div style={grid2}>
          <FormField label="Contato" placeholder="Nome do responsável" value={p.contact} onChange={(e) => setRole('provider', { contact: e.target.value })} disabled={disabled} />
          <FormField label="Telefone do Contato" mask="phone" type="tel" placeholder="(00) 00000-0000" value={p.contactPhone} onChange={(e) => setRole('provider', { contactPhone: e.target.value })} disabled={disabled} />
        </div>

        <BankFields
          bankId={p.bankId} accountType={p.accountType} agency={p.agency} account={p.account}
          pixType={p.pixType} pix={p.pix} pixError={errors.prov_pix}
          onChange={(patch) => setRole('provider', patch)} disabled={disabled}
        />

        {/* Filiais */}
        <div>
          <FieldGroupLabel>Filiais</FieldGroupLabel>
          <div style={{ marginTop: t.space[2] }}>
            <RepeaterList
              items={p.branches}
              disabled={disabled}
              align="start"
              addLabel="Adicionar filial"
              emptyText="Nenhuma filial cadastrada."
              removeLabel="Remover filial"
              onAdd={() => setRole('provider', { branches: [...p.branches, { nif: '', stateRegistration: '', zipCode: '', address: '', cityId: '' }] })}
              onRemove={(i) => setRole('provider', { branches: p.branches.filter((_, idx) => idx !== i) })}
              renderRow={(b, i) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3], padding: t.space[3], border: `1px solid ${colors.border}`, borderRadius: t.radius.DEFAULT, background: colors.surfaceSubtle }}>
                  <div style={grid2}>
                    <FormField label="CNPJ da Filial" mask="cnpj" inputMode="numeric" value={b.nif} onChange={(e) => setRole('provider', { branches: p.branches.map((x, idx) => idx === i ? { ...x, nif: e.target.value } : x) })} disabled={disabled} />
                    <FormField label="Inscrição Estadual" value={b.stateRegistration} onChange={(e) => setRole('provider', { branches: p.branches.map((x, idx) => idx === i ? { ...x, stateRegistration: e.target.value } : x) })} disabled={disabled} />
                  </div>
                  <div style={grid2}>
                    <FormField label="CEP" mask="cep" value={b.zipCode} onChange={(e) => setRole('provider', { branches: p.branches.map((x, idx) => idx === i ? { ...x, zipCode: e.target.value } : x) })} disabled={disabled} />
                    <FormSelect label="Cidade" options={[SELECT_PLACEHOLDER, ...CIDADES]} value={b.cityId} onChange={(e) => setRole('provider', { branches: p.branches.map((x, idx) => idx === i ? { ...x, cityId: e.target.value } : x) })} disabled={disabled} />
                  </div>
                  <FormField label="Endereço" value={b.address} onChange={(e) => setRole('provider', { branches: p.branches.map((x, idx) => idx === i ? { ...x, address: e.target.value } : x) })} disabled={disabled} />
                </div>
              )}
            />
          </div>
        </div>

        {/* Vendedores */}
        <div>
          <FieldGroupLabel>Vendedores</FieldGroupLabel>
          <div style={{ marginTop: t.space[2] }}>
            <RepeaterList
              items={p.sellers}
              disabled={disabled}
              align="start"
              addLabel="Adicionar vendedor"
              emptyText="Nenhum vendedor cadastrado."
              removeLabel="Remover vendedor"
              onAdd={() => setRole('provider', { sellers: [...p.sellers, { name: '', email: '', phone: '' }] })}
              onRemove={(i) => setRole('provider', { sellers: p.sellers.filter((_, idx) => idx !== i) })}
              renderRow={(s, i) => (
                <div style={grid3}>
                  <FormField label="Nome" value={s.name} onChange={(e) => setRole('provider', { sellers: p.sellers.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) })} disabled={disabled} />
                  <FormField label="E-mail" type="email" spellCheck={false} value={s.email} onChange={(e) => setRole('provider', { sellers: p.sellers.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x) })} disabled={disabled} />
                  <FormField label="Telefone" mask="phone" type="tel" value={s.phone} onChange={(e) => setRole('provider', { sellers: p.sellers.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x) })} disabled={disabled} />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}
