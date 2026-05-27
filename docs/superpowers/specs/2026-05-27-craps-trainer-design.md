# Craps Trainer — Design Spec
_2026-05-27_

## Overview

A browser-based craps trainer for a complete beginner going to Vegas this weekend. The goal is not to simulate a casino — it's to teach the game by narrating every step with a personality-rich on-screen character. The player should finish a session understanding every bet on the table, what each roll means, and how to manage their stack.

---

## Architecture

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS  
**Deployment:** Railway (static Next.js build, no backend)  
**Audio:** Howler.js  
**No backend, no database, no API calls.** All game logic runs in the browser.

Three internal layers:

1. **Rules engine** (`/lib/craps-engine.ts`) — pure functions, no React. Models game state, valid bets per phase, roll outcomes, payout calculations. Written from scratch (existing open-source craps libs are abandoned or have odd APIs). Sourced from Wizard of Odds and dealer training references for accuracy.

2. **Game state** (`/lib/game-context.tsx`) — React context. Holds: current phase, point value, active bets, bankroll, roll history, Kenji's current line. All state transitions go through the rules engine.

3. **UI** — Next.js App Router pages + Tailwind. Single-page layout.

---

## Game Phases

Craps has two phases the player must always know they're in:

### Come-Out Roll
- No point is established
- Pass Line / Don't Pass bets available
- Natural winners: 7 or 11 (Pass Line wins)
- Craps: 2, 3, 12 (Pass Line loses)
- Any other number → sets the Point, game moves to Point phase

### Point Phase
- Point is established (4, 5, 6, 8, 9, or 10)
- Pass Line wins if Point rolls again before a 7
- Don't Pass wins if 7 rolls before Point
- Come / Don't Come bets now available
- 7 = "seven out" → Pass Line loses, round ends, new come-out begins

A **persistent phase banner** is always visible at the top of the table:
- Come-out: `"COME-OUT ROLL — Roll a 7 or 11 to win, avoid 2/3/12"`
- Point: `"POINT IS [X] — Roll a [X] to win. Avoid the 7."`

---

## Bet Coverage (Full Table)

All bets include: plain-English description, payout, house edge %, availability by phase, and Kenji rating.

### Core Bets (Best House Edge — Kenji recommends these)
| Bet | Payout | House Edge | Phase |
|-----|--------|-----------|-------|
| Pass Line | 1:1 | 1.41% | Come-out only |
| Don't Pass | 1:1 | 1.36% | Come-out only |
| Come | 1:1 | 1.41% | Point phase |
| Don't Come | 1:1 | 1.36% | Point phase |
| Free Odds (Pass/Come) | True odds | 0% | After point set |
| Free Odds (Don't Pass/Don't Come) | True odds | 0% | After point set |

### Place Bets
| Bet | Payout | House Edge |
|-----|--------|-----------|
| Place 4 or 10 | 9:5 | 6.67% |
| Place 5 or 9 | 7:5 | 4.00% |
| Place 6 or 8 | 7:6 | 1.52% |

### Buy/Lay Bets (5% commission on bet placement)
| Bet | Payout | House Edge |
|-----|--------|-----------|
| Buy 4 or 10 | 2:1 (true odds) | 4.76% |
| Buy 5 or 9 | 3:2 (true odds) | 4.76% |
| Buy 6 or 8 | 6:5 (true odds) | 4.76% |
| Lay 4 or 10 | 1:2 | 2.44% |
| Lay 5 or 9 | 2:3 | 3.23% |
| Lay 6 or 8 | 5:6 | 4.00% |

Note: Buy 4/10 is worse than Place 4/10 — Kenji will flag this. Buy 6/8 is worse than Place 6/8 — Kenji will flag this too.

### One-Roll Proposition Bets (Kenji rates these "sucker bets")
| Bet | Payout | House Edge |
|-----|--------|-----------|
| Any 7 | 4:1 | 16.67% |
| Any Craps | 7:1 | 11.11% |
| Ace-Deuce (3) | 15:1 | 11.11% |
| Aces (2) | 30:1 | 13.89% |
| Boxcars (12) | 30:1 | 13.89% |
| Field | 1:1 (2/12 pay 2:1) | 5.56% |

### Hardways
| Bet | Payout | House Edge |
|-----|--------|-----------|
| Hard 4 or 10 | 7:1 | 11.11% |
| Hard 6 or 8 | 9:1 | 9.09% |

