'use client'

import { useGame } from '@/lib/game-context'
import { getBetLabel } from '@/lib/bet-descriptions'

interface Props {
  onContinue: () => void
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 30], [75, 70]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
}

function DieFace({ value }: { value: number }) {
  const dots = DOT_POSITIONS[value] ?? []
  return (
    <div style={{
      width: 72,
      height: 72,
      borderRadius: 10,
      background: '#f8fafc',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.15)',
      position: 'relative',
      flexShrink: 0,
    }}>
      <svg
        viewBox="0 0 100 100"
        width="72"
        height="72"
        style={{ position: 'absolute', inset: 0 }}
      >
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={8} fill="#1a1a2e" />
        ))}
      </svg>
    </div>
  )
}

export function RollResultOverlay({ onContinue }: Props) {
  const { state } = useGame()

  const roll = state.lastRoll
  const results = state.lastResults

  const wins = results.filter(r => r.outcome === 'win')
  const losses = results.filter(r => r.outcome === 'lose')

  const netWin = wins.reduce((sum, r) => sum + r.payout - r.bet.amount, 0)
  const netLoss = losses.reduce((sum, r) => sum + r.bet.amount, 0)
  const net = netWin - netLoss
  const hasResolved = wins.length > 0 || losses.length > 0

  return (
    <>
      <style>{`
        @keyframes rro-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rro-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onContinue}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'rro-backdrop-in 0.2s ease forwards',
        }}
      >
        {/* Card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: 440,
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 16,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            animation: 'rro-card-in 0.25s ease forwards',
          }}
        >
          {/* Dice row */}
          {roll && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <DieFace value={roll[0]} />
              <DieFace value={roll[1]} />
              <span style={{ fontSize: 36, fontWeight: 700, color: '#e8edf2', marginLeft: 4 }}>
                = {roll[0] + roll[1]}
              </span>
            </div>
          )}

          {/* Net amount */}
          {hasResolved && (
            <div style={{
              textAlign: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: net >= 0 ? '#3fb950' : '#f85149',
              lineHeight: 1,
            }}>
              {net >= 0 ? '+' : ''}{net < 0 ? `-$${Math.abs(net)}` : `+$${net}`}
            </div>
          )}

          {/* Result rows */}
          {hasResolved && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {wins.map((r, i) => {
                const winAmt = r.payout - r.bet.amount
                return (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    padding: '5px 10px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(63,185,80,0.1)',
                    color: '#3fb950',
                  }}>
                    <span>{getBetLabel(r.bet.type, r.bet.number)}</span>
                    <span>+${winAmt}</span>
                  </div>
                )
              })}
              {losses.map((r, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  padding: '5px 10px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(248,81,73,0.1)',
                  color: '#f85149',
                }}>
                  <span>{getBetLabel(r.bet.type, r.bet.number)}</span>
                  <span>-${r.bet.amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Kenji explanation */}
          {state.kenjiLine && (
            <div style={{
              borderTop: '1px solid #30363d',
              paddingTop: 16,
              color: '#8b949e',
              fontSize: '0.82rem',
              lineHeight: 1.65,
            }}>
              {state.kenjiLine}
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onContinue}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: '#238636',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </>
  )
}
