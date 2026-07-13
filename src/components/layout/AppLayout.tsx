import { useState, useCallback } from 'react'
import Sidebar from './Sidebar'
import SecondaryNav from './SecondaryNav'
import Topbar from './Topbar'
import { useTheme } from '../../context/ThemeContext'
import { FarmProvider } from '../../context/FarmContext'
import { t } from '../../design/tokens'
import PerfilUsuario from '../../pages/PerfilUsuario'
import FazendasPage      from '../../pages/cadastros/fazendas/FazendasPage'
import SafrasPage        from '../../pages/cadastros/safras/SafrasPage'
import CentrosCustoPage  from '../../pages/cadastros/centros-custo/CentrosCustoPage'
import EmbalagensPage    from '../../pages/cadastros/embalagens/EmbalagensPage'
import EnderecosPage     from '../../pages/cadastros/enderecos/EnderecosPage'
import ArmazensPage      from '../../pages/cadastros/armazens/ArmazensPage'
import ProdutosPage      from '../../pages/cadastros/produtos/ProdutosPage'
import EstoquesIniciaisPage from '../../pages/cadastros/estoques-iniciais/EstoquesIniciaisPage'
import PessoasPage        from '../../pages/cadastros/pessoas/PessoasPage'
import Pluviometria      from '../../pages/dashboards/Pluviometria'
import OverviewPanel     from '../../pages/dashboards/OverviewPanel'
import DashFinanceiro    from '../../pages/dashboards/DashFinanceiro'
import DashSuprimentos   from '../../pages/dashboards/DashSuprimentos'
import DashPecuaria      from '../../pages/dashboards/DashPecuaria'
import DashDepreciacoes  from '../../pages/dashboards/DashDepreciacoes'
import DashAtivos        from '../../pages/dashboards/DashAtivos'
import DashUsuarios      from '../../pages/dashboards/DashUsuarios'
import DashLivroCaixa   from '../../pages/dashboards/DashLivroCaixa'
import DashLotacaoCurrais from '../../pages/dashboards/DashLotacaoCurrais'
import DashDesempenhoLotes from '../../pages/dashboards/DashDesempenhoLotes'
import DashEstoqueNutricao from '../../pages/dashboards/DashEstoqueNutricao'
import DashConsumoRacao   from '../../pages/dashboards/DashConsumoRacao'
import DashCustosConfinamento from '../../pages/dashboards/DashCustosConfinamento'
import PlanosPage        from '../../pages/planos/PlanosPage'
import { menuModules, type NavModule, type NavGroup } from '../../data/menuData'
import { Construction } from 'lucide-react'
import { NavigationContext } from '../../context/NavigationContext'

interface AppLayoutProps {
  children: React.ReactNode
}

function FuncionalidadePlaceholder({ itemId, module }: { itemId: string; module?: NavModule }) {
  const { colors } = useTheme()
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
          background: colors.accent.subtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Construction size={24} color={colors.accent.default} strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: t.font.size.lg, fontWeight: 600, color: colors.fg.default, fontFamily: t.font.family.sans, marginBottom: 4 }}>
          {item?.label ?? 'Funcionalidade'}
        </div>
        <div style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
          Esta tela será implementada em breve.
        </div>
      </div>
    </div>
  )
}

function renderPage(itemId: string | null, module?: NavModule) {
  if (!itemId) return null
  if (itemId === 'cad-pes-per') return <PerfilUsuario />
  if (itemId === 'cad-pes-uni') return <PessoasPage />
  if (itemId === 'cad-est-faz') return <FazendasPage />
  if (itemId === 'cad-est-saf') return <SafrasPage />
  if (itemId === 'cad-est-cc')  return <CentrosCustoPage />
  if (itemId === 'cad-est-emb')      return <EmbalagensPage />
  if (itemId === 'cad-est-end')      return <EnderecosPage />
  if (itemId === 'cad-est-arm')      return <ArmazensPage />
  if (itemId === 'cad-est-pro-lista') return <ProdutosPage />
  if (itemId === 'cad-est-sal-ini')  return <EstoquesIniciaisPage />
  if (itemId === 'dash-overview') return <OverviewPanel />
  if (itemId === 'dash-plu' || itemId === 'ope-plu') return <Pluviometria />
  if (itemId === 'dash-fin')  return <DashFinanceiro />
  if (itemId === 'dash-sup')  return <DashSuprimentos />
  if (itemId === 'dash-pec')  return <DashPecuaria />
  if (itemId === 'dash-dep')  return <DashDepreciacoes />
  if (itemId === 'dash-ati')  return <DashAtivos />
  if (itemId === 'dash-usr')  return <DashUsuarios />
  if (itemId === 'dash-lcx')  return <DashLivroCaixa />
  if (itemId === 'dash-cur')  return <DashLotacaoCurrais />
  if (itemId === 'dash-des')  return <DashDesempenhoLotes />
  if (itemId === 'dash-nut')  return <DashEstoqueNutricao />
  if (itemId === 'dash-rac')  return <DashConsumoRacao />
  if (itemId === 'dash-cco')  return <DashCustosConfinamento />
  if (itemId === 'planos')    return <PlanosPage />
  return <FuncionalidadePlaceholder itemId={itemId} module={module} />
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { colors } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeModuleId, setActiveModuleId] = useState<string>('painel')
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  const expandedModule = menuModules.find((m) => m.id === expandedModuleId)
  const hasSecondaryNav = expandedModuleId !== null

  // Module that owns the active item — stays stable even when secondary nav is closed
  const activeItemModule = activeItemId
    ? menuModules.find((m) => {
        const allItems = [
          ...(m.flatItems ?? []),
          ...(m.groups?.flatMap((g) => g.items) ?? []),
        ]
        return allItems.some(
          (i) => i.id === activeItemId || i.children?.some((c) => c.id === activeItemId)
        )
      })
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

  const handleOpenPlanos = () => {
    setExpandedModuleId(null)
    setActiveItemId('planos')
  }

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
    <FarmProvider>
    <NavigationContext.Provider value={{ navigateTo }}>
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        background: colors.bg.canvas,
        padding: t.space[2],
        gap: t.space[2],
        boxSizing: 'border-box',
        fontFamily: t.font.family.sans,
        transition: 'background 0.2s ease',
      }}
    >
      {/* Primary Sidebar */}
      <Sidebar
        modules={menuModules}
        mode={sidebarCollapsed ? 'icon-only' : 'full'}
        activeModuleId={activeModuleId}
        expandedModuleId={expandedModuleId}
        onModuleClick={handleModuleClick}
        onToggle={handleToggleSidebar}
        onOpenPlanos={handleOpenPlanos}
        planosActive={activeItemId === 'planos'}
      />

      {/* Outer content card */}
      <div
        style={{
          flex: 1,
          background: colors.bg.outer,
          borderRadius: t.radius['2xl'],
          display: 'flex',
          flexDirection: 'column',
          padding: t.space[2],
          gap: t.space[2],
          minWidth: 0,
          overflow: 'hidden',
          transition: 'background 0.2s ease',
        }}
      >
        <Topbar expandedModule={expandedModule} activeItemId={activeItemId} />

        <div style={{ flex: 1, display: 'flex', gap: t.space[2], overflow: 'hidden', marginLeft: hasSecondaryNav && expandedModule ? -t.space[2] : 0 }}>
          {hasSecondaryNav && expandedModule && (
            <SecondaryNav
              module={expandedModule}
              activeItemId={activeItemId}
              onItemClick={handleItemClick}
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
    </FarmProvider>
  )
}
