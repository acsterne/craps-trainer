'use client'
import { useGame } from '@/lib/game-context'
import { audio } from '@/lib/audio'
import { useState } from 'react'

const CHIPS = [
  { value: 1,   bg: '#e8e4d8', border: '#aaa898', text: '#2a2010' },
  { value: 5,   bg: '#b02020', border: '#d04040', text: '#fff' },
  { value: 25,  bg: '#1a6630', border: '#2a9948', text: '#fff' },
  { value: 100, bg: '#0a0a1a', border: '#c9a84c', text: '#c9a84c' },
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
    else { audio.muteAll(); setMuted(true) }
  }

  const broke = state.bankroll <= 0 && state.bets.length === 0

  if (broke) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '10px 16px',
        borderTop: '1px solid rgba(201,168,76,0.2)',
      }}>
        <span style={{ color: '#c8c0b0', fontFamily: 'Georgia, serif', fontSize: 13 }}>
          Bankroll empty.
        </span>
        <button
          onClick={() => dispatch({ type: 'REBUY' })}
          style={{
            padding: '6px 18px',
            backgroundColor: '#c9a84c',
            color: '#0f0a0a',
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 6,
            border: '2px solid #e8c96a',
            cursor: 'pointer',
          }}
        >
          Rebuy $500
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 14px',
      borderTop: '1px solid rgba(201,168,76,0.18)',
    }}>
      {/* Chip selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {CHIPS.map(({ value, bg, border, text }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: 'SELECT_CHIP', value })}
            className="chip"
            style={{
              width: 42, height: 42,
              backgroundColor: bg,
              borderColor: border,
              color: text,
              boxShadow: state.selectedChipValue === value
                ? `0 0 0 3px #c9a84c, 0 2px 8px rgba(0,0,0,0.6)`
                : '0 2px 6px rgba(0,0,0,0.5)',
              transform: state.selectedChipValue === value ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Bankroll */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ color: '#c8c0b0', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
          Bankroll
        </div>
        <div style={{ color: '#c9a84c', fontSize: 20, fontFamily: 'Georgia, serif', fontWeight: 700 }}>
          ${state.bankroll.toLocaleString()}
        </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={toggleMute}
        title={muted ? 'Unmute' : 'Mute'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: muted ? '#666' : '#c8c0b0',
          fontSize: 18, padding: '0 6px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {muted ? '🔇' : '♪'}
      </button>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={state.isRolling || state.bets.length === 0}
        style={{
          padding: '8px 24px',
          backgroundColor: state.isRolling || state.bets.length === 0 ? '#4a3a20' : '#c9a84c',
          color: state.isRolling || state.bets.length === 0 ? '#7a6040' : '#0f0a0a',
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.1em',
          borderRadius: 8,
          border: '2px solid',
          borderColor: state.isRolling || state.bets.length === 0 ? '#6a5030' : '#e8c96a',
          cursor: state.isRolling || state.bets.length === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {state.isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  )
}
