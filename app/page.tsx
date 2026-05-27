'use client'
import { GameProvider } from '@/lib/game-context'
import { PhaseBanner } from '@/components/PhaseBanner'
import { CrapsTable } from '@/components/CrapsTable'
import { Kenji } from '@/components/Kenji'
import { ChipRack } from '@/components/ChipRack'
import { RollHistory } from '@/components/RollHistory'

function SmokeParticles() {
  const particles = [
    { left: '8%',  top: '55%', delay: '0s',   duration: '12s' },
    { left: '22%', top: '65%', delay: '3s',   duration: '16s' },
    { left: '42%', top: '70%', delay: '6s',   duration: '14s' },
    { left: '60%', top: '60%', delay: '1s',   duration: '18s' },
    { left: '78%', top: '68%', delay: '8s',   duration: '11s' },
    { left: '90%', top: '55%', delay: '4s',   duration: '15s' },
    { left: '35%', top: '75%', delay: '9s',   duration: '13s' },
    { left: '55%', top: '80%', delay: '2s',   duration: '17s' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="smoke-particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <div style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#0a0606',
      }}>
        <SmokeParticles />
        <div className="vignette" />

        {/* Phase banner */}
        <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
          <PhaseBanner />
        </div>

        {/* Main area: table + Kenji */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          gap: 10,
          padding: '8px 10px 4px',
          minHeight: 0,
        }}>
          {/* Craps table — 70% */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <CrapsTable />
          </div>

          {/* Kenji sidebar — fixed width */}
          <div style={{ width: 190, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <Kenji />
          </div>
        </div>

        {/* Roll history */}
        <div style={{ position: 'relative', zIndex: 10, flexShrink: 0, borderTop: '1px solid rgba(201,168,76,0.15)' }}>
          <RollHistory />
        </div>

        {/* Chip rack + roll button */}
        <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
          <ChipRack />
        </div>
      </div>
    </GameProvider>
  )
}
