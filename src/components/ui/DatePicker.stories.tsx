import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatePicker, DateRangePicker } from './DatePicker'
import { ThemeProvider } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DatePicker> = {
  title: 'GB CERNE/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'DatePicker e DateRangePicker hand-rolled (sem libs externas). ' +
          'Exibição PT-BR (DD/MM/AAAA); valor interno/props em ISO YYYY-MM-DD. ' +
          'Dois temas (light / GBMode). Popover ancorado abaixo do trigger com ' +
          'fechamento por Escape e clique externo.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 320, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DatePicker>

// ─── DatePicker — estado vazio ────────────────────────────────────────────────

export const Vazio: Story = {
  render: () => {
    const [v, setV] = useState<string | null>(null)
    return (
      <DatePicker
        label="Data de referência"
        value={v}
        onChange={setV}
        placeholder="Selecionar data"
      />
    )
  },
}

// ─── DatePicker — com data selecionada ────────────────────────────────────────

export const ComData: Story = {
  render: () => {
    const [v, setV] = useState<string | null>('2025-06-15')
    return (
      <DatePicker
        label="Data de referência"
        required
        value={v}
        onChange={setV}
      />
    )
  },
}

// ─── DatePicker — com min e max ───────────────────────────────────────────────

export const ComMinMax: Story = {
  render: () => {
    const [v, setV] = useState<string | null>(null)
    return (
      <DatePicker
        label="Data da colheita"
        hint="Apenas datas entre 01/06/2025 e 30/09/2025"
        value={v}
        onChange={setV}
        min="2025-06-01"
        max="2025-09-30"
      />
    )
  },
}

// ─── DatePicker — estado de erro ──────────────────────────────────────────────

export const ComErro: Story = {
  render: () => {
    const [v, setV] = useState<string | null>(null)
    return (
      <DatePicker
        label="Data de plantio"
        required
        value={v}
        onChange={setV}
        error="Campo obrigatório — selecione uma data para continuar."
      />
    )
  },
}

// ─── DatePicker — disabled ────────────────────────────────────────────────────

export const Desabilitado: Story = {
  render: () => (
    <DatePicker
      label="Data (bloqueada)"
      value="2025-03-20"
      onChange={() => {}}
      disabled
    />
  ),
}

// ─── DateRangePicker — vazio ──────────────────────────────────────────────────

export const RangeVazio: Story = {
  render: () => {
    const [v, setV] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })
    return (
      <DateRangePicker
        label="Período da safra"
        value={v}
        onChange={setV}
      />
    )
  },
}

// ─── DateRangePicker — com intervalo ─────────────────────────────────────────

export const RangeComIntervalo: Story = {
  render: () => {
    const [v, setV] = useState<{ start: string | null; end: string | null }>({
      start: '2025-04-01',
      end:   '2025-04-18',
    })
    return (
      <DateRangePicker
        label="Período da safra"
        required
        value={v}
        onChange={setV}
      />
    )
  },
}

// ─── DateRangePicker — com erro ───────────────────────────────────────────────

export const RangeComErro: Story = {
  render: () => {
    const [v, setV] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })
    return (
      <DateRangePicker
        label="Período de monitoramento"
        required
        value={v}
        onChange={setV}
        error="Selecione as datas inicial e final do período."
      />
    )
  },
}

// ─── DateRangePicker — disabled ───────────────────────────────────────────────

export const RangeDesabilitado: Story = {
  render: () => (
    <DateRangePicker
      label="Período (bloqueado)"
      value={{ start: '2025-01-01', end: '2025-01-31' }}
      onChange={() => {}}
      disabled
    />
  ),
}

// ─── GBMode — DatePicker ──────────────────────────────────────────────────────

export const GBModeDatePicker: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultMode="gbMode">
        <div style={{ minWidth: 320, padding: 24, background: '#051008', borderRadius: 12 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => {
    const [v, setV] = useState<string | null>('2025-06-15')
    return (
      <DatePicker
        label="Data de referência"
        required
        value={v}
        onChange={setV}
      />
    )
  },
}

// ─── GBMode — DateRangePicker ─────────────────────────────────────────────────

export const GBModeDateRangePicker: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultMode="gbMode">
        <div style={{ minWidth: 320, padding: 24, background: '#051008', borderRadius: 12 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => {
    const [v, setV] = useState<{ start: string | null; end: string | null }>({
      start: '2025-05-10',
      end:   '2025-05-28',
    })
    return (
      <DateRangePicker
        label="Período da safra"
        required
        value={v}
        onChange={setV}
      />
    )
  },
}

// ─── Interativo combinado ─────────────────────────────────────────────────────

export const CombinacaoCompleta: Story = {
  render: () => {
    const [plantio, setPlantio]   = useState<string | null>(null)
    const [colheita, setColheita] = useState<string | null>(null)
    const [periodo, setPeriodo]   = useState<{ start: string | null; end: string | null }>({ start: null, end: null })

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 320 }}>
        <DatePicker
          label="Data de plantio"
          required
          value={plantio}
          onChange={setPlantio}
          max={colheita ?? undefined}
        />
        <DatePicker
          label="Data de colheita"
          required
          value={colheita}
          onChange={setColheita}
          min={plantio ?? undefined}
        />
        <DateRangePicker
          label="Período de monitoramento"
          hint="Defina o intervalo que será monitorado"
          value={periodo}
          onChange={setPeriodo}
          min={plantio ?? undefined}
          max={colheita ?? undefined}
        />
        <div style={{ fontSize: t.font.size.xs, color: t.color.neutral[500], fontFamily: t.font.family.sans, paddingTop: 8, borderTop: `1px solid ${t.color.neutral[200]}` }}>
          <div>Plantio: {plantio ?? '—'}</div>
          <div>Colheita: {colheita ?? '—'}</div>
          <div>Período: {periodo.start ?? '—'} → {periodo.end ?? '—'}</div>
        </div>
      </div>
    )
  },
}
