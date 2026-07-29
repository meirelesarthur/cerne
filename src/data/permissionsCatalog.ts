import { menuModules, type NavModule, type NavGroup, type NavSubItem } from './menuData'

export interface PermissionNode {
  id: string
  label: string
  /** Ausente = nó-folha (permissão selecionável). Presente = nó de agregação (módulo/grupo/funcionalidade), nunca selecionável diretamente. */
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

/** Folhas de ação de sub-recurso (ex.: Formulação/Batida dentro de Fábrica) — alimentam a coluna agregada "Documentos" da matriz. Populado durante a construção do catálogo. */
const documentLeafIds = new Set<string>()

function buildActionLeaves(itemId: string, actions: ActionDef[]): PermissionNode[] {
  return actions.map((action) => ({ id: `${itemId}.${action.key}`, label: action.label }))
}

function buildFeatureNode(item: NavSubItem, actions: ActionDef[]): PermissionNode {
  if (item.children && item.children.length > 0) {
    // Sub-recurso aninhado real (ex.: Fábrica > Formulação/Batida) — as ações
    // desses filhos alimentam a coluna "Documentos" da funcionalidade-pai,
    // agregadas num único indicador (não viram linhas próprias na matriz).
    const subLeaves = item.children.flatMap((child) => {
      const leaves = buildActionLeaves(child.id, ACTIONS_FULL)
      leaves.forEach((leaf) => documentLeafIds.add(leaf.id))
      return leaves
    })
    return {
      id: `perm-feat-${item.id}`,
      label: item.label,
      children: subLeaves,
    }
  }
  return {
    id: `perm-feat-${item.id}`,
    label: item.label,
    children: buildActionLeaves(item.id, actions),
  }
}

function buildGroupNode(group: NavGroup, actions: ActionDef[]): PermissionNode {
  const features = group.items
    .filter((item) => !SKIP_ITEM_IDS.has(item.id))
    .map((item) => buildFeatureNode(item, actions))
  return {
    id: `perm-group-${group.id}`,
    label: group.label,
    children: features,
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

  if (module.groups) {
    return {
      id: `perm-mod-${module.id}`,
      label: module.label,
      children: module.groups.map((group) => buildGroupNode(group, actions)),
    }
  }

  const items: NavSubItem[] = module.flatItems ?? []
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
 * módulo > grupo (quando existir) > funcionalidade > ação. Fonte única
 * (Lei 2): qualquer tela nova adicionada ao menu real vira automaticamente
 * uma permissão atribuível.
 */
export function buildPermissionCatalog(): PermissionNode[] {
  documentLeafIds.clear()
  return menuModules.filter((module) => !SKIP_MODULE_IDS.has(module.id)).map(buildModuleNode)
}

export const PERMISSION_CATALOG: PermissionNode[] = buildPermissionCatalog()

/** Folhas que representam ações de sub-recurso (coluna "Documentos" da matriz) — congelado após a construção do catálogo. */
export const DOCUMENT_LEAF_IDS: Set<string> = new Set(documentLeafIds)

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
