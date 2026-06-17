import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroup } from './RadioGroup'
import { ThemeProvider } from '../../context/ThemeContext'

const meta: Meta<typeof RadioGroup> = {
  title: 'GB CERNE/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'RadioGroup totalmente acessível (WCAG 2.1 AA). Inputs nativos com `opacity:0` (nunca `display:none`), overlays visuais `aria-hidden`. Suporta orientação vertical/horizontal, descrição por opção, estados de erro e disabled. Gera `id` único com `useId()` por opção.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    disabled:    { control: 'boolean' },
    required:    { control: 'boolean' },
    error:       { control: 'text' },
    hint:        { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof RadioGroup>

// ─── Dados reutilizáveis ──────────────────────────────────────────────────────

const exploracaoOptions = [
  { value: 'agricola',     label: 'Agrícola' },
  { value: 'pecuario',     label: 'Pecuário' },
  { value: 'misto',        label: 'Misto' },
  { value: 'silvicultura', label: 'Silvicultura' },
  { value: 'piscicultura', label: 'Piscicultura' },
]

const planoOptions = [
  {
    value: 'basico',
    label: 'Básico',
    description: 'Até 3 fazendas e 5 safras por ciclo. Ideal para pequenos produtores.',
  },
  {
    value: 'profissional',
    label: 'Profissional',
    description: 'Até 15 fazendas, safras ilimitadas e relatórios avançados.',
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Sem limites. Suporte dedicado e integrações customizadas.',
    disabled: true,
  },
]

// ─── Stories individuais ──────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => {
    const [val, setVal] = useState('agricola')
    return (
      <RadioGroup
        label="Tipo de Exploração"
        name="exploracao"
        options={exploracaoOptions}
        value={val}
        onChange={setVal}
      />
    )
  },
}

export const Horizontal: Story = {
  render: () => {
    const [val, setVal] = useState('agricola')
    return (
      <RadioGroup
        label="Tipo de Exploração"
        name="exploracao-h"
        options={exploracaoOptions}
        value={val}
        onChange={setVal}
        orientation="horizontal"
      />
    )
  },
}

export const ComDescricao: Story = {
  render: () => {
    const [val, setVal] = useState('basico')
    return (
      <div style={{ width: 360 }}>
        <RadioGroup
          label="Plano"
          name="plano"
          options={planoOptions}
          value={val}
          onChange={setVal}
          required
        />
      </div>
    )
  },
}

export const ComErro: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return (
      <RadioGroup
        label="Tipo de Exploração"
        name="exploracao-erro"
        options={exploracaoOptions}
        value={val}
        onChange={setVal}
        required
        error="Selecione pelo menos um tipo de exploração para continuar."
      />
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup
      label="Tipo de Exploração"
      name="exploracao-disabled"
      options={exploracaoOptions}
      value="pecuario"
      onChange={() => {}}
      disabled
    />
  ),
}

export const DisabledParcial: Story = {
  render: () => {
    const [val, setVal] = useState('basico')
    return (
      <div style={{ width: 360 }}>
        <RadioGroup
          label="Plano (Enterprise indisponível)"
          name="plano-parcial"
          options={planoOptions}
          value={val}
          onChange={setVal}
        />
      </div>
    )
  },
}

// ─── Interativo ───────────────────────────────────────────────────────────────

export const Interativo: Story = {
  render: () => {
    const [val, setVal] = useState('agricola')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <RadioGroup
          label="Tipo de Exploração"
          name="exploracao-int"
          options={exploracaoOptions}
          value={val}
          onChange={setVal}
          required
          hint="Selecione o tipo principal da propriedade"
        />
        <div
          style={{
            fontSize: 12,
            color: '#6b7280',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Selecionado: <strong>{val || '—'}</strong>
        </div>
      </div>
    )
  },
}

// ─── GBMode ───────────────────────────────────────────────────────────────────

export const GBMode: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultMode="gbMode">
        <div
          style={{
            background: '#051008',
            padding: 32,
            borderRadius: 12,
            minWidth: 320,
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => {
    const [val, setVal] = useState('profissional')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <RadioGroup
          label="Tipo de Exploração"
          name="exploracao-gb"
          options={exploracaoOptions}
          value={val}
          onChange={setVal}
        />
        <RadioGroup
          label="Plano"
          name="plano-gb"
          options={planoOptions}
          value="basico"
          onChange={() => {}}
          required
          error="Selecione um plano para continuar."
        />
      </div>
    )
  },
}
