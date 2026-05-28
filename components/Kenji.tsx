'use client'
import { useGame } from '@/lib/game-context'
import { useEffect, useState } from 'react'

export function Kenji() {
  const { state } = useGame()
  const [displayed, setDisplayed] = useState(state.kenjiLine)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (state.kenjiLine !== displayed) {
      const t = setTimeout(() => {
        setDisplayed(state.kenjiLine)
        setAnimKey(k => k + 1)
      }, state.isRolling ? 600 : 50)
      return () => clearTimeout(t)
    }
  }, [state.kenjiLine, state.isRolling])

  const clean = displayed.replace(/[✦◆◇⚠✗] (Pro Move|Solid|Okay|Tourist Trap|House Gold)\.?\s?/, '')

  return (
    <div style={{
      height: '100%',
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 12px 8px',
        borderBottom: '1px solid #21262d',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#7d8590',
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 600,
        }}>
          Pit Boss
        </span>
      </div>
      <div
        key={animKey}
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <p style={{
          color: '#c9d1d9',
          fontSize: '0.72rem',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {clean}
        </p>
      </div>
    </div>
  )
}
