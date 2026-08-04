import { useState } from 'react'
import { BarChart3, Bell, Blocks, Gem, LifeBuoy, LogOut, Moon, Settings, Sparkles, Sun, UserCog } from 'lucide-react'
import type { NavModule } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { useNavigation } from '../../context/NavigationContext'
import { useUserProfile } from '../../context/UserProfileContext'
import { usePlan } from '../../auth/PlanContext'
import type { PlanTier } from '../../auth/PlanContext'
import { t } from '../../design/tokens'
import { Breadcrumb } from '../ui/Breadcrumb'
import { FarmSwitcher } from '../ui/FarmSwitcher'
import { DropdownMenu } from '../ui/DropdownMenu'
import { Avatar } from '../ui/Avatar'
import { Badge, type BadgeVariant } from '../ui/Badge'
import { Button } from '../ui/Button'
import { PLAN_LABEL } from '../ui/UpgradePrompt'
import { LanguageSwitcher, type SupportedLanguage } from './LanguageSwitcher'
import SearchBar from '../SearchBar'

const PLAN_BADGE_VARIANT: Record<PlanTier, BadgeVariant> = {
  trial: 'neutral',
  essencial: 'info',
  profissional: 'purple',
  enterprise: 'cyan',
}

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', label: 'Safra 25/26 aguardando configuração de semanas' },
  { id: 'n2', label: 'Estoque de Uréia Pecuária abaixo do mínimo' },
  { id: 'n3', label: 'Fazenda Três Irmãos com cadastro incompleto' },
]

interface TopbarProps {
  expandedModule?: NavModule
  activeItemId: string | null
  /** Encerra a sessão do usuário (item "Sair" do menu de conta). */
  onLogout?: () => void
  /**
   * Abre uma tela de referência do design system (fora do menu de negócio).
   * Visível por padrão em qualquer build; desligável via `VITE_SHOW_DS_PANEL=false`
   * no ambiente. É uma ferramenta interna para devs/POs, não um papel de RBAC do produto.
   */
  onOpenDesignSystem?: (itemId: 'ds-estados-conta' | 'ds-cobertura') => void
  /** Abre a tela de Planos (item "Planos" e botão "Fazer upgrade" do menu de conta). */
  onOpenPlanos?: () => void
}

