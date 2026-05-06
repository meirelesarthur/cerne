import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  id: number
  label: string
}

interface StepperProps {
  steps: Step[]
  current: number
  completed: number[]
  onStepClick: (id: number) => void
}

export function Stepper({ steps, current, completed, onStepClick }: StepperProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        padding: '16px 24px',
        background: 'white',
        borderRadius: 12,
        boxSizing: 'border-box',
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = completed.includes(step.id)
        const isActive = step.id === current
        const isFuture = !isCompleted && !isActive
        const isClickable = isCompleted

        return (
          <React.Fragment key={step.id}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                flex: '0 0 auto',
                cursor: isClickable ? 'pointer' : 'default',
              }}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {/* Circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? '#059669'
                    : isActive
                    ? '#059669'
                    : 'white',
                  border: isFuture ? '1.5px solid #e5e5e5' : 'none',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {isCompleted ? (
                  <Check size={12} color="white" strokeWidth={2.5} />
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: isActive ? 'white' : '#9ca3af',
                      lineHeight: 1,
                    }}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              {/* Label */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "'Outfit', sans-serif",
                  color: isCompleted ? '#059669' : isActive ? '#059669' : '#9ca3af',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginTop: 13,
                  background: isCompleted ? '#059669' : '#e5e5e5',
                  transition: 'background 0.2s',
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
