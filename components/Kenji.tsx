'use client'
import { useGame } from '@/lib/game-context'
import { useEffect, useState } from 'react'

function KenjiSVG({ reacting }: { reacting: boolean }) {
  return (
    <svg
      viewBox="0 0 100 160"
      style={{
        width: 100, height: 160,
        filter: 'drop-shadow(0 0 14px rgba(201,168,76,0.18))',
        animation: reacting ? 'kenjiLean 0.6s ease-in-out' : 'none',
      }}
    >
      {/* Legs */}
      <rect x="34" y="135" width="12" height="20" rx="4" fill="#111127" />
      <rect x="54" y="135" width="12" height="20" rx="4" fill="#111127" />
      {/* Body — dark suit */}
      <rect x="26" y="80" width="48" height="60" rx="6" fill="#151520" />
      {/* Suit lapels */}
      <polygon points="50,90 36,82 36,118" fill="#0f0f1a" />
      <polygon points="50,90 64,82 64,118" fill="#0f0f1a" />
      {/* White shirt */}
      <rect x="46" y="90" width="8" height="28" fill="#e8e4d8" />
      {/* Tie */}
      <polygon points="50,96 47,98 50,124 53,98" fill="#7a1515" />
      {/* Gold tie bar */}
      <rect x="47" y="110" width="6" height="2" rx="1" fill="#c9a84c" />
      {/* Collar */}
      <polygon points="50,83 43,88 36,82" fill="#e8e4d8" />
      <polygon points="50,83 57,88 64,82" fill="#e8e4d8" />
      {/* Shoulders */}
      <rect x="20" y="78" width="60" height="14" rx="10" fill="#151520" />
      {/* Arms */}
      <rect x="12" y="88" width="14" height="42" rx="6" fill="#151520" />
      <rect x="74" y="88" width="14" height="42" rx="6" fill="#151520" />
      {/* Hands */}
      <ellipse cx="19" cy="133" rx="7" ry="6" fill="#c8a882" />
      <ellipse cx="81" cy="133" rx="7" ry="6" fill="#c8a882" />
      {/* Neck */}
      <rect x="43" y="68" width="14" height="16" rx="4" fill="#c8a882" />
      {/* Head */}
      <ellipse cx="50" cy="50" rx="22" ry="23" fill="#c8a882" />
      {/* Hair — slicked back */}
      <ellipse cx="50" cy="30" rx="22" ry="13" fill="#18100a" />
      <path d="M 28 38 Q 50 22 72 38" fill="#18100a" />
      {/* Ear shadows */}
      <ellipse cx="28" cy="51" rx="4" ry="5" fill="#b89568" />
      <ellipse cx="72" cy="51" rx="4" ry="5" fill="#b89568" />
      {/* Eyes — composed, slightly hooded */}
      <ellipse cx="40" cy="50" rx="4.5" ry="3" fill="#fff" />
      <ellipse cx="60" cy="50" rx="4.5" ry="3" fill="#fff" />
      <circle cx="41" cy="50" r="2.5" fill="#1a0e06" />
      <circle cx="61" cy="50" r="2.5" fill="#1a0e06" />
      {/* Eye shine */}
      <circle cx="42" cy="49" r="0.8" fill="#fff" opacity="0.7" />
      <circle cx="62" cy="49" r="0.8" fill="#fff" opacity="0.7" />
      {/* Subtle smile */}
      <path d="M 43 60 Q 50 65 57 60" stroke="#8a5a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyebrows */}
      <path d="M 35 44 Q 40 42 45 44" stroke="#18100a" strokeWidth="1.5" fill="none" />
      <path d="M 55 44 Q 60 42 65 44" stroke="#18100a" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function Kenji() {
  const { state } = useGame()
  const [displayed, setDisplayed] = useState(state.kenjiLine)
  const [animKey, setAnimKey] = useState(0)
  const [reacting, setReacting] = useState(false)

  useEffect(() => {
    if (state.kenjiLine !== displayed) {
      setReacting(state.isRolling)
      // Brief pause then swap text with animation
      const t = setTimeout(() => {
        setDisplayed(state.kenjiLine)
        setAnimKey(k => k + 1)
        setReacting(false)
      }, state.isRolling ? 700 : 50)
      return () => clearTimeout(t)
    }
  }, [state.kenjiLine, state.isRolling])

  const ratingColor: Record<string, string> = {
    'Pro Move': '#4ade80',
    'Solid': '#86efac',
    'Okay': '#fde68a',
    'Tourist Trap': '#fca5a5',
    'House Gold': '#f87171',
  }

  // Extract rating badge if present in the text
  const ratingMatch = displayed.match(/(✦ Pro Move|◆ Solid|◇ Okay|⚠ Tourist Trap|✗ House Gold)/)
  const rating = ratingMatch ? ratingMatch[1] : null
  const ratingKey = rating?.replace(/[✦◆◇⚠✗] /, '')
  const badgeColor = ratingKey ? ratingColor[ratingKey] : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 8 }}>
      {/* Speech bubble */}
      <div
        key={animKey}
        className="kenji-bubble"
        style={{
          flex: 1,
          width: '100%',
          backgroundColor: 'rgba(26,15,15,0.95)',
          border: '1px solid rgba(201,168,76,0.28)',
          borderRadius: 14,
          padding: '10px 12px',
          overflowY: 'auto',
          animation: 'speechPop 0.3s ease-out',
          position: 'relative',
        }}
      >
        {/* Bubble tail */}
        <div style={{
          position: 'absolute',
          bottom: -8, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(201,168,76,0.28)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -6, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid rgba(26,15,15,0.95)',
        }} />

        {rating && badgeColor && (
          <div style={{
            display: 'inline-block',
            marginBottom: 6,
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: '0.6rem',
            fontFamily: 'Georgia, serif',
            backgroundColor: `${badgeColor}22`,
            border: `1px solid ${badgeColor}66`,
            color: badgeColor,
            letterSpacing: '0.05em',
          }}>
            {rating}
          </div>
        )}

        <p style={{
          color: '#f5f0e8',
          fontSize: '0.7rem',
          lineHeight: 1.55,
          fontFamily: 'Georgia, serif',
          margin: 0,
        }}>
          {displayed.replace(/[✦◆◇⚠✗] (Pro Move|Solid|Okay|Tourist Trap|House Gold)\.?\s?/, '')}
        </p>
      </div>

      {/* Character */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <KenjiSVG reacting={reacting} />
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(201,168,76,0.15)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 6,
          padding: '2px 10px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#c9a84c', fontSize: '0.6rem', fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}>
            KENJI
          </span>
        </div>
      </div>
    </div>
  )
}
