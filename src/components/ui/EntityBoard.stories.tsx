import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EntityBoard, type BoardGroup } from './EntityBoard'

const meta = {
  title: 'GB CERNE/EntityBoard',
  component: EntityBoard,
} satisfies Meta<typeof EntityBoard>

export default meta
type Story = StoryObj<typeof meta>

export const CurraisPorSetor: Story = {
  args: { groups: [], onMove: () => undefined },
  render: () => {
    const [groups, setGroups] = useState<BoardGroup[]>([
      { id: 'a', label: 'Setor A', items: [{ id: '1', label: 'Curral A-01', occupancy: 82, capacity: 100 }] },
      { id: 'b', label: 'Setor B', items: [{ id: '2', label: 'Curral B-01', occupancy: 118, capacity: 100 }] },
    ])
    return <EntityBoard groups={groups} onMove={(entityId, sourceId, targetId) => setGroups((current) => {
      const entity = current.find((group) => group.id === sourceId)?.items.find((item) => item.id === entityId)
      if (!entity) return current
      return current.map((group) => group.id === sourceId ? { ...group, items: group.items.filter((item) => item.id !== entityId) } : group.id === targetId ? { ...group, items: [...group.items, entity] } : group)
    })} />
  },
}
