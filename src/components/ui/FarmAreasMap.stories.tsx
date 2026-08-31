import type { Meta, StoryObj } from '@storybook/react-vite'
import { FarmAreasMap } from './FarmAreasMap'
import type { FarmArea } from './FarmAreasMap'
import { t } from '../../design/tokens'

const meta: Meta<typeof FarmAreasMap> = {
  title: 'GB CERNE/FarmAreasMap',
  component: FarmAreasMap,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FarmAreasMap>

const AREAS: FarmArea[] = [
  {
    id: 'T1',
    name: 'Talhão Santa Maria',
    subtitle: '320 ha',
    color: t.color.brand[600],
    icon: 'sprout',
    headline: 'Soja · Em crescimento',
    coords: [
      [-18.7515, -52.6585],
      [-18.7532, -52.6392],
      [-18.7702, -52.6415],
      [-18.7726, -52.6602],
    ],
    groups: [
      {
        title: 'Cultura',
        rows: [
          { label: 'Cultivar', value: 'BMX Zeus IPRO' },
          { label: 'Plantio', value: '12/10' },
          { label: 'Colheita prevista', value: '04/02' },
        ],
      },
      {
        title: 'Lavoura',
        rows: [
          { label: 'Produtividade prevista', value: '64 sc/ha' },
          { label: 'Umidade do solo', value: '68%' },
          { label: 'NDVI', value: '0.74' },
        ],
      },
    ],
  },
  {
    id: 'T2',
    name: 'Talhão Cerrado Norte',
    subtitle: '480 ha',
    color: t.color.feedback.warning.solid,
    icon: 'wheat',
    headline: 'Milho · Germinação',
    coords: [
      [-18.7532, -52.6392],
      [-18.7508, -52.6205],
      [-18.7738, -52.6188],
      [-18.7702, -52.6415],
    ],
    groups: [
      {
        title: 'Cultura',
        rows: [
          { label: 'Cultivar', value: 'DKB 390 PRO4' },
          { label: 'Plantio', value: '08/11' },
          { label: 'Colheita prevista', value: '19/03' },
        ],
      },
      {
        title: 'Manejo',
        rows: [
          { label: 'Última operação', value: 'Semeadura — 08/11' },
          { label: 'Próxima operação', value: 'Cobertura N — 06/12' },
        ],
      },
    ],
  },
  {
    id: 'T3',
    name: 'Talhão Reserva',
    subtitle: '140 ha',
    color: t.color.neutral[400],
    icon: 'trees',
    fillOpacity: 0.2,
    headline: 'Pastagem · Pousio',
    coords: [
      [-18.7726, -52.6602],
      [-18.7702, -52.6415],
      [-18.7935, -52.6389],
      [-18.7918, -52.6571],
    ],
    groups: [
      {
        title: 'Manejo',
        rows: [
          { label: 'Última operação', value: 'Roçada — 02/11' },
          { label: 'Próxima operação', value: 'Calagem — 15/04' },
          { label: 'Lotação', value: '0,4 UA/ha' },
        ],
      },
    ],
  },
]

/** Passe o cursor sobre uma área para abrir o painel de indicadores. */
export const Default: Story = {
  args: { areas: AREAS, height: 420 },
}

/** Sem rótulo permanente — útil em faixas curtas, onde só o ícone cabe. */
export const SemRotulos: Story = {
  args: { areas: AREAS, height: 420, showLabels: false },
}

/** Uma única área demarcada — o enquadramento se ajusta ao polígono. */
export const AreaUnica: Story = {
  args: { areas: [AREAS[0]], height: 420 },
}
