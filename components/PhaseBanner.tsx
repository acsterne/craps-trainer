'use client'
import { useGame } from '@/lib/game-context'

function oddsPayoutFor(point: number | null): string {
  if (point === 4 || point === 10) return '2:1'
  if (point === 5 || point === 9)  return '3:2'
  if (point === 6 || point === 8)  return '6:5'
  return ''
}

export function PhaseBanner() {
  const { state } = useGame()
  const inPoint = state.phase === 'point'
  const oddsPayout = oddsPayoutFor(state.point)

  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid #21262d',
      background: inPoint ? '#160d0d' : '#0c1810',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      flexWrap: 'wrap',
    }}>
      {/* Phase pill */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 16px',
        borderRadius: 24,
        background: inPoint ? 'rgba(248,81,73,0.18)' : 'rgba(63,185,80,0.18)',
        border: `1px solid ${inPoint ? 'rgba(248,81,73,0.5)' : 'rgba(63,185,80,0.5)'}`,
        color: inPoint ? '#f85149' : '#3fb950',
        fontSize: '0.95rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 9 }}>●</span>
        {inPoint ? `Point is ${state.point}` : 'Come-Out Roll'}
      </span>

      {/* Instructions */}
      <span style={{ color: '#c9d1d9', fontSize: '0.95rem', lineHeight: 1.5 }}>
        {inPoint ? (
          <>
            <strong style={{ color: '#f85149', fontSize: '1rem' }}>7 is now your enemy.</strong>
            {'  '}Roll <strong style={{ color: '#3fb950' }}>{state.point}</strong> to win ·
            {'  '}Roll <strong style={{ color: '#f85149' }}>7</strong> = lose (seven out) ·
            {'  '}<span style={{ color: '#e8c96a' }}>add Odds behind Pass Line → pays {oddsPayout}, zero house edge</span>
          </>
        ) : (
          <>
            Bet <strong style={{ color: '#e8c96a' }}>Pass Line</strong>, then roll ·
            {'  '}<strong style={{ color: '#3fb950' }}>7 or 11 wins instantly</strong> ·
            {'  '}<strong style={{ color: '#f85149' }}>2, 3, 12 loses</strong> ·
            {'  '}any other number sets the point
          </>
        )}
      </span>
    </div>
  )
}
