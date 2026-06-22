import { FormField }  from '../../../../components/ui/FormField'
import { StepHeader } from '../../../../components/ui/StepHeader'
import { t }          from '../../../../design/tokens'
import { useTheme }   from '../../../../context/ThemeContext'
import { PERFIS_USUARIO, FAZENDAS, ENCARREGADOS } from '../pessoas.types'
import { grid2, colStack, ToggleRow, MultiCheck, type StepProps } from './parts'

interface Props extends StepProps {
  isEdit: boolean
}

export function StepUsuario({ form, errors, setRole, disabled, isEdit }: Props) {
  const { colors } = useTheme()
  const u = form.user
  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  return (
    <>
      <StepHeader
        title="Usuário"
        subtitle="Acesso ao sistema — senha, perfis, fazendas e encarregados."
      />

      <div style={{ maxWidth: 760, margin: '0 auto', ...colStack }}>
        {isEdit ? (
          <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans, padding: `${t.space[2]}px ${t.space[3]}px`, background: colors.bg.subtle, borderRadius: t.radius.DEFAULT }}>
            A senha não é exibida na edição. Use "Redefinir senha" para enviar um novo acesso.
          </div>
        ) : (
          <div style={grid2}>
            <FormField
              label="Senha" required type="password" autoComplete="new-password"
              hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
              value={u.password} onChange={(e) => setRole('user', { password: e.target.value })}
              error={errors.user_password} disabled={disabled}
            />
            <FormField
              label="Confirmação de Senha" required type="password" autoComplete="new-password"
              value={u.passwordConfirmation} onChange={(e) => setRole('user', { passwordConfirmation: e.target.value })}
              error={errors.user_password_confirmation} disabled={disabled}
            />
          </div>
        )}

        <ToggleRow label="Conferente de Compras" hint="Perfil especial com permissões de conferência de compras." checked={u.purchasingAssistant} onChange={(v) => setRole('user', { purchasingAssistant: v })} disabled={disabled} />
        <MultiCheck label="Perfis" options={PERFIS_USUARIO} selected={u.roleIds} onToggle={(v) => setRole('user', { roleIds: toggleInList(u.roleIds, v) })} disabled={disabled} />
        <MultiCheck label="Fazendas" options={FAZENDAS} selected={u.farmIds} onToggle={(v) => setRole('user', { farmIds: toggleInList(u.farmIds, v) })} disabled={disabled} />
        <MultiCheck label="Encarregados" options={ENCARREGADOS} selected={u.bossIds} onToggle={(v) => setRole('user', { bossIds: toggleInList(u.bossIds, v) })} disabled={disabled} />
      </div>
    </>
  )
}
