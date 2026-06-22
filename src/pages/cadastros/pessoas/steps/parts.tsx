import React from 'react'
import { Info } from 'lucide-react'
import { FormField }    from '../../../../components/ui/FormField'
import { FormSelect }   from '../../../../components/ui/FormSelect'
import { ToggleSwitch } from '../../../../components/ui/ToggleSwitch'
import { Checkbox }     from '../../../../components/ui/Checkbox'
import { Tooltip }      from '../../../../components/ui/Tooltip'
import { t }            from '../../../../design/tokens'
import { useTheme }     from '../../../../context/ThemeContext'
import { BANCOS, TIPO_CONTA, TIPO_PIX, type Pessoa, type RoleKey, type Opt } from '../pessoas.types'

// ─── Props comuns dos steps ────────────────────────────────────────────────────

export interface StepProps {
  form:     Pessoa
  errors:   Record<string, string>
  set:      <K extends keyof Pessoa>(key: K, value: Pessoa[K]) => void
  setRole:  <R extends RoleKey>(role: R, patch: Partial<Pessoa[R]>) => void
  disabled?: boolean
}

// ─── Estilos de grade reutilizados ─────────────────────────────────────────────

export const grid2:    React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space[4] }
export const grid3:    React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.space[4] }
export const colStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: t.space[4] }

export const SELECT_PLACEHOLDER: Opt = { value: '', label: 'Selecione...' }
export const onlyDigits = (v: string) => v.replace(/\D/g, '')

// ─── Rótulo de grupo de campos ──────────────────────────────────────────────────

export function FieldGroupLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme()
  return (
    <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, fontFamily: t.font.family.sans }}>
      {children}
    </span>
  )
}

// ─── Toggle como linha de campo booleano ───────────────────────────────────────

export function ToggleRow({ checked, onChange, label, hint, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.space[3], padding: `${t.space[2] + 2}px ${t.space[3]}px`, background: colors.bg.subtle, borderRadius: t.radius.base, border: `1px solid ${colors.border.default}` }}>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[1], fontSize: t.font.size.sm, fontWeight: t.font.weight.medium, color: colors.fg.default, fontFamily: t.font.family.sans }}>
        {label}
        {hint && (
          <Tooltip label={hint}>
            <span style={{ display: 'flex' }}><Info size={12} color={colors.fg.subtle} /></span>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

// ─── Multi-seleção via checkboxes ──────────────────────────────────────────────

export function MultiCheck({ label, options, selected, onToggle, disabled }: {
  label: string; options: Opt[]; selected: string[]; onToggle: (value: string) => void; disabled?: boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
      <FieldGroupLabel>{label}</FieldGroupLabel>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: `${t.space[2]}px ${t.space[4]}px`,
        padding: `${t.space[3]}px`, border: `1px solid ${colors.border.default}`, borderRadius: t.radius.base, background: colors.bg.surface,
      }}>
        {options.map((o) => (
          <Checkbox key={o.value} label={o.label} checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} disabled={disabled} />
        ))}
      </div>
    </div>
  )
}

// ─── Bloco de dados bancários (Funcionário / Fornecedor) ───────────────────────

export function BankFields({ bankId, accountType, agency, account, pixType, pix, pixError, onChange, disabled }: {
  bankId:      string
  accountType: string
  agency:      string
  account:     string
  pixType:     string
  pix:         string
  pixError?:   string
  onChange:    (patch: Record<string, string>) => void
  disabled?:   boolean
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3] }}>
      <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, color: colors.fg.subtle, fontFamily: t.font.family.sans, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Dados Bancários
      </span>
      <div style={grid2}>
        <FormSelect label="Banco" options={[SELECT_PLACEHOLDER, ...BANCOS]} value={bankId} onChange={(e) => onChange({ bankId: e.target.value })} disabled={disabled} />
        <FormSelect label="Tipo de Conta" options={[SELECT_PLACEHOLDER, ...TIPO_CONTA]} value={accountType} onChange={(e) => onChange({ accountType: e.target.value })} disabled={disabled} />
      </div>
      <div style={grid2}>
        <FormField label="Agência" inputMode="numeric" value={agency} onChange={(e) => onChange({ agency: e.target.value })} disabled={disabled} />
        <FormField label="Conta" inputMode="numeric" value={account} onChange={(e) => onChange({ account: e.target.value })} disabled={disabled} />
      </div>
      <div style={grid2}>
        <FormSelect label="Tipo de Chave PIX" options={[SELECT_PLACEHOLDER, ...TIPO_PIX]} value={pixType} onChange={(e) => onChange({ pixType: e.target.value })} disabled={disabled} />
        <FormField label="Chave PIX" value={pix} onChange={(e) => onChange({ pix: e.target.value })} error={pixError} disabled={disabled} spellCheck={false} />
      </div>
    </div>
  )
}
