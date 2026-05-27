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
  labelSize?: number   // font size in rem, default 0.6
  prominent?: boolean  // large label like Pass Line / Come
  vertical?: boolean   // rotate text 90deg (for side labels)
}

export function BetZone({
  betType, label, sublabel, number, dice, style, disabled,
  labelSize, prominent, vertical,
}: BetZoneProps) {
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

  const fontSize = prominent ? '1.1rem' : labelSize ? `${labelSize}rem` : '0.6rem'
  const sublabelSize = prominent ? '0.65rem' : '0.5rem'

  return (
    <div
      onClick={handleClick}
      className={`bet-zone${disabled ? ' disabled' : ''}`}
      style={{
        border: `1px solid ${hasBet ? 'rgba(201,168,76,0.6)' : 'rgba(245,240,232,0.15)'}`,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: prominent ? '4px 8px' : '2px 3px',
        backgroundColor: hasBet ? 'rgba(201,168,76,0.1)' : 'transparent',
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <span style={{
        color: prominent ? '#e8d888' : '#f5f0e8',
        fontSize,
        fontFamily: 'Georgia, serif',
        fontWeight: prominent ? 700 : 400,
        textTransform: 'uppercase',
        letterSpacing: prominent ? '0.18em' : '0.06em',
        lineHeight: 1.2,
        textAlign: 'center',
        pointerEvents: 'none',
        transform: vertical ? 'rotate(-90deg)' : 'none',
        whiteSpace: prominent ? 'nowrap' : 'normal',
      }}>
        {label}
      </span>
      {sublabel && (
        <span style={{
          color: prominent ? 'rgba(245,240,232,0.55)' : '#c8c0b0',
          fontSize: sublabelSize,
          lineHeight: 1.3,
          textAlign: 'center',
          pointerEvents: 'none',
          fontFamily: 'Georgia, serif',
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
