import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AllocationEditor, type AllocationItem } from './AllocationEditor'

const meta = {
  title: 'GB CERNE/AllocationEditor',
  component: AllocationEditor,
} satisfies Meta<typeof AllocationEditor>

export default meta
type Story = StoryObj<typeof meta>

export const RateioFinanceiro: Story = {
  args: { items: [], targetAmount: 0, onChange: () => undefined },
  render: () => {
    const [items, setItems] = useState<AllocationItem[]>([
      { id: '1', label: 'Administrativo', amount: 6000, percent: 60 },
      { id: '2', label: 'Operação agrícola', amount: 4000, percent: 40 },
    ])
    return <AllocationEditor items={items} targetAmount={10000} onChange={setItems} />
  },
}
