/** Horizontal faded divider — between stacked rows inside a single-card dashboard */
export function HDivider({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 1,
        flexShrink: 0,
        background: `linear-gradient(to right, transparent 0%, ${color} 18%, ${color} 82%, transparent 100%)`,
      }}
    />
  )
}

/** Vertical faded divider — between side-by-side columns inside a flex row */
export function VDivider({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 1,
        flexShrink: 0,
        alignSelf: 'stretch',
        background: `linear-gradient(to bottom, transparent 0%, ${color} 18%, ${color} 82%, transparent 100%)`,
      }}
    />
  )
}