### Other
| Bet | Payout | House Edge | Notes |
|-----|--------|-----------|-------|
| Big 6 / Big 8 | 1:1 | 9.09% | Same as Place 6/8 but pays worse — Kenji calls this a tourist tax |
| Horn | 27:4 (2/12), 3:1 (3/11) | ~12.5% | One-roll bet split across 2, 3, 11, 12 |
| Hop (easy) | 15:1 | 11.11% | Bet on a specific dice combo with 2 ways to make it (e.g., 3+2) |
| Hop (hard) | 30:1 | 13.89% | Bet on a specific doubles combo (e.g., 2+2) — one way to make it |

Hop bets are shown on the table layout but marked as advanced. Kenji explains them if clicked but discourages them.

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE BANNER: "COME-OUT ROLL — Roll a 7 or 11 to win"       │
├───────────────────────────────────┬──────────────────────────┤
│                                   │                          │
│         CRAPS TABLE               │   KENJI                  │
│         (felt, interactive)       │   [illustrated figure]   │
│                                   │   [speech bubble]        │
│   [bet zones clickable]           │                          │
│   [dice display center]           │   house edge meter       │
│   [roll history strip]            │   bet rating badge       │
│                                   │                          │
├───────────────────────────────────┴──────────────────────────┤
│  CHIP RACK  [$25] [$50] [$100]     BANKROLL: $500   [ROLL]   │
└──────────────────────────────────────────────────────────────┘
```

---

## Kenji — The Pit Boss

### Character Design
- Japanese pit boss, middle-aged, composed, slightly amused
- CSS/SVG illustrated (no image assets to load)
- Idle state: subtle bow/sway animation
- Reactive state: leans in on big rolls, shakes head on sucker bets
- Speech bubble appears with each narration, fades between lines

### Commentary Structure
Kenji speaks at every state transition:

**Phase transitions:**
- Come-out starts → explains what the come-out roll is
- Point set → announces the point and what to do now
- Seven-out → explains what happened, resets context

**Bet placement (every bet triggers):**
- What the bet is in plain English
- Payout if it hits
- House edge % with a plain-English label (0-2% = "excellent", 2-5% = "okay", 5%+ = "the house loves you for this")
- Whether it's available in the current phase (with explanation if not)
- Kenji's rating: Pro Move / Solid / Tourist Trap / Rookie Tax

**Roll outcome:**
- What the number means right now given the current phase + active bets
- Which bets resolved and how
- What to think about next

**Flavor commentary (~30% of lines):**
- Philosophical asides: *"The seven comes when it pleases. This is its nature."*
- Dry observations: *"Another field bet. The house appreciates your generosity."*
- Encouragement on good bets: *"Pass Line with full odds. You've been doing your homework."*
- ~60 flavor lines written upfront, cycled with recency weighting so they don't repeat

### Content Sources
Rules engine and all coaching content sourced from:
- Wizard of Odds (wizardofodds.com) — house edges, payouts, strategy
- Michael Shackleford's craps guide — optimal play
- Vegas dealer training references — terminology, table etiquette

---

## Atmosphere + Audio

### Visual Atmosphere
- **Color palette:** Deep burgundy felt (#1a0a0a), gold accents (#c9a84c), cream text (#f5f0e8)
- **Smoke effect:** CSS particle animation, 8-12 slow-drifting smoke wisps across the table
- **Vignette:** Dark radial gradient at table edges, spotlight feel on the center
- **Felt texture:** CSS noise/grain texture overlay
- **Typography:** Serif for headers (Playfair Display), clean sans for UI labels

### Audio (Howler.js)
| Sound | Trigger |
|-------|---------|
| Smooth jazz loop | Background, plays on first interaction, toggle-able |
| Dice rattle + clatter | Roll button pressed, dice landing |
| Chip clink | Bet placed, chips moved |
| Soft win chime | Bet wins |
| Low loss tone | Bet loses |
| Seven-out sound | Round ends on 7 |

Volume controls: jazz volume slider + mute-all toggle. Sounds load lazily.

Audio files: royalty-free from Free Music Archive (jazz) and freesound.org (SFX).

---

## Bankroll Management

- Starting bankroll: $500 (configurable at start)
- Chip denominations: $1, $5, $25, $100
- Click chip denomination → click bet zone to place
- Minimum bet: $5 (standard Vegas table minimum)
- Table limits displayed: $5 min / $1000 max
- Bankroll tracker always visible; Kenji comments if you're running low
- "Rebuy" button appears if bankroll hits $0

---

## Responsive / Platform

- Desktop-first (this is a learning tool, not a mobile game)
- Minimum width: 1024px; graceful degradation below
- No mobile layout needed for v1

---

## Out of Scope (v1)

- AI coach overlay (future — non-Claude, low-latency option)
- Multiplayer
- Saving session history
- Mobile layout
- Tutorial mode / forced walkthrough
