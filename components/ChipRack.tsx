'use client'
import { useGame } from '@/lib/game-context'
import { audio } from '@/lib/audio'
import { useState } from 'react'

const CHIPS = [
  { value: 1,   bg: '#2d333b', border: '#6e7681', text: '#e6edf3' },
  { value: 5,   bg: '#3d1515', border: '#f85149', text: '#f85149' },
  { value: 25,  bg: '#0f2d13', border: '#3fb950', text: '#3fb950' },
  { value: 100, bg: '#1a1206', border: '#c9a84c', text: '#c9a84c' },
]

export function ChipRack() {
  const { state, dispatch, roll } = useGame()
  const [muted, setMuted] = useState(false)

  function handleRoll() {
    audio.startJazz()
    roll()
  }

  function toggleMute() {
    if (muted) { audio.unmuteAll(); setMuted(false) }
    else        { audio.muteAll();   setMuted(true)  }
  }

  const broke = state.bankroll <= 0 && state.bets.length === 0

  if (broke) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        padding: '10px 16px',
        borderTop: '1px solid #21262d',
        background: '#161b22',
      }}>
        <span style={{ color: '#7d8590', fontSize: '0.8rem' }}>Bankroll empty.</span>
        <button
          onClick={() => dispatch({ type: 'REBUY' })}
          style={{
            padding: '7px 18px',
            background: '#238636', color: '#fff',
            fontWeight: 600, fontSize: '0.82rem',
            borderRadius: 6, border: '1px solid #3fb950',
            cursor: 'pointer',
          }}
        >
          Rebuy $500
        </button>
      </div>
    )
  }

  const canRoll = !state.isRolling && state.bets.length > 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 14px',
      borderTop: '1px solid #21262d',
      background: '#161b22',
    }}>
      {/* Chip selector */}
      <div style={{ display: 'flex', gap: 6 }}>
        {CHIPS.map(({ value, bg, border, text }) => {
          const selected = state.selectedChipValue === value
          return (
            <button
              key={value}
              onClick={() => dispatch({ type: 'SELECT_CHIP', value })}
              className="chip"
              style={{
                width: 40, height: 40,
                backgroundColor: bg,
                borderColor: border,
                color: text,
                boxShadow: selected ? `0 0 0 2px ${border}` : 'none',
                transform: selected ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              ${value}
            </button>
          )
        })}
      </div>

      {/* Bankroll */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ color: '#7d8590', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Bankroll
        </div>
        <div style={{ color: '#c9a84c', fontSize: '1.1rem', fontWeight: 700 }}>
          ${state.bankroll.toLocaleString()}
        </div>
      </div>

      {/* Sound */}
      <button
        onClick={toggleMute}
        style={{
          background: 'none',
          border: '1px solid #30363d',
          cursor: 'pointer',
          color: muted ? '#484f58' : '#7d8590',
          fontSize: '0.72rem',
          padding: '5px 10px',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <span>{muted ? '🔇' : '♪'}</span>
        <span>{muted ? 'Off' : 'On'}</span>
      </button>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={!canRoll}
        style={{
          padding: '8px 28px',
          background: canRoll ? '#238636' : '#21262d',
          color: canRoll ? '#fff' : '#484f58',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.06em',
          borderRadius: 8,
          border: `1px solid ${canRoll ? '#3fb950' : '#30363d'}`,
          cursor: canRoll ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        {state.isRolling ? 'Rolling…' : 'Roll Dice'}
      </button>
    </div>
  )
}
