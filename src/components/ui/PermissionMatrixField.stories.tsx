import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PermissionMatrixField } from './PermissionMatrixField'
import { PERMISSION_CATALOG, LEAF_IDS_BY_NODE } from '../../data/permissionsCatalog'

const meta: Meta<typeof PermissionMatrixField> = {
  title: 'GB CERNE/PermissionMatrixField',
  component: PermissionMatrixField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 820, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PermissionMatrixField>

// Amostra reduzida (2 módulos, incluindo um com grupos e sub-recurso aninhado) para manter a story legível.
const ADMINISTRATIVO = PERMISSION_CATALOG.find((m) => m.label === 'Administrativo')!
const DASHBOARDS = PERMISSION_CATALOG.find((m) => m.label === 'Dashboards')!
const AMOSTRA = [DASHBOARDS, ADMINISTRATIVO]

const ESTOQUE_GROUP = ADMINISTRATIVO.children?.find((g) => g.label === 'Estoque')
const FABRICA = ESTOQUE_GROUP?.children?.find((f) => f.label === 'Fábrica')

// ─── Sem seleção ────────────────────────────────────────────────────────────────

export const SemSelecao: Story = {
  name: 'Sem seleção',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <PermissionMatrixField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Com seleção parcial (demonstra tri-state, grupo e coluna Documentos) ──────

export const ComSelecaoParcial: Story = {
  name: 'Com seleção parcial (grupo + Documentos)',
  render: () => {
    const outraFuncionalidade = ESTOQUE_GROUP?.children?.[0]
    const initial = [
      ...(FABRICA ? LEAF_IDS_BY_NODE.get(FABRICA.id) ?? [] : []), // seleciona toda a coluna Documentos de Fábrica
      ...(outraFuncionalidade ? [LEAF_IDS_BY_NODE.get(outraFuncionalidade.id)?.[0] ?? ''] : []), // seleciona só "Visualizar" de outra funcionalidade
    ].filter(Boolean)
    const [selected, setSelected] = useState<string[]>(initial)
    return <PermissionMatrixField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Árvore completa (catálogo real, ~622 permissões) ──────────────────────────

export const ArvoreCompleta: Story = {
  name: 'Catálogo completo',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <PermissionMatrixField tree={PERMISSION_CATALOG} selected={selected} onChange={setSelected} />
  },
}

// ─── Consulta — sem affordance de edição ─────────────────────────────────────

export const VisualizacaoSemSelecao: Story = {
  name: 'Visualização — sem seleção',
  args: { tree: AMOSTRA, selected: [], mode: 'view' },
}

export const VisualizacaoParcial: Story = {
  name: 'Visualização — seleção parcial',
  args: {
    tree: AMOSTRA,
    selected: ESTOQUE_GROUP ? (LEAF_IDS_BY_NODE.get(ESTOQUE_GROUP.id) ?? []).slice(0, 2) : [],
    mode: 'view',
  },
}

export const VisualizacaoCompleta: Story = {
  name: 'Visualização — seleção completa',
  args: {
    tree: AMOSTRA,
    selected: AMOSTRA.flatMap((node) => LEAF_IDS_BY_NODE.get(node.id) ?? []),
    mode: 'view',
  },
}
