import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PermissionTreeField } from './PermissionTreeField'
import { PERMISSION_CATALOG, LEAF_IDS_BY_NODE } from '../../data/permissionsCatalog'

const meta: Meta<typeof PermissionTreeField> = {
  title: 'GB CERNE/PermissionTreeField',
  component: PermissionTreeField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480, fontFamily: "'Outfit', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PermissionTreeField>

// Amostra reduzida (2 módulos) para manter a story legível.
const AMOSTRA = PERMISSION_CATALOG.slice(0, 2)

// ─── Sem seleção ────────────────────────────────────────────────────────────────

export const SemSelecao: Story = {
  name: 'Sem seleção',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <PermissionTreeField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Com seleção parcial (demonstra tri-state) ─────────────────────────────────

export const ComSelecaoParcial: Story = {
  name: 'Com seleção parcial',
  render: () => {
    const primeiraFuncionalidade = AMOSTRA[1].children?.[0]
    const segundaFuncionalidade = AMOSTRA[1].children?.[1]
    const initial = [
      ...(primeiraFuncionalidade ? LEAF_IDS_BY_NODE.get(primeiraFuncionalidade.id) ?? [] : []),
      ...(segundaFuncionalidade ? [LEAF_IDS_BY_NODE.get(segundaFuncionalidade.id)?.[0] ?? ''] : []),
    ].filter(Boolean)
    const [selected, setSelected] = useState<string[]>(initial)
    return <PermissionTreeField tree={AMOSTRA} selected={selected} onChange={setSelected} />
  },
}

// ─── Árvore completa (catálogo real, ~622 permissões) ──────────────────────────

export const ArvoreCompleta: Story = {
  name: 'Árvore completa (catálogo real)',
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return <PermissionTreeField tree={PERMISSION_CATALOG} selected={selected} onChange={setSelected} />
  },
}
