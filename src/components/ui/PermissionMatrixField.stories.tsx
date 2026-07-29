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
      <div style={{ width: 640, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PermissionMatrixField>

// Amostra reduzida (2 módulos, incluindo um com sub-recurso aninhado) para manter a story legível.
const ADMINISTRATIVO = PERMISSION_CATALOG.find((m) => m.label === 'Administrativo')!
const DASHBOARDS = PERMISSION_CATALOG.find((m) => m.label === 'Dashboards')!
const AMOSTRA = [DASHBOARDS, ADMINISTRATIVO]

// ─── Sem seleção ────────────────────────────────────────────────────────────────

export const SemSelecao: Story = {
  name: 'Sem seleção',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <PermissionMatrixField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Com seleção parcial (demonstra tri-state e sub-recurso) ───────────────────

export const ComSelecaoParcial: Story = {
  name: 'Com seleção parcial (inclui sub-recurso)',
  render: () => {
    const fabrica = ADMINISTRATIVO.children?.find((f) => f.label === 'Fábrica')
    const outraFuncionalidade = ADMINISTRATIVO.children?.[0]
    const initial = [
      ...(fabrica?.children?.[0] ? LEAF_IDS_BY_NODE.get(fabrica.children[0].id) ?? [] : []), // seleciona toda a "Formulação"
      ...(outraFuncionalidade ? [LEAF_IDS_BY_NODE.get(outraFuncionalidade.id)?.[0] ?? ''] : []), // seleciona só "Visualizar" da primeira funcionalidade
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
