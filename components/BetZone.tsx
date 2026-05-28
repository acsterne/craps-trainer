'use client'
import { useGame } from '@/lib/game-context'
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { BetType } from '@/lib/craps-types'
import { getBetDescription } from '@/lib/bet-descriptions'
import { ActiveBetChip } from './ActiveBetChip'

interface BetZoneProps {
  betType: BetType
  label: string
  sublabel?: string
  diceIcons?: string
  number?: number
  dice?: [number, number]
  style?: React.CSSProperties
  disabled?: boolean
  labelSize?: number
  prominent?: boolean
  vertical?: boolean
  sideLabel?: boolean
  labelColor?: string
}

export function BetZone({
  betType, label, sublabel, diceIcons, number, dice, style, disabled,
  labelSize, prominent, vertical, sideLabel, labelColor,
}: BetZoneProps) {
  const { state, dispatch } = useGame()
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const activeBets = state.bets.filter(b => {
    if (b.type !== betType) return false
    if (number !== undefined && b.number !== number) return false
    return true
  })

  const hasBet = activeBets.length > 0
  const description = getBetDescription(betType, number)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (disabled || sideLabel) return
    dispatch({ type: 'PLACE_BET', betType, number, dice })
  }

  function handleMouseEnter() {
    if (ref.current) setTooltipRect(ref.current.getBoundingClientRect())
  }

  function handleMouseLeave() {
    setTooltipRect(null)
  }

  const fontSize = prominent ? '1.05rem' : labelSize ? `${labelSize}rem` : '0.6rem'
  const sublabelSize = prominent ? '0.6rem' : '0.48rem'

  const labelStyle: React.CSSProperties = vertical ? {
    writingMode: 'vertical-lr',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
  } : {
    whiteSpace: prominent ? 'nowrap' : 'normal',
  }

  const showAbove = tooltipRect ? tooltipRect.top > 220 : true

  return (
    <>
      <div
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`bet-zone${disabled ? ' disabled' : ''}`}
        style={{
          border: `1px solid ${hasBet ? 'rgba(255,210,50,0.9)' : 'rgba(255,255,255,0.3)'}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: vertical ? '6px 2px' : prominent ? '4px 8px' : '2px 3px',
          backgroundColor: hasBet ? 'rgba(255,200,30,0.18)' : 'rgba(0,0,0,0.1)',
          position: 'relative',
          minHeight: 0,
          overflow: 'hidden',
          cursor: sideLabel || disabled ? (disabled ? 'not-allowed' : 'default') : 'pointer',
          ...style,
        }}
      >
        <span style={{
          color: labelColor ?? (prominent ? '#ffe840' : '#ffffff'),
          fontSize,
          fontFamily: prominent
            ? 'Impact, "Arial Narrow", sans-serif'
            : '"Arial Black", Impact, sans-serif',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: vertical ? '0.12em' : prominent ? '0.14em' : '0.04em',
          lineHeight: 1.15,
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: prominent
            ? '0 0 16px rgba(255,220,50,0.5), 0 2px 4px rgba(0,0,0,0.9)'
            : '0 1px 3px rgba(0,0,0,0.9)',
          ...labelStyle,
        }}>
          {label}
        </span>
        {sublabel && !vertical && (
          <span style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: sublabelSize,
            lineHeight: 1.3,
            textAlign: 'center',
            pointerEvents: 'none',
            fontFamily: 'Georgia, serif',
          }}>
            {sublabel}
          </span>
        )}
        {diceIcons && !vertical && (
          <span style={{
            fontSize: '0.75rem',
            lineHeight: 1,
            marginTop: 2,
            pointerEvents: 'none',
            letterSpacing: '0.05em',
            opacity: 0.9,
          }}>
            {diceIcons}
          </span>
        )}
        {!sideLabel && activeBets.map((bet, index) => (
          <ActiveBetChip
            key={bet.id}
            bet={bet}
            index={index}
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: 'REMOVE_BET', id: bet.id })
            }}
          />
        ))}
      </div>

      {tooltipRect && description && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          left: Math.min(
            Math.max(tooltipRect.left + tooltipRect.width / 2, 130),
            window.innerWidth - 130
          ),
          top: showAbove ? tooltipRect.top - 10 : tooltipRect.bottom + 10,
          transform: showAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          zIndex: 9999,
          width: 290,
          backgroundColor: 'rgba(4, 18, 9, 0.97)',
          border: '1px solid rgba(201,168,76,0.65)',
          borderRadius: 10,
          padding: '10px 14px',
          pointerEvents: 'none',
          boxShadow: '0 8px 40px rgba(0,0,0,0.95)',
        }}>
          <div style={{
            color: '#c9a84c',
            fontSize: '0.8rem',
            fontWeight: 900,
            fontFamily: 'Impact, "Arial Narrow", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 6,
          }}>
            {label}
          </div>
          <div style={{
            color: 'rgba(220,215,200,0.92)',
            fontSize: '0.75rem',
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif',
          }}>
            {description}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
