import { HugeiconsIcon } from '@hugeicons/react'
import { icons, type IconName } from '../../design/icons'
import { t } from '../../design/tokens'

export type { IconName }

type IconSize = keyof typeof t.icon

export interface IconProps {
  /** Papel do ícone no sistema (`edit`, `delete`, `harvest`) — ver `design/icons.ts`. */
  name: IconName
  /** Degrau da escala (`t.icon.*`) ou pixels. Default: `sm`. */
  size?: IconSize | number
  /** Cor do traço. Default: herda do contexto via `currentColor`. */
  color?: string
  /**
   * Rótulo para leitor de tela. Ausente, o ícone é decorativo
   * (`aria-hidden`) — o correto quando há texto ao lado.
   */
  label?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Ícone do sistema. Única forma de renderizar um ícone no projeto — página
 * nenhuma importa biblioteca de ícone direto (Lei 1).
 *
 * O traço vem de `t.stroke.icon` e não é configurável por chamada: espessura é
 * decisão do sistema, não da tela (Lei 3). O desenho de cada papel está em
 * `design/icons.ts`, o único ponto que conhece a família (Lei 2).
 *
 * ```tsx
 * <Icon name="edit" />                       // decorativo, tamanho sm
 * <Icon name="delete" size="md" />           // degrau da escala
 * <Icon name="warning" color={t.color.feedback.warning.solid} />
 * <Icon name="close" label="Fechar" />       // sem texto ao lado → rotulado
 * ```
 */
export function Icon({
  name,
  size = 'sm',
  color = 'currentColor',
  label,
  className,
  style,
}: IconProps) {
  const px = typeof size === 'number' ? size : t.icon[size]

  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={px}
      color={color}
      strokeWidth={t.stroke.icon}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ flexShrink: 0, ...style }}
    />
  )
}
