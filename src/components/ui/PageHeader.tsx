import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  count?: number
}

export function PageHeader({ title, description, actions, count }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1a1a1a',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {title}
          </span>
          {count !== undefined && (
            <span
              style={{
                background: '#f0f0f0',
                color: '#737373',
                fontSize: 11,
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              {count}
            </span>
          )}
        </div>
        {description && (
          <span
            style={{
              fontSize: 12,
              color: '#9ca3af',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {description}
          </span>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
    </div>
  )
}
