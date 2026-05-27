'use client'
import { useGame } from '@/lib/game-context'
import type { BetType } from '@/lib/craps-types'
import { ActiveBetChip } from './ActiveBetChip'

interface BetZoneProps {
  betType: BetType
  label: string
  sublabel?: string
  number?: number
  dice?: [number, number]
  style?: React.CSSProperties
  disabled?: boolean
}

export function BetZone({ betType, label, sublabel, number, dice, style, disabled }: BetZoneProps) {
  const { state, dispatch } = useGame()

  const activeBets = state.bets.filter(b => {
    if (b.type !== betType) return false
    if (number !== undefined && b.number !== number) return false
    return true
  })

  const hasBet = activeBets.length > 0

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (disabled) return
    dispatch({ type: 'PLACE_BET', betType, number, dice })
  }

  return (
    <div
      onClick={handleClick}
      className={`bet-zone${disabled ? ' disabled' : ''}`}
      style={{
        border: `1px solid ${hasBet ? 'rgba(201,168,76,0.55)' : 'rgba(245,240,232,0.18)'}`,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 3px',
        backgroundColor: hasBet ? 'rgba(201,168,76,0.08)' : 'transparent',
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <span style={{
        color: '#f5f0e8',
        fontSize: '0.6rem',
        fontFamily: 'Georgia, serif',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        lineHeight: 1.2,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        {label}
      </span>
      {sublabel && (
        <span style={{
          color: '#c8c0b0',
          fontSize: '0.5rem',
          lineHeight: 1.2,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          {sublabel}
        </span>
      )}
      {activeBets.map((bet) => (
        <ActiveBetChip
          key={bet.id}
          bet={bet}
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'REMOVE_BET', id: bet.id })
          }}
        />
      ))}
    </div>
  )
}
