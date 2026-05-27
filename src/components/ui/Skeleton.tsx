import React from 'react'
import { t } from '../../design/tokens'

type SkeletonVariant = 'text' | 'rect' | 'circle'

interface SkeletonProps {
  width?:     string | number
  height?:    string | number
  variant?:   SkeletonVariant
  lines?:     number
  className?: string
}

const pulseKeyframes = `
@keyframes gb-skeleton-pulse {
  0%   { opacity: 0.6; }
  50%  { opacity: 1;   }
  100% { opacity: 0.6; }
}
`

let styleInjected = false

function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = pulseKeyframes
  document.head.appendChild(style)
  styleInjected = true
}

function SkeletonBlock({
  width,
  height,
  variant,
  className,
}: {
  width?:     string | number
  height?:    string | number
  variant:    SkeletonVariant
  className?: string
}) {
  injectStyles()

  const isCircle = variant === 'circle'

  const resolvedWidth: string | number | undefined = isCircle
    ? (width ?? height ?? 40)
    : variant === 'text'
      ? (width ?? '100%')
      : width

  const resolvedHeight: string | number | undefined = isCircle
    ? (height ?? width ?? 40)
    : variant === 'text'
      ? (height ?? t.font.size.base + 4)
      : height

  return (
    <div
      className={className}
      style={{
        width:        resolvedWidth,
        height:       resolvedHeight,
        borderRadius: isCircle ? t.radius.full : t.radius.md,
        background:   t.color.neutral[200],
        animation:    `gb-skeleton-pulse ${t.animation.duration.slower} ease-in-out infinite`,
      }}
    />
  )
}

export function Skeleton({
  width,
  height,
  variant   = 'rect',
  lines     = 3,
  className,
}: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[2] }}>
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonBlock
            key={i}
            variant="text"
            width={i === lines - 1 && lines > 1 ? '70%' : (width ?? '100%')}
            height={height}
            className={className}
          />
        ))}
      </div>
    )
  }

  return (
    <SkeletonBlock
      width={width}
      height={height}
      variant={variant}
      className={className}
    />
  )
}
