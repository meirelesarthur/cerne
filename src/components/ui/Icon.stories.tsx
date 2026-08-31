import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'
import { icons, type IconName } from '../../design/icons'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

const meta: Meta<typeof Icon> = {
  title: 'GB CERNE/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: Object.keys(icons) },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: { name: 'edit', size: 'md' },
}

export const Escala: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: t.space[6], alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} style={{ display: 'grid', justifyItems: 'center', gap: t.space[2] }}>
          <Icon name="sprout" size={s} color={t.color.brand[600]} />
          <span style={{ fontSize: t.font.size['2xs'], color: t.color.neutral[500] }}>
            {s} · {t.icon[s]}px
          </span>
        </div>
      ))}
    </div>
  ),
}

export const Semantico: Story = {
  name: 'Cor semântica',
  render: () => (
    <div style={{ display: 'flex', gap: t.space[6], alignItems: 'center' }}>
      {(
        [
          ['success', t.color.feedback.success.solid],
          ['warning', t.color.feedback.warning.solid],
          ['error', t.color.feedback.error.solid],
          ['info', t.color.feedback.info.solid],
        ] as const
      ).map(([name, color]) => (
        <Icon key={name} name={name as IconName} size="lg" color={color} />
      ))}
    </div>
  ),
}

/** Catálogo completo — o que existe hoje no registry, por papel. */
export const Catalogo: Story = {
  name: 'Catálogo',
  parameters: { layout: 'padded' },
  render: () => {
    const { colors } = useTheme()
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${t.size.fieldSm}px, 1fr))`,
          gap: t.space[2],
        }}
      >
        {(Object.keys(icons) as IconName[]).map((name) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[3],
              padding: t.space[3],
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: t.radius.base,
              background: colors.bg.surface,
            }}
          >
            <Icon name={name} size="md" color={colors.fg.default} />
            <span
              style={{
                fontSize: t.font.size['2xs'],
                color: colors.fg.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    )
  },
}
