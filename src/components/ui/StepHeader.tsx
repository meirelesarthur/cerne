import React from 'react'

interface StepHeaderProps {
  title: string
  subtitle: string
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#111827',
          fontFamily: "'Outfit', sans-serif",
          margin: '0 0 8px',
          letterSpacing: '-0.4px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 13,
          color: '#9ca3af',
          fontFamily: "'Outfit', sans-serif",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}
