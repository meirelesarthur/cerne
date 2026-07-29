import { menuModules, type NavModule, type NavSubItem } from './menuData'

export interface PermissionNode {
  id: string
  label: string
  /** Ausente = nó-folha (permissão selecionável). Presente = nó de agregação (módulo/funcionalidade/sub-recurso), nunca selecionável diretamente. */
  children?: PermissionNode[]
}

interface ActionDef {
  key: string
  label: string
}

const ACTIONS_FULL: ActionDef[] = [
  { key: 'view', label: 'Visualizar' },
  { key: 'create', label: 'Criar' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Deletar' },
]

const ACTIONS_VIEW_ONLY: ActionDef[] = [{ key: 'view', label: 'Visualizar' }]

/** Módulos cujas telas são só leitura (dashboards/relatórios/painel) — recebem apenas a ação Visualizar. */
const VIEW_ONLY_MODULE_IDS = new Set(['dashboards', 'relatorios', 'painel'])

/** Módulos que não são domínio de permissão (view pessoal, não administrável). */
const SKIP_MODULE_IDS = new Set(['favoritos'])

/** Itens de menu self-service, não atribuíveis como permissão de terceiros. */
const SKIP_ITEM_IDS = new Set(['cad-pes-per'])

function buildActionLeaves(itemId: string, actions: ActionDef[]): PermissionNode[] {
  return actions.map((action) => ({ id: `${itemId}.${action.key}`, label: action.label }))
}

function buildFeatureNode(item: NavSubItem, actions: ActionDef[]): PermissionNode {
  if (item.children && item.children.length > 0) {
    // Sub-recurso aninhado real (ex.: Fábrica > Formulação/Batida) — nível extra
    // de árvore, cada sub-recurso com seu próprio conjunto de ações.
    return {
      id: `perm-feat-${item.id}`,
      label: item.label,
      children: item.children.map((child) => ({
        id: `perm-sub-${child.id}`,
        label: child.label,
        children: buildActionLeaves(child.id, ACTIONS_FULL),
      })),
    }
  }
  return {
    id: `perm-feat-${item.id}`,
    label: item.label,
    children: buildActionLeaves(item.id, actions),
  }
}

function buildModuleNode(module: NavModule): PermissionNode {
  const actions = VIEW_ONLY_MODULE_IDS.has(module.id) ? ACTIONS_VIEW_ONLY : ACTIONS_FULL

  // `painel` (Home) não tem flatItems/groups — é uma única tela de leitura.
  if (module.id === 'painel') {
    return {
      id: `perm-mod-${module.id}`,
      label: module.label,
      children: [
        {
          id: 'perm-feat-painel-home',
          label: module.label,
          children: buildActionLeaves('painel-home', ACTIONS_VIEW_ONLY),
        },
      ],
    }
  }

  const items: NavSubItem[] = module.flatItems ?? module.groups?.flatMap((group) => group.items) ?? []

  const features = items
    .filter((item) => !SKIP_ITEM_IDS.has(item.id))
    .map((item) => buildFeatureNode(item, actions))

  return {
    id: `perm-mod-${module.id}`,
    label: module.label,
    children: features,
  }
}

/**
 * Deriva o catálogo de permissões diretamente do menu real (`menuData.ts`) —
 * módulo > funcionalidade > ação (com um nível extra de sub-recurso quando o
 * item de menu já tem `children`). Fonte única (Lei 2): qualquer tela nova
 * adicionada ao menu real vira automaticamente uma permissão atribuível.
 */
export function buildPermissionCatalog(): PermissionNode[] {
  return menuModules.filter((module) => !SKIP_MODULE_IDS.has(module.id)).map(buildModuleNode)
}

export const PERMISSION_CATALOG: PermissionNode[] = buildPermissionCatalog()

function buildLeafIndex(nodes: PermissionNode[]): Map<string, string[]> {
  const map = new Map<string, string[]>()

  function collectLeaves(node: PermissionNode): string[] {
    if (!node.children || node.children.length === 0) {
      map.set(node.id, [node.id])
      return [node.id]
    }
    const leaves = node.children.flatMap(collectLeaves)
    map.set(node.id, leaves)
    return leaves
  }

  nodes.forEach(collectLeaves)
  return map
}

/** Mapa nó (de qualquer nível, incluindo folhas) → ids de folha descendentes. Base da contagem "X/Y" e da cascata de seleção. */
export const LEAF_IDS_BY_NODE: Map<string, string[]> = buildLeafIndex(PERMISSION_CATALOG)

/** União de todas as folhas do catálogo — usada para sanitizar `permissoes` salvas contra drift do catálogo. */
export const ALL_LEAF_IDS: Set<string> = new Set([...LEAF_IDS_BY_NODE.values()].flat())
