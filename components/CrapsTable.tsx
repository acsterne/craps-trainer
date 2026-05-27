'use client'
import { useGame } from '@/lib/game-context'
import { BetZone } from './BetZone'
import { Dice } from './Dice'

const FELT = 'rgba(20, 10, 10, 0.0)'
const DIVIDER = '1px solid rgba(201,168,76,0.18)'

export function CrapsTable() {
  const { state } = useGame()
  const inPoint = state.phase === 'point'
  const hasPassLine = state.bets.some(b => b.type === 'passLine')
  const hasDontPass = state.bets.some(b => b.type === 'dontPass')

  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: 12,
      border: '2px solid rgba(201,168,76,0.35)',
      background: 'radial-gradient(ellipse at 50% 60%, #1a0d0d 0%, #0d0808 100%)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.4)',
    }}>

      {/* Point puck */}
      {state.point && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 30,
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: '#f0ece0',
          border: '2px solid #c9a84c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, color: '#0f0a0a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
        }}>
          {state.point}
        </div>
      )}

      {/* ═══ LEFT SECTION: Main table (65%) ═══ */}
      <div style={{
        flex: '0 0 65%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: DIVIDER,
        overflow: 'hidden',
      }}>

        {/* ── Row 1: Don't Come + Place numbers ── */}
        <div style={{
          display: 'flex',
          borderBottom: DIVIDER,
          height: 52,
          flexShrink: 0,
        }}>
          <BetZone betType="dontCome" label="Don't Come" sublabel="Bar 12"
            style={{ width: 80, flexShrink: 0, borderRight: DIVIDER, borderRadius: 0 }}
            disabled={!inPoint} />
          {[4, 5, 6, 8, 9, 10].map((n, i) => (
            <BetZone key={n} betType="place" number={n}
              label={n === 6 ? 'Six' : n === 9 ? 'Nine' : String(n)}
              sublabel={n === 6 || n === 8 ? '7:6' : n === 5 || n === 9 ? '7:5' : '9:5'}
              labelSize={0.75}
              style={{
                flex: 1,
                borderRight: i < 5 ? DIVIDER : 'none',
                borderRadius: 0,
              }}
              disabled={!inPoint} />
          ))}
        </div>

        {/* ── Row 2: Come (large) + Odds column ── */}
        <div style={{
          display: 'flex',
          flex: 2,
          borderBottom: DIVIDER,
          minHeight: 0,
        }}>
          <BetZone betType="come" label="Come" prominent
            style={{ flex: 1, borderRight: DIVIDER, borderRadius: 0 }}
            disabled={!inPoint} />
          <div style={{
            width: 68, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
          }}>
            <BetZone betType="oddsPass" label="Odds" sublabel="Pass Line"
              style={{ flex: 1, borderBottom: DIVIDER, borderRadius: 0 }}
              disabled={!inPoint || !hasPassLine} />
            <BetZone betType="oddsDontPass" label="Odds" sublabel="Don't Pass"
              style={{ flex: 1, borderRadius: 0 }}
              disabled={!inPoint || !hasDontPass} />
          </div>
        </div>

        {/* ── Row 3: Field ── */}
        <div style={{ flexShrink: 0, height: 44, borderBottom: DIVIDER }}>
          <BetZone betType="field"
            label="Field  2 · 3 · 4 · 9 · 10 · 11 · 12"
            sublabel="2 and 12 pay 2:1  ·  loses on 5, 6, 7, 8"
            labelSize={0.7}
            style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>

        {/* ── Row 4: Don't Pass Bar (thin strip) ── */}
        <div style={{ flexShrink: 0, height: 26, borderBottom: DIVIDER }}>
          <BetZone betType="dontPass" label="Don't Pass Bar"
            style={{ width: '100%', height: '100%', borderRadius: 0 }}
            disabled={inPoint} />
        </div>

        {/* ── Row 5: PASS LINE (dominant) ── */}
        <div style={{ flexShrink: 0, flex: 1.4, minHeight: 52, borderBottom: DIVIDER }}>
          <BetZone betType="passLine" label="Pass Line" prominent
            style={{ width: '100%', height: '100%', borderRadius: 0 }}
            disabled={inPoint} />
        </div>

        {/* ── Row 6: Buy / Lay (small) ── */}
        <div style={{ display: 'flex', height: 22, flexShrink: 0 }}>
          {[4, 5, 6, 8, 9, 10].map((n, i) => (
            <BetZone key={`buy${n}`} betType="buy" number={n} label={`Buy ${n}`}
              labelSize={0.45}
              style={{ flex: 1, borderRight: i < 5 ? DIVIDER : DIVIDER, borderRadius: 0 }}
              disabled={!inPoint} />
          ))}
          {[4, 5, 6, 8, 9, 10].map((n, i) => (
            <BetZone key={`lay${n}`} betType="lay" number={n} label={`Lay ${n}`}
              labelSize={0.45}
              style={{ flex: 1, borderLeft: i === 0 ? DIVIDER : 'none', borderRadius: 0 }}
              disabled={!inPoint} />
          ))}
        </div>
      </div>

      {/* ═══ RIGHT SECTION: Props + Dice (35%) ═══ */}
      <div style={{
        flex: '0 0 35%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Dice display */}
        <div style={{
          height: 68, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: DIVIDER,
          padding: '0 8px',
        }}>
          <Dice />
        </div>

        {/* Hardways 2×2 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          height: 68, flexShrink: 0,
          borderBottom: DIVIDER,
        }}>
          {(['hard4', 'hard6', 'hard8', 'hard10'] as const).map((h, i) => (
            <BetZone key={h} betType={h}
              label={`Hard ${[4, 6, 8, 10][i]}`}
              sublabel={i === 0 || i === 3 ? '7:1' : '9:1'}
              labelSize={0.65}
              style={{
                borderRight: i % 2 === 0 ? DIVIDER : 'none',
                borderBottom: i < 2 ? DIVIDER : 'none',
                borderRadius: 0,
              }} />
          ))}
        </div>

        {/* Any 7 + Any Craps */}
        <div style={{ display: 'flex', height: 44, flexShrink: 0, borderBottom: DIVIDER }}>
          <BetZone betType="any7" label="Seven" sublabel="4:1"
            labelSize={0.7}
            style={{ flex: 1, borderRight: DIVIDER, borderRadius: 0 }} />
          <BetZone betType="anyCraps" label="Any Craps" sublabel="7:1"
            labelSize={0.7}
            style={{ flex: 1, borderRadius: 0 }} />
        </div>

        {/* One-roll: Aces, 3, Yo, Boxcars */}
        <div style={{ display: 'flex', height: 44, flexShrink: 0, borderBottom: DIVIDER }}>
          <BetZone betType="aces" label="2" sublabel="30:1"
            style={{ flex: 1, borderRight: DIVIDER, borderRadius: 0 }} />
          <BetZone betType="three" label="3" sublabel="15:1"
            style={{ flex: 1, borderRight: DIVIDER, borderRadius: 0 }} />
          <BetZone betType="yo" label="Yo" sublabel="11·15:1"
            style={{ flex: 1, borderRight: DIVIDER, borderRadius: 0 }} />
          <BetZone betType="boxcars" label="12" sublabel="30:1"
            style={{ flex: 1, borderRadius: 0 }} />
        </div>

        {/* Horn */}
        <div style={{ height: 38, flexShrink: 0, borderBottom: DIVIDER }}>
          <BetZone betType="horn" label="Horn Bet" sublabel="2 · 3 · 11 · 12"
            labelSize={0.7}
            style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>

        {/* Big 6 + Big 8 */}
        <div style={{ display: 'flex', flex: 1, borderBottom: DIVIDER, minHeight: 32 }}>
          <BetZone betType="big6" label="Big 6" sublabel="1:1"
            style={{ flex: 1, borderRight: DIVIDER, borderRadius: 0 }} />
          <BetZone betType="big8" label="Big 8" sublabel="1:1"
            style={{ flex: 1, borderRadius: 0 }} />
        </div>

      </div>
    </div>
  )
}
