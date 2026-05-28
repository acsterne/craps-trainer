'use client'
import { useState, useEffect, useRef } from 'react'
import { GameProvider, useGame } from '@/lib/game-context'
import { audio } from '@/lib/audio'
import { PhaseBanner } from '@/components/PhaseBanner'
import { CrapsTable } from '@/components/CrapsTable'
import { Kenji } from '@/components/Kenji'
import { ChipRack } from '@/components/ChipRack'
import { RollHistory } from '@/components/RollHistory'
import { IntroScreen } from '@/components/IntroScreen'
import { RollResultOverlay } from '@/components/RollResultOverlay'

function GameApp() {
  const { state } = useGame()
  const [showIntro, setShowIntro] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const wasRolling = useRef(false)

  useEffect(() => {
    if (wasRolling.current && !state.isRolling && state.lastRoll !== null) {
      setShowResult(true)
    }
    wasRolling.current = state.isRolling
  }, [state.isRolling, state.lastRoll])

  useEffect(() => {
    function onFirstGesture() {
      audio.startJazz()
      window.removeEventListener('click', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
    window.addEventListener('click', onFirstGesture)
    window.addEventListener('keydown', onFirstGesture)
    return () => {
      window.removeEventListener('click', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
  }, [])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#0f1117',
    }}>
      {/* Phase banner */}
      <div style={{ flexShrink: 0 }}>
        <PhaseBanner />
      </div>

      {/* Main area */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 8,
        padding: '8px 10px 4px',
        minHeight: 0,
      }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CrapsTable />
        </div>
        <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <Kenji />
        </div>
      </div>

      {/* Roll history */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #21262d' }}>
        <RollHistory />
      </div>

      {/* Chip rack */}
      <div style={{ flexShrink: 0 }}>
        <ChipRack />
      </div>

      {showResult && <RollResultOverlay onContinue={() => setShowResult(false)} />}
      {showIntro  && <IntroScreen onStart={() => setShowIntro(false)} />}
    </div>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  )
}
