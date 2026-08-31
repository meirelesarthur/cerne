import { type ReactNode } from 'react'
import { Icon } from '../../../../components/ui/Icon'
import { FormField }     from '../../../../components/ui/FormField'
import { StepHeader }    from '../../../../components/ui/StepHeader'
import { ToggleSection } from '../../../../components/ui/ToggleSection'
import { t }             from '../../../../design/tokens'
import { useTheme }      from '../../../../context/ThemeContext'
import { ROLES, isPJ, type RoleKey } from '../pessoas.types'
import { gridFields, spanHalf, gridCards, colStack, FieldGroupLabel, type StepProps } from './parts'

const ROLE_ICON: Record<RoleKey, ReactNode> = {
  proprietary: <Icon name="crown" size={16} />,
  employee:    <Icon name="briefcase" size={16} />,
  provider:    <Icon name="truck" size={16} />,
  client:      <Icon name="cart" size={16} />,
  user:        <Icon name="key" size={16} />,
}

interface Props extends StepProps {
  onToggleRole: (key: RoleKey, value: boolean) => void
}

export function StepDadosBasicos({ form, errors, set, onToggleRole, disabled }: Props) {
  const { colors } = useTheme()
  const pj = isPJ(form.nif)
  const nameLabel     = pj ? 'Nome Fantasia' : 'Nome Completo'
  const nicknameLabel = pj ? 'Razão Social' : 'Apelido'

  return (
    <>
      <StepHeader
        title="Dados Básicos"
        subtitle="Informe a identificação da pessoa e ative os papéis aplicáveis."
      />

      <div style={colStack}>
        <div style={gridFields}>
          <FormField
            label="CPF / CNPJ" required mask="cpfCnpj" placeholder="000.000.000-00"
            value={form.nif} spellCheck={false} autoComplete="off"
            onChange={(e) => set('nif', e.target.value)}
            error={errors.nif} disabled={disabled}
          />
          <FormField
            label="Telefone" mask="phone" type="tel" placeholder="(00) 00000-0000"
            value={form.phone} autoComplete="tel"
            onChange={(e) => set('phone', e.target.value)}
            disabled={disabled}
          />
          <div style={spanHalf}>
            <FormField
              label="E-mail" type="email" inputMode="email"
              required={form.user.enabled} placeholder="nome@empresa.com.br"
              value={form.email} spellCheck={false} autoComplete="email"
              onChange={(e) => set('email', e.target.value)}
              error={errors.email} disabled={disabled}
            />
          </div>
          <div style={spanHalf}>
            <FormField
              label={nameLabel} required maxLength={70} hint={`${form.name.length}/70`}
              placeholder={pj ? 'Ex: AgroInsumos do Cerrado' : 'Ex: João da Silva'}
              value={form.name} onChange={(e) => set('name', e.target.value)}
              error={errors.name} disabled={disabled}
            />
          </div>
          <div style={spanHalf}>
            <FormField
              label={nicknameLabel} required maxLength={70} hint={`${form.nickname.length}/70`}
              placeholder={pj ? 'Ex: AgroInsumos do Cerrado LTDA' : 'Ex: João'}
              value={form.nickname} onChange={(e) => set('nickname', e.target.value)}
              error={errors.nickname} disabled={disabled}
            />
          </div>
        </div>

        {/* Papéis */}
        <div style={{ marginTop: t.space[2] }}>
          <FieldGroupLabel>Papéis desta pessoa</FieldGroupLabel>
          <p style={{ margin: `${t.space[1]}px 0 ${t.space[3]}px`, fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
            Ative os papéis aplicáveis — cada um adiciona uma etapa de configuração a seguir.
          </p>
          <div style={gridCards}>
            {ROLES.map((r) => (
              <ToggleSection
                key={r.key}
                variant="card"
                title={r.label}
                description={r.hint}
                icon={ROLE_ICON[r.key]}
                active={form[r.key].enabled}
                onToggle={(v) => onToggleRole(r.key, v)}
                disabled={disabled}
                activeHint={`Etapa "${r.label}" adicionada — configure a seguir.`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
