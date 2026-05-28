'use client'
import { useState } from 'react'

const STEPS = [
  {
    title: "You're on a Team",
    body: "Everyone at the table bets on the same pair of dice. One person throws — the shooter — and everybody else bets on the outcome. Most players bet Pass Line together, so when the shooter wins, the whole table wins. Craps is the loudest, most social game in the casino for exactly this reason.",
    rule: null,
    callout: null,
  },
  {
    title: "Phase 1: The Come-Out Roll",
    body: "Every round starts here. Place your Pass Line bet, then roll. Right now, 7 is your best friend.",
    rule: [
      { result: "7 or 11 rolls", outcome: "→ WIN immediately — round over, start again", good: true },
      { result: "2, 3, or 12 rolls", outcome: "→ LOSE immediately — round over, start again", good: false },
      { result: "4, 5, 6, 8, 9, or 10 rolls", outcome: "→ That number becomes \"the point.\" Game shifts to Phase 2.", good: null },
    ],
    callout: null,
  },
  {
    title: "Phase 2: The Point — and the Twist",
    body: "This is the part that confuses everyone. Say the point is 9. Everything just flipped.",
    rule: [
      { result: "Roll 9 again (the point)", outcome: "→ WIN — round over, back to Phase 1", good: true },
      { result: "Roll 7 (\"seven out\")", outcome: "→ LOSE — dice pass to the next shooter", good: false },
      { result: "Roll anything else", outcome: "→ Nothing happens. Keep rolling.", good: null },
    ],
    callout: "The 7 just switched from your best friend to your worst enemy. You spent Phase 1 hoping for a 7 — now you're desperately trying to avoid one. That's the whole game.",
  },
  {
    title: "What Should I Actually Bet?",
    body: "Start simple. There are only a few bets worth making as a beginner:",
    rule: [
      { result: "Pass Line", outcome: "→ Always start here. 1.41% house edge — one of the best bets in any casino.", good: true },
      { result: "Odds (behind Pass Line)", outcome: "→ Add this once the point is set. Zero house edge — the only bet in Vegas with no edge.", good: true },
      { result: "Place 6 or Place 8", outcome: "→ Pays 7:6. Good action once you're comfortable.", good: true },
      { result: "Prop bets (Yo, Any 7, Horn…)", outcome: "→ Fun but expensive. House edge 10–17%. Avoid until you know the game.", good: false },
    ],
    callout: null,
  },
]

interface IntroScreenProps {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        width: 500,
        background: 'radial-gradient(ellipse at 50% 30%, #0f4a28 0%, #062318 100%)',
        border: '2px solid rgba(201,168,76,0.55)',
        borderRadius: 14,
        padding: '32px 36px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      }}>
        {/* Kenji header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: '#1a0d0d',
            border: '2px solid rgba(201,168,76,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>🎲</div>
          <div>
            <div style={{ color: '#c9a84c', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Kenji · Your Pit Boss</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Step {step + 1} of {STEPS.length}
            </div>
          </div>
        </div>

        {/* Step title */}
        <h2 style={{
          color: '#f0e060',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.05em',
          margin: '0 0 12px',
          textTransform: 'uppercase',
        }}>
          {current.title}
        </h2>

        {/* Body */}
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 14,
          lineHeight: 1.7,
          margin: '0 0 16px',
        }}>
          {current.body}
        </p>

        {/* Rules list */}
        {current.rule && (
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: current.callout ? 12 : 16,
          }}>
            {current.rule.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                marginBottom: i < current.rule!.length - 1 ? 10 : 0,
              }}>
                <span style={{
                  fontSize: 13,
                  color: r.good === true ? '#5fd87a' : r.good === false ? '#e06060' : '#c9a84c',
                  minWidth: 8, marginTop: 2, flexShrink: 0,
                }}>
                  {r.good === true ? '✓' : r.good === false ? '✗' : '→'}
                </span>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{r.result} </span>
                  <span style={{
                    color: r.good === true ? '#5fd87a' : r.good === false ? '#e06060' : '#f0e060',
                    fontSize: 13, fontWeight: 600,
                  }}>{r.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Callout box */}
        {current.callout && (
          <div style={{
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
          }}>
            <p style={{
              color: '#f0e060',
              fontSize: 13,
              lineHeight: 1.65,
              margin: 0,
              fontStyle: 'italic',
            }}>
              {current.callout}
            </p>
          </div>
        )}

        {/* Progress dots + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                backgroundColor: i === step ? '#c9a84c' : i < step ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.2)',
                transition: 'background-color 0.2s',
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: '9px 18px',
                  background: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Georgia, serif',
                  fontSize: 13,
                  borderRadius: 7,
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => isLast ? onStart() : setStep(s => s + 1)}
              style={{
                padding: '9px 24px',
                backgroundColor: '#c9a84c',
                color: '#07170e',
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 7,
                border: '2px solid #e8c96a',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {isLast ? 'Start Playing →' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Skip link */}
        {!isLast && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              onClick={onStart}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.25)', fontSize: 11,
                fontFamily: 'Georgia, serif', letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Skip intro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
