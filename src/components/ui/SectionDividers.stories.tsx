import type { Meta, StoryObj } from '@storybook/react-vite'
import { HDivider, VDivider } from './SectionDividers'
import { useTheme } from '../../context/ThemeContext'
import { t } from '../../design/tokens'

const meta: Meta = {
  title: 'GB CERNE/SectionDividers',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Divisores com esmaecimento nas pontas (fade) usados entre linhas/colunas empilhadas dentro de um único card de dashboard — `HDivider` (horizontal) e `VDivider` (vertical).',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Horizontal: Story = {
  render: () => {
    const { colors } = useTheme()
    return (
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: t.space[3], fontFamily: t.font.family.sans, fontSize: t.font.size.sm, color: colors.fg.default }}>
        <div>Linha de conteúdo 1</div>
        <HDivider color={colors.border.default} />
        <div>Linha de conteúdo 2</div>
        <HDivider color={colors.border.default} />
        <div>Linha de conteúdo 3</div>
      </div>
    )
  },
}

export const Vertical: Story = {
  render: () => {
    const { colors } = useTheme()
    return (
      <div style={{ height: 120, display: 'flex', alignItems: 'stretch', gap: t.space[4], fontFamily: t.font.family.sans, fontSize: t.font.size.sm, color: colors.fg.default }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>Coluna 1</div>
        <VDivider color={colors.border.default} />
        <div style={{ display: 'flex', alignItems: 'center' }}>Coluna 2</div>
        <VDivider color={colors.border.default} />
        <div style={{ display: 'flex', alignItems: 'center' }}>Coluna 3</div>
      </div>
    )
  },
}
