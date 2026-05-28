import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'GB CERNE/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Checkbox totalmente acessível (WCAG 2.1 AA). Input nativo com `opacity:0` (nunca `display:none`), overlay visual aria-hidden. Gera `id` único com `useId()`. Suporta estados `checked`, `indeterminate` e `disabled`.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked:  { control: 'boolean' },
    disabled: { control: 'boolean' },
    label:    { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

// ─── Stories individuais ──────────────────────────────────────────────────────

export const Unchecked: Story = {
  args: { label: 'Manter conectado', checked: false, onChange: () => {} },
}

export const Checked: Story = {
  args: { label: 'Manter conectado', checked: true, onChange: () => {} },
}

export const Disabled: Story = {
  args: { label: 'Opção desativada', checked: false, disabled: true, onChange: () => {} },
}

export const DisabledChecked: Story = {
  args: { label: 'Opção selecionada desativada', checked: true, disabled: true, onChange: () => {} },
}

// ─── Interativo ───────────────────────────────────────────────────────────────

export const Interativo: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Checkbox label="Manter conectado" checked={checked} onChange={setChecked} />
        <Checkbox label="Receber notificações por e-mail" checked={!checked} onChange={() => setChecked(c => !c)} />
        <Checkbox label="Aceito os Termos de Uso" checked={false} disabled onChange={() => {}} />
      </div>
    )
  },
}

// ─── Grupo de opções ──────────────────────────────────────────────────────────

export const GrupoOpcoes: Story = {
  render: () => {
    const opcoes = ['Agrícola', 'Pecuário', 'Misto', 'Silvicultura', 'Piscicultura']
    const [selecionados, setSelecionados] = useState<Set<string>>(new Set(['Agrícola']))

    const toggle = (op: string) => setSelecionados(prev => {
      const next = new Set(prev)
      next.has(op) ? next.delete(op) : next.add(op)
      return next
    })

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
          Tipo de Exploração
        </span>
        {opcoes.map(op => (
          <Checkbox
            key={op}
            label={op}
            checked={selecionados.has(op)}
            onChange={() => toggle(op)}
          />
        ))}
      </div>
    )
  },
}
