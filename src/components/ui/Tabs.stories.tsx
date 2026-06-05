import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'GB CERNE/Tabs',
  component: Tabs,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

const items = [
  { id: 'mes',  label: 'Mês' },
  { id: 'tri',  label: 'Trimestre' },
  { id: 'ano',  label: 'Ano' },
]

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('mes')
    return <Tabs items={items} activeId={active} onChange={setActive} />
  },
}
