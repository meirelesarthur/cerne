import { useState, useCallback } from 'react'
import Sidebar from './Sidebar'
import SecondaryNav from './SecondaryNav'
import Topbar from './Topbar'
import PerfilUsuario from '../../pages/PerfilUsuario'
import FazendasPage from '../../pages/cadastros/fazendas/FazendasPage'
import { menuModules, type NavModule, type NavGroup } from '../../data/menuData'
import { Construction } from 'lucide-react'
import { NavigationContext } from '../../context/NavigationContext'

interface AppLayoutProps {
  children: React.ReactNode
}

function FuncionalidadePlaceholder({ itemId, module }: { itemId: string; module?: NavModule }) {
  const allItems = [
    ...(module?.flatItems ?? []),
    ...(module?.groups?.flatMap((g: NavGroup) => g.items) ?? []),
  ]
  const item = allItems.find((i) => i.id === itemId)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        padding: 40,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Construction size={24} color="#059669" strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
          {item?.label ?? 'Funcionalidade'}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: "'Outfit', sans-serif" }}>
          Esta tela será implementada em breve.
        </div>
      </div>
    </div>
  )
}

function renderPage(itemId: string | null, module?: NavModule) {
  if (!itemId) return null
  if (itemId === 'cad-pes-per') return <PerfilUsuario />
  if (itemId === 'cad-est-faz') return <FazendasPage />
  return <FuncionalidadePlaceholder itemId={itemId} module={module} />
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeModuleId, setActiveModuleId] = useState<string>('painel')
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  const expandedModule = menuModules.find((m) => m.id === expandedModuleId)
  const hasSecondaryNav = expandedModuleId !== null

  // Module that owns the active item — stays stable even when secondary nav is closed
  const activeItemModule = activeItemId
    ? menuModules.find((m) =>
        [...(m.flatItems ?? []), ...(m.groups?.flatMap((g) => g.items) ?? [])].some(
          (i) => i.id === activeItemId
        )
      )
    : undefined

  const handleModuleClick = (module: NavModule) => {
    if (module.path) {
      setActiveModuleId(module.id)
      setExpandedModuleId(null)
      setActiveItemId(null)
      return
    }
    // Toggle secondary nav independently — sidebar width unaffected
    if (expandedModuleId === module.id) {
      setExpandedModuleId(null)
      // Keep activeItemId so current page stays visible
    } else {
      setActiveModuleId(module.id)
      setExpandedModuleId(module.id)
      setActiveItemId(null)
    }
  }

  const handleToggleSidebar = () => setSidebarCollapsed((c) => !c)

  const handleItemClick = (id: string) => setActiveItemId(id)

  const handleCloseSecondary = () => {
    setExpandedModuleId(null)
    // Keep activeItemId so current page stays visible after closing secondary nav
  }

  const navigateTo = useCallback((moduleId: string, itemId?: string) => {
    const module = menuModules.find((m) => m.id === moduleId)
    if (!module) return
    setActiveModuleId(moduleId)
    if (module.path) {
      setExpandedModuleId(null)
      setActiveItemId(null)
    } else {
      setExpandedModuleId(moduleId)
      setActiveItemId(itemId ?? null)
    }
  }, [])

  const pageContent = activeItemId
    ? renderPage(activeItemId, activeItemModule)
    : children

  return (
    <NavigationContext.Provider value={{ navigateTo }}>
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        background: '#f5f5f5',
        padding: 8,
        gap: 8,
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Primary Sidebar — colapso independente do secondary nav */}
      <Sidebar
        modules={menuModules}
        mode={sidebarCollapsed ? 'icon-only' : 'full'}
        activeModuleId={activeModuleId}
        expandedModuleId={expandedModuleId}
        onModuleClick={handleModuleClick}
        onToggle={handleToggleSidebar}
      />

      {/* Outer card #fafafa */}
      <div
        style={{
          flex: 1,
          background: '#fafafa',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          padding: 8,
          gap: 8,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Topbar expandedModule={expandedModule} activeItemId={activeItemId} />

        <div style={{ flex: 1, display: 'flex', gap: 8, overflow: 'hidden' }}>
          {hasSecondaryNav && expandedModule && (
            <SecondaryNav
              module={expandedModule}
              activeItemId={activeItemId}
              onItemClick={handleItemClick}
              onClose={handleCloseSecondary}
            />
          )}

          <div
            style={{
              flex: 1,
              overflow: 'auto',
              minWidth: 0,
            }}
          >
            {pageContent}
          </div>
        </div>
      </div>
    </div>
    </NavigationContext.Provider>
  )
}
