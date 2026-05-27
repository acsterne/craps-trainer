'use client'
import { useGame } from '@/lib/game-context'

export function PhaseBanner() {
  const { state } = useGame()

  const text = state.phase === 'comeOut'
    ? 'COME-OUT ROLL — Roll a 7 or 11 to win  ·  2, 3, or 12 loses'
    : `POINT IS ${state.point} — Roll a ${state.point} to win  ·  Avoid the 7`

  const bg = state.phase === 'comeOut'
    ? 'rgba(201,168,76,0.12)'
    : 'rgba(180,80,30,0.15)'

  const borderColor = state.phase === 'comeOut'
    ? 'rgba(201,168,76,0.35)'
    : 'rgba(200,100,40,0.4)'

  return (
    <div
      style={{ background: bg, borderBottom: `1px solid ${borderColor}` }}
      className="w-full text-center py-2 px-4 text-xs tracking-widest uppercase"
      css-color="gold"
    >
      <span style={{ color: '#c9a84c', letterSpacing: '0.15em' }}>{text}</span>
    </div>
  )
}
