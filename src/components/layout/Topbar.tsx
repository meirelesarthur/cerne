import { useState } from 'react'
import { Bell, LogOut, UserCog } from 'lucide-react'
import type { NavModule } from '../../data/menuData'
import { useTheme } from '../../context/ThemeContext'
import { useNavigation } from '../../context/NavigationContext'
import { t } from '../../design/tokens'
import { Breadcrumb } from '../ui/Breadcrumb'
import { FarmSwitcher } from '../ui/FarmSwitcher'
import { DropdownMenu } from '../ui/DropdownMenu'
import SearchBar from '../SearchBar'

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
}

export default function Topbar({ expandedModule, activeItemId, onLogout }: TopbarProps) {
  const { colors } = useTheme()
  const { navigateTo } = useNavigation()
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
        height: 48,
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

        {/* Menu de conta — avatar como gatilho do DropdownMenu do kit */}
        <DropdownMenu
          ariaLabel="Abrir menu da conta de Silvio Ventura"
          triggerIcon={
            <span
              aria-hidden="true"
              style={{
                width: 26,
                height: 26,
                borderRadius: t.radius.full,
                background: `linear-gradient(135deg, ${colors.accent.default}, ${t.color.brand[300]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: t.font.size.xs,
                fontWeight: t.font.weight.semibold,
                letterSpacing: '0.3px',
              }}
            >
              SV
            </span>
          }
          items={[
            {
              id: 'perfil',
              label: 'Meu perfil',
              icon: <UserCog size={15} />,
              onClick: () => navigateTo('cadastros', 'cad-pes-per'),
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
