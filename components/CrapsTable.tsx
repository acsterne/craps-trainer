'use client'
import { useGame } from '@/lib/game-context'
import { BetZone } from './BetZone'
import { Dice } from './Dice'

const B  = '1px solid rgba(255,255,255,0.1)'
const Bd = '1px solid rgba(255,255,255,0.06)'

function oddsLabel(point: number | null): string {
  if (!point) return 'Odds'
  if (point === 4 || point === 10) return 'Odds · 2:1'
  if (point === 5 || point === 9)  return 'Odds · 3:2'
  return 'Odds · 6:5'
}

export function CrapsTable() {
  const { state } = useGame()
  const inPoint = state.phase === 'point'
  const hasPassLine = state.bets.some(b => b.type === 'passLine')
  const hasDontPass = state.bets.some(b => b.type === 'dontPass')

  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 10,
      border: '1px solid #1e3828',
      background: '#0b1a10',
      display: 'flex', flexDirection: 'row',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ══ MAIN BETTING AREA ══ */}
      <div style={{
        flex: '0 0 63%',
        display: 'flex', flexDirection: 'column',
        borderRight: B,
      }}>

        {/* Row 1: Don't Come + Place numbers */}
        <div style={{ display: 'flex', borderBottom: B, height: 50, flexShrink: 0 }}>
          <BetZone betType="dontCome" label="Don't Come" sublabel="Bar 12"
            style={{ width: 68, flexShrink: 0, borderRight: B, borderRadius: 0 }}
            disabled={!inPoint} />
          {[4, 5, 6, 8, 9, 10].map((n, i) => (
            <BetZone key={n} betType="place" number={n}
              label={n === 6 ? 'Six' : n === 9 ? 'Nine' : String(n)}
              sublabel={n === 6 || n === 8 ? '7:6' : n === 5 || n === 9 ? '7:5' : '9:5'}
              labelSize={0.9}
              style={{ flex: 1, borderRight: i < 5 ? Bd : 'none', borderRadius: 0 }}
              disabled={!inPoint} />
          ))}
        </div>

        {/* Row 2: COME + Odds */}
        <div style={{ flex: 1, display: 'flex', borderBottom: B, minHeight: 0 }}>
          <BetZone betType="come" label="Come" labelSize={2.8} labelColor="#e03030"
            style={{ flex: 1, borderRight: B, borderRadius: 0 }}
            disabled={!inPoint} />
          <div style={{ width: 58, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <BetZone betType="oddsPass"
              label={oddsLabel(state.point)}
              sublabel="zero edge"
              labelSize={0.4}
              style={{
                flex: 1, borderBottom: Bd, borderRadius: 0,
                backgroundColor: inPoint && hasPassLine ? 'rgba(63,185,80,0.08)' : undefined,
              }}
              disabled={!inPoint || !hasPassLine} />
            <BetZone betType="oddsDontPass" label="Odds" sublabel="Don't"
              style={{ flex: 1, borderRadius: 0 }}
              disabled={!inPoint || !hasDontPass} />
          </div>
        </div>

        {/* Row 3: Field */}
        <div style={{ flexShrink: 0, height: 42, borderBottom: B }}>
          <BetZone betType="field"
            label="Field  ②  3 · 4 · 9 · 10 · 11  ⑫"
            sublabel="2 and 12 pay double · loses on 5, 6, 7, 8"
            labelSize={0.68}
            style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>

        {/* Row 4: Don't Pass Bar */}
        <div style={{ flexShrink: 0, height: 22, borderBottom: B }}>
          <BetZone betType="dontPass" label="Don't Pass Bar"
            style={{ width: '100%', height: '100%', borderRadius: 0 }}
            disabled={inPoint} />
        </div>

        {/* Row 5: Pass Line */}
        <div style={{ flexShrink: 0, flex: 1.4, minHeight: 48, borderBottom: B }}>
          <BetZone betType="passLine" label="Pass Line" prominent labelColor="#e8c96a"
            style={{ width: '100%', height: '100%', borderRadius: 0, backgroundColor: 'rgba(232,201,106,0.04)' }}
            disabled={inPoint} />
        </div>

        {/* Row 6: Buy / Lay micro strip */}
        <div style={{ display: 'flex', height: 16, flexShrink: 0 }}>
          {[4, 5, 6, 8, 9, 10].map((n, i) => (
            <BetZone key={`buy${n}`} betType="buy" number={n} label={`Buy ${n}`}
              labelSize={0.36}
              style={{ flex: 1, borderRight: Bd, borderRadius: 0 }}
              disabled={!inPoint} />
          ))}
          {[4, 5, 6, 8, 9, 10].map((n, i) => (
            <BetZone key={`lay${n}`} betType="lay" number={n} label={`Lay ${n}`}
              labelSize={0.36}
              style={{ flex: 1, borderLeft: i === 0 ? Bd : 'none', borderRadius: 0 }}
              disabled={!inPoint} />
          ))}
        </div>
      </div>

      {/* ══ PROPOSITION BETS ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Dice */}
        <div style={{
          height: 56, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: B,
        }}>
          <Dice />
        </div>

        {/* Prop label */}
        <div style={{
          height: 14, flexShrink: 0, borderBottom: Bd,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.32rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Proposition Bets
          </span>
        </div>

        <BetZone betType="any7" label="Seven" sublabel="4 to 1"
          diceIcons="⚀⚅  ⚁⚄  ⚂⚃"
          labelSize={1.0}
          style={{ flexShrink: 0, height: 40, borderBottom: B, borderRadius: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 58, flexShrink: 0, borderBottom: B }}>
          <BetZone betType="hard4"  label="Hard 4"  sublabel="7:1" diceIcons="⚁⚁" labelSize={0.62} style={{ borderRight: Bd, borderBottom: Bd, borderRadius: 0 }} />
          <BetZone betType="hard6"  label="Hard 6"  sublabel="9:1" diceIcons="⚂⚂" labelSize={0.62} style={{ borderBottom: Bd, borderRadius: 0 }} />
          <BetZone betType="hard8"  label="Hard 8"  sublabel="9:1" diceIcons="⚃⚃" labelSize={0.62} style={{ borderRight: Bd, borderRadius: 0 }} />
          <BetZone betType="hard10" label="Hard 10" sublabel="7:1" diceIcons="⚄⚄" labelSize={0.62} style={{ borderRadius: 0 }} />
        </div>

        <div style={{ display: 'flex', height: 36, flexShrink: 0, borderBottom: B }}>
          <BetZone betType="aces"    label="2"   sublabel="30:1" diceIcons="⚀⚀" style={{ flex:1, borderRight:Bd, borderRadius:0 }} />
          <BetZone betType="three"   label="3"   sublabel="15:1" diceIcons="⚀⚁" style={{ flex:1, borderRight:Bd, borderRadius:0 }} />
          <BetZone betType="yo"      label="Yo"  sublabel="15:1" diceIcons="⚄⚅" style={{ flex:1, borderRight:Bd, borderRadius:0 }} />
          <BetZone betType="boxcars" label="12"  sublabel="30:1" diceIcons="⚅⚅" style={{ flex:1, borderRadius:0 }} />
        </div>

        <BetZone betType="horn" label="Horn" sublabel="2·3·11·12" diceIcons="⚀⚀ ⚄⚅" labelSize={0.7}
          style={{ flexShrink:0, height:26, borderBottom:B, borderRadius:0 }} />

        <BetZone betType="anyCraps" label="Any Craps" sublabel="7 to 1" diceIcons="⚀⚀ ⚀⚁ ⚅⚅" labelSize={0.8}
          style={{ flexShrink:0, height:34, borderBottom:B, borderRadius:0 }} />

        <div style={{ display:'flex', flex:1, minHeight:22 }}>
          <BetZone betType="big6" label="Big 6" sublabel="1:1 ⚠" style={{ flex:1, borderRight:Bd, borderRadius:0 }} />
          <BetZone betType="big8" label="Big 8" sublabel="1:1 ⚠" style={{ flex:1, borderRadius:0 }} />
        </div>
      </div>

      {/* Point puck */}
      {state.point && (
        <div style={{
          position: 'absolute', top: 6, left: '43%', transform: 'translateX(-50%)',
          zIndex: 50, width: 28, height: 28, borderRadius: '50%',
          background: '#e8c96a',
          border: '2px solid #c9a84c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 12, color: '#0f1117',
          boxShadow: '0 0 12px rgba(232,201,106,0.6)',
        }}>
          {state.point}
        </div>
      )}
    </div>
  )
}