export default function Topbar({ expandedModule, activeItemId, onLogout, onOpenDesignSystem, onOpenPlanos }: TopbarProps) {
  const { colors, isGbMode, toggle } = useTheme()
  const { navigateTo } = useNavigation()
  const { profile } = useUserProfile()
  const { plan } = usePlan()
  const [language, setLanguage] = useState<SupportedLanguage>('pt-BR')
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const dismissNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id))

  const activeItem =
    expandedModule && activeItemId
      ? [
          ...(expandedModule.flatItems ?? []),
          ...(expandedModule.groups?.flatMap((g) => g.items) ?? []),
        ].find((i) => i.id === activeItemId)
      : null

  return (
    <div
      style={{
        height: t.layout.topbarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${t.space[3]}px`,
        flexShrink: 0,
        background: 'transparent',
      }}
    >
      {/* Breadcrumb (componente do kit). O marginLeft espelha o deslocamento da
         linha de conteúdo (-t.space[2] quando há submenu), alinhando "Início" ao
         trilho de ícones do submenu (12px da borda do card). Sem submenu, 0. */}
      <div style={{ marginLeft: expandedModule ? -t.space[2] : 0 }}>
        <Breadcrumb
          items={[
            { label: 'Início' },
            ...(expandedModule ? [{ label: expandedModule.label }] : []),
            ...(activeItem ? [{ label: activeItem.label }] : []),
          ]}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search global — mesmo mecanismo de busca da Home (SearchBar), em versão compacta */}
        <SearchBar compact />

        {/* Farm Switcher */}
        <FarmSwitcher />

        {/* Design System (dev/PO) — visível em qualquer build (dev, staging ou
           produção/Cloudflare) por padrão, já que este deploy É o material de
           handoff para o time. Defina VITE_SHOW_DS_PANEL=false no ambiente
           (ex.: Cloudflare Pages > Settings > Environment Variables) para
           esconder num futuro deploy voltado a cliente final. Nunca gated por
           papel de negócio (admin/manager/operator/viewer) — "dev/PO" é uma
           audiência de ferramenta interna, não um papel de tenant do RBAC. */}
        {import.meta.env.VITE_SHOW_DS_PANEL !== 'false' && onOpenDesignSystem && (
          <DropdownMenu
            ariaLabel="Abrir referências do design system (uso interno)"
            triggerIcon={
              <span
                aria-hidden="true"
                style={{
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeItemId?.startsWith('ds-') ? colors.accent.default : colors.fg.muted,
                }}
              >
                <Blocks size={16} />
              </span>
            }
            items={[
              {
                id: 'ds-cobertura',
                label: 'Cobertura do Design System',
                icon: <BarChart3 size={15} />,
                onClick: () => onOpenDesignSystem('ds-cobertura'),
              },
              {
                id: 'ds-estados-conta',
                label: 'Estados de Conta & RBAC',
                icon: <UserCog size={15} />,
                onClick: () => onOpenDesignSystem('ds-estados-conta'),
              },
            ]}
          />
        )}

        {/* Notifications */}
        <DropdownMenu
          ariaLabel={`Notificações${notifications.length > 0 ? ` (${notifications.length} não lidas)` : ''}`}
          triggerIcon={
            <span
              aria-hidden="true"
              style={{
                position: 'relative',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.fg.muted,
              }}
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    background: t.color.feedback.notice,
                    color: 'white',
                    borderRadius: t.radius.full,
                    width: 16,
                    height: 16,
                    fontSize: t.font.size['3xs'], // 11px — piso legível para contador
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: t.font.weight.bold,
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </span>
          }
          items={
            notifications.length > 0
              ? notifications.map((n) => ({
                  id: n.id,
                  label: n.label,
                  onClick: () => dismissNotification(n.id),
                }))
              : [{ id: 'empty', label: 'Nenhuma notificação', onClick: () => {} }]
          }
        />

        {/* Menu de conta — avatar como gatilho do DropdownMenu do kit. Concentra aqui
           tudo que antes vivia solto no rodapé do Sidebar (tema, Planos) e no
           próprio menu (perfil, sair), com o plano atual e upgrade em destaque. */}
        <DropdownMenu
          ariaLabel={`Abrir menu da conta de ${profile.name}`}
          triggerIcon={<Avatar name={profile.name} src={profile.photoUrl ?? undefined} size="sm" />}
          minWidth={280}
          header={
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[3], width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
                <Avatar name={profile.name} src={profile.photoUrl ?? undefined} size="md" />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: t.font.size.sm,
                      fontWeight: t.font.weight.semibold,
                      color: colors.fg.default,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.name}
                  </span>
                  <span
                    style={{
                      fontSize: t.font.size.xs,
                      color: colors.fg.subtle,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.email}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                block
                blockAlign="center"
                icon={<Sparkles size={14} aria-hidden="true" />}
                onClick={() => onOpenPlanos?.()}
              >
                Fazer upgrade
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Plano atual</span>
                <Badge label={PLAN_LABEL[plan]} variant={PLAN_BADGE_VARIANT[plan]} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: t.font.size.xs, color: colors.fg.subtle }}>Idioma</span>
                <LanguageSwitcher value={language} onChange={setLanguage} />
              </div>
            </div>
          }
          items={[
            {
              id: 'perfil',
              label: 'Meu perfil',
              icon: <UserCog size={15} />,
              onClick: () => navigateTo('cadastros', 'cad-pes-per'),
            },
            {
              id: 'configuracoes',
              label: 'Configurações',
              icon: <Settings size={15} />,
              onClick: () => navigateTo('cadastros', 'cad-pes-per'),
            },
            {
              id: 'tema',
              label: isGbMode ? 'Ativar modo claro' : 'Ativar GB Mode',
              icon: isGbMode ? <Sun size={15} /> : <Moon size={15} />,
              divider: true,
              onClick: () => toggle(),
            },
            {
              id: 'planos',
              label: 'Planos',
              icon: <Gem size={15} />,
              onClick: () => onOpenPlanos?.(),
            },
            {
              id: 'ajuda',
              label: 'Central de ajuda',
              icon: <LifeBuoy size={15} />,
              divider: true,
              onClick: () => { window.location.href = 'mailto:suporte@greenbelt-ti.com' },
            },
            {
              id: 'sair',
              label: 'Sair',
              icon: <LogOut size={15} />,
              danger: true,
              divider: true,
              onClick: () => onLogout?.(),
            },
          ]}
        />
      </div>
    </div>
  )
}
