'use client'
import { useGame } from '@/lib/game-context'

const DOT_POSITIONS: Record<number, [string, string][]> = {
  1: [['50%', '50%']],
  2: [['28%', '28%'], ['72%', '72%']],
  3: [['28%', '28%'], ['50%', '50%'], ['72%', '72%']],
  4: [['28%', '28%'], ['72%', '28%'], ['28%', '72%'], ['72%', '72%']],
  5: [['28%', '28%'], ['72%', '28%'], ['50%', '50%'], ['28%', '72%'], ['72%', '72%']],
  6: [['28%', '22%'], ['72%', '22%'], ['28%', '50%'], ['72%', '50%'], ['28%', '78%'], ['72%', '78%']],
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: '#f0ece0',
        border: '2px solid #ddd5c0',
        position: 'relative',
        boxShadow: '0 4px 14px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.4)',
        animation: rolling ? 'diceRoll 0.8s ease-out' : 'none',
      }}
    >
      {(DOT_POSITIONS[value] ?? []).map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 9,
            height: 9,
            borderRadius: '50%',
            backgroundColor: '#1a0a0a',
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}

export function Dice() {
  const { state } = useGame()
  const [d1, d2] = state.lastRoll ?? [1, 1]
  const sum = d1 + d2
  const hasRolled = state.lastRoll !== null

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Die value={d1} rolling={state.isRolling} />
      <Die value={d2} rolling={state.isRolling} />
      {hasRolled && !state.isRolling && (
        <div style={{ color: '#c8c0b0', fontSize: 13, fontFamily: 'Georgia, serif', minWidth: 28 }}>
          = {sum}
        </div>
      )}
    </div>
  )
}
