'use client'
import { useGame } from '@/lib/game-context'
import { BetZone } from './BetZone'
import { Dice } from './Dice'

export function CrapsTable() {
  const { state } = useGame()
  const inPoint = state.phase === 'point'
  const hasPassLine = state.bets.some(b => b.type === 'passLine')
  const hasDontPass = state.bets.some(b => b.type === 'dontPass')

  const tableStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    border: '1px solid rgba(201,168,76,0.28)',
    background: 'radial-gradient(ellipse at 50% 40%, #1c1010 0%, #0f0a0a 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 8px 6px',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 3,
    flex: '0 0 auto',
  }

  return (
    <div className="felt-texture gold-glow" style={tableStyle}>
      {/* Point puck */}
      {state.point && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 20,
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: '#f0ece0',
          border: '2px solid #c9a84c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, color: '#0f0a0a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          {state.point}
        </div>
      )}

      {/* Row 1: Don't Come + Place numbers */}
      <div style={rowStyle}>
        <BetZone betType="dontCome" label="Don't Come" sublabel="Bar 12"
          style={{ width: 90, flexShrink: 0, height: 40 }} disabled={!inPoint} />
        {[4, 5, 6, 8, 9, 10].map(n => (
          <BetZone key={n} betType="place" number={n}
            label={n === 6 ? 'Six' : n === 9 ? 'Nine' : String(n)}
            sublabel={n === 6 || n === 8 ? '7:6' : n === 5 || n === 9 ? '7:5' : '9:5'}
            style={{ flex: 1, height: 40 }} disabled={!inPoint} />
        ))}
      </div>

      {/* Row 2: Come + Odds */}
      <div style={rowStyle}>
        <BetZone betType="come" label="Come" style={{ flex: 1, height: 34 }} disabled={!inPoint} />
        <BetZone betType="oddsPass" label="Odds" sublabel="Pass"
          style={{ width: 68, flexShrink: 0, height: 34 }}
          disabled={!inPoint || !hasPassLine} />
        <BetZone betType="oddsDontPass" label="Odds" sublabel="D.Pass"
          style={{ width: 68, flexShrink: 0, height: 34 }}
          disabled={!inPoint || !hasDontPass} />
        <BetZone betType="dontPass" label="Don't Pass" sublabel="Bar 12"
          style={{ width: 90, flexShrink: 0, height: 34 }} disabled={inPoint} />
      </div>

      {/* Row 3: Field */}
      <div style={rowStyle}>
        <BetZone betType="field" label="Field  2 · 3 · 4 · 9 · 10 · 11 · 12"
          sublabel="2 and 12 pay 2:1 · loses on 5, 6, 7, 8"
          style={{ flex: 1, height: 32 }} />
      </div>

      {/* Row 4: Pass Line + Dice + Big 6/8 */}
      <div style={{ ...rowStyle, alignItems: 'center' }}>
        <BetZone betType="passLine" label="Pass Line" style={{ flex: 1, height: 44 }} disabled={inPoint} />
        <div style={{ width: 160, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44 }}>
          <Dice />
        </div>
        <BetZone betType="big6" label="Big 6" sublabel="1:1" style={{ width: 46, flexShrink: 0, height: 44 }} />
        <BetZone betType="big8" label="Big 8" sublabel="1:1" style={{ width: 46, flexShrink: 0, height: 44 }} />
      </div>

      {/* Row 5: Hardways + one-roll props */}
      <div style={rowStyle}>
        {(['hard4', 'hard6', 'hard8', 'hard10'] as const).map((h, i) => (
          <BetZone key={h} betType={h}
            label={`Hard ${[4,6,8,10][i]}`}
            sublabel={i < 2 ? '7:1' : '9:1'}
            style={{ flex: 1, height: 38 }} />
        ))}
        <div style={{ width: 1, backgroundColor: 'rgba(201,168,76,0.2)', flexShrink: 0 }} />
        <BetZone betType="anyCraps" label="Any Craps" sublabel="7:1" style={{ flex: 1, height: 38 }} />
        <BetZone betType="yo" label="Yo" sublabel="11 · 15:1" style={{ flex: 1, height: 38 }} />
        <BetZone betType="aces" label="Aces" sublabel="2 · 30:1" style={{ flex: 1, height: 38 }} />
        <BetZone betType="three" label="3" sublabel="15:1" style={{ flex: 1, height: 38 }} />
        <BetZone betType="boxcars" label="12" sublabel="30:1" style={{ flex: 1, height: 38 }} />
        <BetZone betType="any7" label="Any 7" sublabel="4:1" style={{ flex: 1, height: 38 }} />
        <BetZone betType="horn" label="Horn" sublabel="2·3·11·12" style={{ flex: 1.4, height: 38 }} />
      </div>

      {/* Row 6: Buy + Lay */}
      <div style={{ ...rowStyle, opacity: inPoint ? 1 : 0.45 }}>
        {[4,5,6,8,9,10].map(n => (
          <BetZone key={`buy${n}`} betType="buy" number={n}
            label={`Buy ${n}`}
            style={{ flex: 1, height: 26, fontSize: '0.5rem' }}
            disabled={!inPoint} />
        ))}
        {[4,5,6,8,9,10].map(n => (
          <BetZone key={`lay${n}`} betType="lay" number={n}
            label={`Lay ${n}`}
            style={{ flex: 1, height: 26 }}
            disabled={!inPoint} />
        ))}
      </div>
    </div>
  )
}
