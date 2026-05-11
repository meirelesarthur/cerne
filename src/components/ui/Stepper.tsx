import React from 'react'

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
        alignItems: 'center',
        width: '100%',
        padding: '12px 16px',
        boxSizing: 'border-box',
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = completed.includes(step.id)
        const isActive = step.id === current
        const isFuture = !isCompleted && !isActive
        const isClickable = isCompleted

        const circleSize = isActive ? 14 : 10

        return (
          <React.Fragment key={step.id}>
            {/* Step node */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flex: '0 0 auto',
                cursor: isClickable ? 'pointer' : 'default',
              }}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {/* Circle */}
              <div
                style={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isCompleted ? '#059669' : 'white',
                  border: isCompleted
                    ? 'none'
                    : isActive
                    ? '2px solid #059669'
                    : '1.5px solid #d1d5db',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              {/* Label */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "'Outfit', sans-serif",
                  color: isCompleted || isActive ? '#059669' : '#9ca3af',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.1px',
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
                  height: 1.5,
                  marginBottom: 19,
                  background: isCompleted ? '#059669' : '#e5e7eb',
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
