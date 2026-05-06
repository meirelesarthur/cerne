import React from 'react'

interface FormSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1a1a1a',
          fontFamily: "'Outfit', sans-serif",
          paddingBottom: 10,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: subtitle ? 4 : 0,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: '#9ca3af',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: 0,
          }}
        >
          {subtitle}
        </div>
      )}
      <div style={{ paddingTop: 16 }}>{children}</div>
    </div>
  )
}
