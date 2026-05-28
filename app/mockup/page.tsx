export default function Mockup() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12, boxSizing: 'border-box',
      fontFamily: 'Impact, "Arial Narrow", Arial, sans-serif',
    }}>

      {/* ── Wooden rail ── */}
      <div style={{
        width: '100%', height: '100%',
        maxWidth: 1300, maxHeight: 760,
        borderRadius: 20, padding: 11,
        background: 'linear-gradient(150deg, #b07040 0%, #8a5228 40%, #50280c 70%, #8a5228 100%)',
        boxShadow: '0 0 0 4px #2a1205, 0 20px 60px rgba(0,0,0,0.95)',
        boxSizing: 'border-box',
      }}>

        {/* ── Green felt ── */}
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 11,
          background: 'radial-gradient(ellipse at 50% 30%, #2db050 0%, #1e8c40 50%, #145e28 100%)',
          border: '2px solid rgba(255,255,255,0.45)',
          display: 'flex', flexDirection: 'row',
          overflow: 'hidden', boxSizing: 'border-box',
        }}>

          {/* ════ VERTICAL LEFT STRIPS ════ */}

          {/* PASS LINE — wide, gold text */}
          <div style={{
            width: 44, flexShrink: 0,
            borderRight: '2px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              writingMode: 'vertical-lr', transform: 'rotate(180deg)',
              color: '#ffe840', fontSize: 18, fontWeight: 900,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              textShadow: '0 1px 5px rgba(0,0,0,0.8)', whiteSpace: 'nowrap',
            }}>Pass Line</span>
          </div>

          {/* DON'T PASS BAR — narrower, white text */}
          <div style={{
            width: 26, flexShrink: 0,
            borderRight: '2px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              writingMode: 'vertical-lr', transform: 'rotate(180deg)',
              color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 900,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap',
            }}>Don&apos;t Pass Bar</span>
          </div>

          {/* ════ MAIN TABLE ════ */}
          <div style={{
            flex: '0 0 61%',
            display: 'flex', flexDirection: 'column',
            borderRight: '2px solid rgba(255,255,255,0.6)',
            overflow: 'hidden',
          }}>

            {/* ── Row 1: Don't Come + Place numbers (15% height) ── */}
            <div style={{
              flex: '0 0 15%',
              display: 'flex',
              borderBottom: '2px solid rgba(255,255,255,0.6)',
            }}>
              {/* Don't Come */}
              <div style={{
                width: 86, flexShrink: 0,
                borderRight: '2px solid rgba(255,255,255,0.6)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.3 }}>Don&apos;t{'\n'}Come</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'Georgia, serif' }}>Bar 12</span>
              </div>
              {/* Place numbers */}
              {[
                { n: '4',    p: '9:5' },
                { n: '5',    p: '7:5' },
                { n: 'SIX',  p: '7:6' },
                { n: '8',    p: '7:6' },
                { n: 'NINE', p: '7:5' },
                { n: '10',   p: '9:5' },
              ].map(({ n, p }, i) => (
                <div key={n} style={{
                  flex: 1,
                  borderRight: i < 5 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#ffe840', fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{n}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'Georgia, serif' }}>{p}</span>
                </div>
              ))}
            </div>

            {/* ── Row 2: COME (35% height) ── */}
            <div style={{
              flex: '0 0 35%',
              display: 'flex',
              borderBottom: '2px solid rgba(255,255,255,0.6)',
            }}>
              {/* Come area */}
              <div style={{
                flex: 1, borderRight: '2px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  color: '#cc1a00', fontSize: 96, fontWeight: 900,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  textShadow: '0 3px 10px rgba(0,0,0,0.5)',
                  lineHeight: 1,
                }}>COME</span>
              </div>
              {/* Odds column */}
              <div style={{ width: 58, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  flex: 1, borderBottom: '1px solid rgba(255,255,255,0.25)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.6,
                }}>
                  <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>ODDS</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8, fontFamily: 'Georgia, serif' }}>Pass</span>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.6,
                }}>
                  <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>ODDS</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8, fontFamily: 'Georgia, serif' }}>Don&apos;t</span>
                </div>
              </div>
            </div>

            {/* ── Row 3: FIELD (10% height) ── */}
            <div style={{
              flex: '0 0 10%',
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 2,
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 900, letterSpacing: '0.08em' }}>
                FIELD &nbsp;
                <span style={{ color: '#ffe840' }}>②</span>
                &nbsp; 3 · 4 · 9 · 10 · 11 &nbsp;
                <span style={{ color: '#ffe840' }}>⑫</span>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: 'Georgia, serif' }}>2 and 12 pay double &nbsp;·&nbsp; loses on 5, 6, 7, 8</span>
            </div>

            {/* ── Row 4: Don't Pass Bar thin strip (4% height) ── */}
            <div style={{
              flex: '0 0 4%', minHeight: 20,
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Don&apos;t Pass Bar
              </span>
            </div>

            {/* ── Row 5: PASS LINE — dominant (36% height) ── */}
            <div style={{
              flex: '0 0 36%',
              position: 'relative',
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Big 6/8 in bottom-left curved corner */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0,
                width: 80, height: 80,
                borderRight: '1px solid rgba(255,255,255,0.35)',
                borderTop: '1px solid rgba(255,255,255,0.35)',
                borderTopRightRadius: 28,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                background: 'rgba(0,0,0,0.12)',
              }}>
                <span style={{ color: '#ff2222', fontSize: 26, fontWeight: 900, lineHeight: 1 }}>6</span>
                <span style={{ color: '#ff2222', fontSize: 26, fontWeight: 900, lineHeight: 1 }}>8</span>
              </div>
              <span style={{
                color: '#ffffff', fontSize: 58, fontWeight: 900,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              }}>PASS LINE</span>
            </div>

            {/* ── Row 6: Buy / Lay micro strip ── */}
            <div style={{ display: 'flex', minHeight: 18, flexShrink: 0 }}>
              {[4,5,6,8,9,10].map((n,i) => (
                <div key={`b${n}`} style={{
                  flex: 1, borderRight: '1px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', fontWeight: 900, textTransform: 'uppercase' }}>BUY {n}</span>
                </div>
              ))}
              {[4,5,6,8,9,10].map((n,i) => (
                <div key={`l${n}`} style={{
                  flex: 1, borderLeft: i===0 ? '1px solid rgba(255,255,255,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', fontWeight: 900, textTransform: 'uppercase' }}>LAY {n}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ════ PROPOSITION BETS ════ */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Dice */}
            <div style={{
              height: 58, flexShrink: 0,
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {[0,1].map(i => (
                <div key={i} style={{
                  width: 38, height: 38, borderRadius: 7,
                  background: 'linear-gradient(145deg, #fafaf8, #e8e4d8)',
                  border: '1px solid #ccc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  fontSize: 10,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#222' }} />
                </div>
              ))}
            </div>

            {/* Prop header */}
            <div style={{
              height: 16, flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 7, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 900 }}>
                Proposition Bets
              </span>
            </div>

            {/* SEVEN */}
            <div style={{
              height: 46, flexShrink: 0,
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#ffe840', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>Seven</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Georgia, serif' }}>4 to 1</span>
            </div>

            {/* Hardways 2×2 */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              height: 64, flexShrink: 0,
              borderBottom: '2px solid rgba(255,255,255,0.6)',
            }}>
              {[['Hard 4','7:1'],['Hard 6','9:1'],['Hard 8','9:1'],['Hard 10','7:1']].map(([label, odds], i) => (
                <div key={label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  borderRight: i%2===0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  borderBottom: i<2 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                }}>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'Georgia, serif' }}>{odds}</span>
                </div>
              ))}
            </div>

            {/* 2 / 3 / Yo / 12 */}
            <div style={{ display: 'flex', height: 40, flexShrink: 0, borderBottom: '2px solid rgba(255,255,255,0.6)' }}>
              {[['2','30:1'],['3','15:1'],['Yo','15:1'],['12','30:1']].map(([label, odds], i) => (
                <div key={label} style={{
                  flex: 1,
                  borderRight: i<3 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#ffe840', fontSize: 16, fontWeight: 900 }}>{label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'Georgia, serif' }}>{odds}</span>
                </div>
              ))}
            </div>

            {/* Horn Bet */}
            <div style={{
              height: 30, flexShrink: 0,
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Horn Bet</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontFamily: 'Georgia, serif' }}>2 · 3 · 11 · 12</span>
            </div>

            {/* Any Craps */}
            <div style={{
              height: 40, flexShrink: 0,
              borderBottom: '2px solid rgba(255,255,255,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#ffe840', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Any Craps</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Georgia, serif' }}>7 to 1</span>
            </div>

            {/* Big 6 / Big 8 (bottom of props) */}
            <div style={{ flex: 1, display: 'flex', minHeight: 30 }}>
              <div style={{
                flex: 1, borderRight: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>Big 6</span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontFamily: 'Georgia, serif' }}>1:1 ⚠</span>
              </div>
              <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase' }}>Big 8</span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontFamily: 'Georgia, serif' }}>1:1 ⚠</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
