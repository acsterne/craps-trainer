'use client'
import { useGame } from '@/lib/game-context'

function getRollColor(sum: number): { bg: string; color: string; border: string } {
  if (sum === 7) return { bg: 'rgba(180,40,40,0.4)', color: '#fca5a5', border: 'rgba(180,40,40,0.5)' }
  if (sum === 11) return { bg: 'rgba(30,120,60,0.4)', color: '#86efac', border: 'rgba(30,120,60,0.5)' }
  if (sum === 2 || sum === 12) return { bg: 'rgba(120,40,140,0.4)', color: '#d8b4fe', border: 'rgba(120,40,140,0.5)' }
  if (sum === 3) return { bg: 'rgba(140,60,40,0.4)', color: '#fca5a5', border: 'rgba(140,60,40,0.4)' }
  return { bg: 'rgba(26,15,15,0.6)', color: '#c8c0b0', border: 'rgba(245,240,232,0.15)' }
}

export function RollHistory() {
  const { state } = useGame()

  if (state.rollHistory.length === 0) {
    return (
      <div style={{
        padding: '4px 14px',
        color: '#6a6050',
        fontSize: '0.6rem',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        Roll history will appear here
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', gap: 5, overflowX: 'auto',
      padding: '4px 14px', alignItems: 'center',
    }}>
      <span style={{ color: '#6a6050', fontSize: '0.55rem', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
        History
      </span>
      {state.rollHistory.map((dice, i) => {
        const sum = dice[0] + dice[1]
        const colors = getRollColor(sum)
        return (
          <div
            key={i}
            title={`${dice[0]} + ${dice[1]}`}
            style={{
              flexShrink: 0,
              width: 28, height: 28,
              borderRadius: 6,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.bg,
              color: colors.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem',
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
            }}
          >
            {sum}
          </div>
        )
      })}
    </div>
  )
}
