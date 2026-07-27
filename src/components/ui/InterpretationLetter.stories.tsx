import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { InterpretationLetter } from './InterpretationLetter'
import { Button } from './Button'
import type { Carta } from '../../insights/overviewInsights'

const meta: Meta<typeof InterpretationLetter> = {
  title: 'GB CERNE/InterpretationLetter',
  component: InterpretationLetter,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof InterpretationLetter>

const CARTA_EXEMPLO: Carta = {
  title: 'Visão Geral',
  scope: 'Período completo · todas as culturas e talhões da fazenda selecionada',
  sections: [
    {
      title: 'Leitura individual — Receitas × despesas mensais',
      paragraphs: [
        'O período cobre 12 meses, com pico de receita em Maio (R$ 620,0K) — a distância entre o melhor e o pior mês é de 6,2×, típica de receita concentrada em janelas de comercialização.',
        'Em 4 de 12 meses as despesas superaram as receitas (Jan, Fev, Mar, Abr). Isso não é necessariamente problema no agro — custeio antecede colheita — mas exige que a sobra dos meses fortes cubra os vales.',
      ],
    },
    {
      title: 'Leitura individual — Resultado operacional e fluxo previsto',
      paragraphs: [
        'O saldo operacional total do período é R$ 482,3K.',
        'A previsão de curto prazo é superavitária: R$ 210,0K a receber contra R$ 96,5K a pagar (saldo R$ 113,5K).',
      ],
    },
    {
      title: 'Sugestões',
      bullets: [
        'Instituir revisão semanal nominal dos títulos a receber vencidos há mais de 30 dias.',
        'Monitorar o breakeven da Soja semanalmente: travar preço quando a folga sobre o custo estiver confortável.',
      ],
    },
    {
      title: 'Provocações para a discussão',
      bullets: [
        'O equilíbrio atual depende do preço das commodities ou sobreviveria a uma queda de 15% no preço médio?',
        'A concentração de receita em poucas culturas é uma escolha de foco ou uma exposição não gerenciada?',
      ],
    },
  ],
  glossary: [
    { term: 'Margem mensal', def: 'receitas menos despesas do mês; a média das metades do período revela tendência sem o ruído de meses isolados.' },
    { term: 'Aging', def: 'distribuição dos títulos em aberto por tempo decorrido; título +30 dias raramente se resolve sem ação ativa.' },
  ],
}

// ─── Padrão ─────────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Ver carta de interpretação</Button>
        <InterpretationLetter open={open} onClose={() => setOpen(false)} carta={CARTA_EXEMPLO} />
      </>
    )
  },
}

// ─── Com fonte identificada ──────────────────────────────────────────────────────

export const ComFonteIdentificada: Story = {
  name: 'Com fonte identificada',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Ver carta de interpretação</Button>
        <InterpretationLetter
          open={open}
          onClose={() => setOpen(false)}
          carta={CARTA_EXEMPLO}
          fonte="Fazenda São João"
        />
      </>
    )
  },
}

// ─── Aberta (estática) ────────────────────────────────────────────────────────────

export const Aberta: Story = {
  name: 'Aberta (estática)',
  render: () => <InterpretationLetter open onClose={() => {}} carta={CARTA_EXEMPLO} />,
}
