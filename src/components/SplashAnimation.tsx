import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import logoFull from '../assets/Logo.svg'
import { t } from '../design/tokens'

export function SplashAnimation() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.8 },
  })

  const logoOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const taglineOpacity = interpolate(frame, [28, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const screenOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.color.brand[50],
        opacity: screenOpacity,
        gap: 20,
        fontFamily: t.font.family.sans,
      }}
    >
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <img src={logoFull} alt="GB CERNE" style={{ height: 68, display: 'block' }} />
      </div>

      <div
        style={{
          opacity: taglineOpacity,
          fontSize: t.font.size.base,
          color: t.color.brand[600],
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Sistema de Gestão Agropecuária
      </div>
    </div>
  )
}
