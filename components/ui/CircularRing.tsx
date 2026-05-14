'use client'
import { useEffect, useState } from 'react'

interface CircularRingProps {
  value: number
  max: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  centerText?: string
  centerSub?: string
  color?: string
}

const sizes = { sm: 48, md: 80, lg: 120, xl: 160 }
const strokes = { sm: 4, md: 6, lg: 8, xl: 10 }

export default function CircularRing({
  value, max, size = 'md', label, centerText, centerSub, color = '#C9A96E'
}: CircularRingProps) {
  const [animated, setAnimated] = useState(0)
  const px = sizes[size]
  const stroke = strokes[size]
  const radius = (px - stroke * 2) / 2
  const circ = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const offset = circ - animated * circ

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: px, height: px }}>
        <svg width={px} height={px} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={px / 2} cy={px / 2} r={radius}
            fill="none" stroke="#EDE8E2" strokeWidth={stroke}
          />
          <circle
            cx={px / 2} cy={px / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1000ms ease-out' }}
          />
        </svg>
        {(centerText || centerSub) && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            lineHeight: 1.1,
          }}>
            {centerText && (
              <span style={{
                fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                fontSize: size === 'xl' ? '1.8rem' : size === 'lg' ? '1.3rem' : size === 'md' ? '1rem' : '0.75rem',
                color: '#1A1A1A',
              }}>{centerText}</span>
            )}
            {centerSub && (
              <span style={{
                fontSize: size === 'xl' ? '0.65rem' : '0.58rem',
                color: '#999', letterSpacing: '0.06em',
                textTransform: 'uppercase', marginTop: '2px',
              }}>{centerSub}</span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span style={{ fontSize: '0.68rem', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </span>
      )}
    </div>
  )
}
