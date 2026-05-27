import React from 'react'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  maxWidth?: number
}

export function Modal({ children, onClose, maxWidth = 440 }: ModalProps) {
  const { colors } = useTheme()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: t.zIndex.overlay,
        padding: t.space[6],
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.surfaceBg,
          borderRadius: t.radius['2xl'],
          padding: `${t.space[8]}px ${t.space[7]}px`,
          maxWidth,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: scale(.94) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes dropIn  { from { opacity: 0; transform: translateY(-5px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}
