import { useState } from 'react'
import { t } from '../../design/tokens'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name:   string
  src?:   string
  size?:  AvatarSize
}

const sizePx: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
}

const fontFor: Record<AvatarSize, number> = {
  sm: t.font.size.xs,
  md: t.font.size.base,
  lg: t.font.size.lg,
  xl: t.font.size['2xl'],
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Avatar de usuário com iniciais sobre gradiente brand, ou imagem quando
 * `src` é fornecido (com fallback para iniciais se a imagem falhar).
 * Substitui os `<div>` de avatar recriados inline em Topbar e PerfilUsuario.
 */
export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const px = sizePx[size]
  const showImg = src && !imgError

  return (
    <div
      role="img"
      aria-label={name}
      style={{
        width:          px,
        height:         px,
        borderRadius:   t.radius.full,
        flexShrink:     0,
        overflow:       'hidden',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     showImg
          ? undefined
          : `linear-gradient(135deg, ${t.color.brand[500]}, ${t.color.brand[700]})`,
        color:          t.color.neutral[0],
        fontSize:       fontFor[size],
        fontWeight:     t.font.weight.semibold,
        fontFamily:     t.font.family.sans,
        userSelect:     'none',
      }}
    >
      {showImg ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials(name)
      )}
    </div>
  )
}
