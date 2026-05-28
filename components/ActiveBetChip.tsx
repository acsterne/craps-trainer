import type { Bet } from '@/lib/craps-types'

const CHIP_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1:   { bg: '#e8e4d8', border: '#aaa898', text: '#2a2010' },
  5:   { bg: '#b02020', border: '#d04040', text: '#fff' },
  25:  { bg: '#1a6630', border: '#2a9948', text: '#fff' },
  100: { bg: '#0a0a1a', border: '#c9a84c', text: '#c9a84c' },
}

const DEFAULT_COLORS = { bg: '#1a6630', border: '#2a9948', text: '#fff' }

interface ActiveBetChipProps {
  bet: Bet
  index?: number
  onClick?: (e: React.MouseEvent) => void
}

export function ActiveBetChip({ bet, index = 0, onClick }: ActiveBetChipProps) {
  const colors = CHIP_COLORS[bet.amount] ?? DEFAULT_COLORS
  const offset = index * 3
  return (
    <button
      onClick={onClick}
      title="Click to remove bet"
      className="chip"
      style={{
        position: 'absolute',
        width: 36,
        height: 36,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        zIndex: 10 + index,
        fontSize: '0.55rem',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${offset}px), calc(-50% - ${offset}px))`,
        boxShadow: `0 ${2 + index}px ${6 + index * 2}px rgba(0,0,0,0.6)`,
      }}
    >
      ${bet.amount}
    </button>
  )
}
