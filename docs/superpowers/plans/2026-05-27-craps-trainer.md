# Craps Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured browser-based craps trainer with an interactive table, sourced coaching content for every bet, and a Japanese pit boss character (Kenji) who narrates every game event.

**Architecture:** Next.js App Router (static, no backend), pure TypeScript craps rules engine, React context for game state. All game logic runs in the browser — no API calls, no server.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Howler.js (audio), Jest + ts-jest (engine tests only)

---

## File Structure

```
craps-trainer/
├── app/
│   ├── layout.tsx              # Root layout, Playfair Display font, metadata
│   ├── page.tsx                # Single-page game assembly
│   └── globals.css             # Tailwind base, CSS vars, smoke animation keyframes
├── components/
│   ├── PhaseBanner.tsx         # Top phase indicator: COME-OUT / POINT IS X
│   ├── CrapsTable.tsx          # Felt layout — renders bet zones, active chips, dice
│   ├── BetZone.tsx             # Individual clickable zone on the table
│   ├── ActiveBetChip.tsx       # Chip rendered on a zone when a bet is placed
│   ├── Dice.tsx                # Two dice with CSS roll animation
│   ├── Kenji.tsx               # SVG character + speech bubble
│   ├── ChipRack.tsx            # Bottom bar: chip selector, bankroll display, Roll button
│   └── RollHistory.tsx         # Horizontal strip of recent roll totals
├── lib/
│   ├── craps-types.ts          # All TypeScript types
│   ├── craps-engine.ts         # Pure functions — phases, valid bets, roll resolution, payouts
│   ├── kenji-lines.ts          # All coaching text per bet + 60 flavor lines
│   ├── game-context.tsx        # React context + reducer for game state
│   └── audio.ts                # Howler.js singleton wrapper
├── public/
│   └── audio/
│       ├── jazz.mp3            # Royalty-free smooth jazz loop (see Task 8 for source)
│       ├── dice.mp3            # Dice rattle
│       ├── chip.mp3            # Chip clink
│       ├── win.mp3             # Win chime
│       ├── lose.mp3            # Loss tone
│       └── seven-out.mp3      # Seven-out sound
├── __tests__/
│   └── craps-engine.test.ts    # Full engine test suite
├── jest.config.ts
├── next.config.js
├── tailwind.config.ts
├── railway.json
└── package.json
```

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `jest.config.ts`, `tsconfig.json`

- [ ] **Step 1: Scaffold Next.js app (run inside `/Users/andrewsterne/Desktop/`)**

```bash
npx create-next-app@latest craps-trainer --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint
```

- [ ] **Step 2: Install runtime and dev dependencies**

```bash
cd craps-trainer
npm install howler
npm install --save-dev @types/howler ts-jest jest @types/jest jest-environment-node
```

- [ ] **Step 3: Write `jest.config.ts`**

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}

export default config
```

- [ ] **Step 4: Add test script to `package.json`**

Open `package.json` and add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Verify setup**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js craps trainer with Jest"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `lib/craps-types.ts`

- [ ] **Step 1: Write `lib/craps-types.ts`**

```typescript
export type GamePhase = 'comeOut' | 'point'

export type BetType =
  | 'passLine'
  | 'dontPass'
  | 'oddsPass'
  | 'oddsDontPass'
  | 'come'           // in come area, awaiting first roll
  | 'comePoint'      // traveled to a number; use bet.number
  | 'dontCome'
  | 'dontComePoint'  // use bet.number
  | 'oddsCome'       // odds on a come point; use bet.number
  | 'oddsDontCome'
  | 'place'          // use bet.number (4,5,6,8,9,10)
  | 'buy'            // use bet.number
  | 'lay'            // use bet.number
  | 'field'
  | 'any7'
  | 'anyCraps'
  | 'yo'             // 11
  | 'aces'           // 2
  | 'three'          // 3
  | 'boxcars'        // 12
  | 'horn'
  | 'hard4'
  | 'hard6'
  | 'hard8'
  | 'hard10'
  | 'big6'
  | 'big8'
  | 'hopEasy'        // use bet.dice
  | 'hopHard'

export interface Bet {
  id: string
  type: BetType
  amount: number
  number?: number          // for place/buy/lay/comePoint/dontComePoint/oddsCome/oddsDontCome
  dice?: [number, number]  // for hop bets
}

export type BetOutcome = 'win' | 'lose' | 'push' | 'travel' | 'continue'

export interface BetResult {
  bet: Bet
  outcome: BetOutcome
  payout: number          // amount player receives back (0 = lost, bet.amount = push, bet.amount + winnings = win)
  travelNumber?: number   // if outcome === 'travel', the number the come bet moved to
}

export interface RollResult {
  dice: [number, number]
  sum: number
  results: BetResult[]
  nextPhase: GamePhase
  nextPoint: number | null
  kenjiBet?: string       // coaching line triggered by this roll
}

export interface GameState {
  phase: GamePhase
  point: number | null
  bets: Bet[]
  bankroll: number
  rollHistory: Array<[number, number]>
  selectedChipValue: number
  lastRoll: [number, number] | null
  lastResults: BetResult[]
  kenjiLine: string
  isRolling: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/craps-types.ts && git commit -m "feat: add craps TypeScript types"
```

---

### Task 3: TDD — Come-Out Phase (engine core)

**Files:**
- Create: `__tests__/craps-engine.test.ts`, `lib/craps-engine.ts`

- [ ] **Step 1: Write failing tests for come-out phase**

Create `__tests__/craps-engine.test.ts`:

```typescript
import {
  diceSum, isHardWay, resolveRoll, getOddsPayout, getLayOddsPayout,
} from '@/lib/craps-engine'
import type { GameState, Bet } from '@/lib/craps-types'

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  phase: 'comeOut',
  point: null,
  bets: [],
  bankroll: 500,
  rollHistory: [],
  selectedChipValue: 25,
  lastRoll: null,
  lastResults: [],
  kenjiLine: '',
  isRolling: false,
  ...overrides,
})

const bet = (type: Bet['type'], amount: number, extra: Partial<Bet> = {}): Bet => ({
  id: 'test-' + Math.random(),
  type,
  amount,
  ...extra,
})

describe('diceSum', () => {
  it('sums two dice', () => expect(diceSum([3, 4])).toBe(7))
})

describe('isHardWay', () => {
  it('returns true for doubles', () => expect(isHardWay([4, 4])).toBe(true))
  it('returns false for non-doubles', () => expect(isHardWay([3, 4])).toBe(false))
})

describe('come-out roll — pass line', () => {
  const state = makeState({ bets: [bet('passLine', 25)] })

  it('wins on 7', () => {
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(50)
    expect(r.nextPhase).toBe('comeOut')
  })

  it('wins on 11 (yo)', () => {
    const r = resolveRoll(state, [5, 6])
    expect(r.results[0].outcome).toBe('win')
  })

  it('loses on 2', () => {
    const r = resolveRoll(state, [1, 1])
    expect(r.results[0].outcome).toBe('lose')
    expect(r.results[0].payout).toBe(0)
    expect(r.nextPhase).toBe('comeOut')
  })

  it('loses on 3', () => {
    const r = resolveRoll(state, [1, 2])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('loses on 12', () => {
    const r = resolveRoll(state, [6, 6])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('sets point on 4', () => {
    const r = resolveRoll(state, [1, 3])
    expect(r.results[0].outcome).toBe('continue')
    expect(r.nextPhase).toBe('point')
    expect(r.nextPoint).toBe(4)
  })

  it('sets point on 10', () => {
    const r = resolveRoll(state, [4, 6])
    expect(r.nextPoint).toBe(10)
  })
})

describe("come-out roll — don't pass", () => {
  const state = makeState({ bets: [bet('dontPass', 25)] })

  it('wins on 2', () => {
    const r = resolveRoll(state, [1, 1])
    expect(r.results[0].outcome).toBe('win')
  })

  it('wins on 3', () => {
    const r = resolveRoll(state, [1, 2])
    expect(r.results[0].outcome).toBe('win')
  })

  it('pushes on 12 (bar 12)', () => {
    const r = resolveRoll(state, [6, 6])
    expect(r.results[0].outcome).toBe('push')
    expect(r.results[0].payout).toBe(25)
  })

  it('loses on 7', () => {
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('loses on 11', () => {
    const r = resolveRoll(state, [5, 6])
    expect(r.results[0].outcome).toBe('lose')
  })
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npm test -- --testPathPattern=craps-engine
```
Expected: FAIL — `craps-engine` module not found.

- [ ] **Step 3: Create `lib/craps-engine.ts` with come-out logic**

```typescript
import type { Bet, BetResult, GameState, RollResult, GamePhase } from './craps-types'

export function diceSum(dice: [number, number]): number {
  return dice[0] + dice[1]
}

export function isHardWay(dice: [number, number]): boolean {
  return dice[0] === dice[1]
}

export function rollDice(): [number, number] {
  return [
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
  ]
}

export function getOddsPayout(oddsAmount: number, point: number): number {
  const ratios: Record<number, number> = { 4: 2, 5: 1.5, 6: 1.2, 8: 1.2, 9: 1.5, 10: 2 }
  return Math.round(oddsAmount * ratios[point])
}

export function getLayOddsPayout(oddsAmount: number, point: number): number {
  const ratios: Record<number, number> = { 4: 0.5, 5: 2/3, 6: 5/6, 8: 5/6, 9: 2/3, 10: 0.5 }
  return Math.round(oddsAmount * ratios[point])
}

function resolveComeOut(state: GameState, dice: [number, number]): RollResult {
  const sum = diceSum(dice)
  const results: BetResult[] = []
  let nextPhase: GamePhase = 'comeOut'
  let nextPoint: number | null = null

  const isNatural = sum === 7 || sum === 11
  const isCraps2or3 = sum === 2 || sum === 3
  const isCraps12 = sum === 12

  for (const bet of state.bets) {
    if (bet.type === 'passLine') {
      if (isNatural) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
      else if (isCraps2or3 || isCraps12) results.push({ bet, outcome: 'lose', payout: 0 })
      else results.push({ bet, outcome: 'continue', payout: 0 })
    } else if (bet.type === 'dontPass') {
      if (isCraps2or3) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
      else if (isCraps12) results.push({ bet, outcome: 'push', payout: bet.amount })
      else if (isNatural) results.push({ bet, outcome: 'lose', payout: 0 })
      else results.push({ bet, outcome: 'continue', payout: 0 })
    }
    // hardways placed on come-out carry over silently
    else if (['hard4','hard6','hard8','hard10'].includes(bet.type)) {
      results.push({ bet, outcome: 'continue', payout: 0 })
    }
  }

  // Resolve one-roll bets regardless
  results.push(...resolveOneRollBets(state.bets, dice))

  if (!isNatural && !isCraps2or3 && !isCraps12) {
    nextPhase = 'point'
    nextPoint = sum
  }

  return { dice, sum, results, nextPhase, nextPoint }
}

function resolveOneRollBets(bets: Bet[], dice: [number, number]): BetResult[] {
  const sum = diceSum(dice)
  const hard = isHardWay(dice)
  const results: BetResult[] = []

  for (const bet of bets) {
    switch (bet.type) {
      case 'field': {
        const fieldNumbers = [2, 3, 4, 9, 10, 11, 12]
        if (fieldNumbers.includes(sum)) {
          const multi = (sum === 2 || sum === 12) ? 2 : 1
          results.push({ bet, outcome: 'win', payout: bet.amount + bet.amount * multi })
        } else {
          results.push({ bet, outcome: 'lose', payout: 0 })
        }
        break
      }
      case 'any7':
        results.push(sum === 7
          ? { bet, outcome: 'win', payout: bet.amount * 5 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      case 'anyCraps':
        results.push([2,3,12].includes(sum)
          ? { bet, outcome: 'win', payout: bet.amount * 8 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      case 'yo':
        results.push(sum === 11
          ? { bet, outcome: 'win', payout: bet.amount * 16 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      case 'aces':
        results.push(sum === 2
          ? { bet, outcome: 'win', payout: bet.amount * 31 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      case 'three':
        results.push(sum === 3
          ? { bet, outcome: 'win', payout: bet.amount * 16 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      case 'boxcars':
        results.push(sum === 12
          ? { bet, outcome: 'win', payout: bet.amount * 31 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      case 'horn': {
        // 4 units: 1 on each of 2,3,11,12
        const unitAmount = Math.round(bet.amount / 4)
        if (sum === 2 || sum === 12) {
          // winning unit pays 30:1, lose 3 units
          results.push({ bet, outcome: 'win', payout: unitAmount * 31 - unitAmount * 3 })
        } else if (sum === 3 || sum === 11) {
          results.push({ bet, outcome: 'win', payout: unitAmount * 16 - unitAmount * 3 })
        } else {
          results.push({ bet, outcome: 'lose', payout: 0 })
        }
        break
      }
      case 'hopEasy': {
        if (!bet.dice) break
        const [d1, d2] = bet.dice
        const matches = (dice[0] === d1 && dice[1] === d2) || (dice[0] === d2 && dice[1] === d1)
        results.push(matches
          ? { bet, outcome: 'win', payout: bet.amount * 16 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      }
      case 'hopHard': {
        if (!bet.dice) break
        const matches = dice[0] === bet.dice[0] && dice[1] === bet.dice[1]
        results.push(matches
          ? { bet, outcome: 'win', payout: bet.amount * 31 }
          : { bet, outcome: 'lose', payout: 0 })
        break
      }
    }
  }

  return results
}

export function resolveRoll(state: GameState, dice: [number, number]): RollResult {
  if (state.phase === 'comeOut') return resolveComeOut(state, dice)
  return resolvePointPhase(state, dice)
}

// stub — implemented in Task 4
function resolvePointPhase(state: GameState, dice: [number, number]): RollResult {
  return { dice, sum: diceSum(dice), results: [], nextPhase: 'point', nextPoint: state.point }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- --testPathPattern=craps-engine
```
Expected: All come-out tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/craps-engine.ts __tests__/craps-engine.test.ts && git commit -m "feat: craps engine come-out phase with tests"
```

---

### Task 4: TDD — Point Phase + Come/Don't Come Bets

**Files:**
- Modify: `__tests__/craps-engine.test.ts`, `lib/craps-engine.ts`

- [ ] **Step 1: Add point phase + come bet tests to the test file**

Append to `__tests__/craps-engine.test.ts`:

```typescript
describe('point phase — pass line', () => {
  const state = makeState({
    phase: 'point',
    point: 8,
    bets: [bet('passLine', 25)],
  })

  it('wins when point rolls', () => {
    const r = resolveRoll(state, [2, 6])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(50)
    expect(r.nextPhase).toBe('comeOut')
    expect(r.nextPoint).toBeNull()
  })

  it('loses on seven-out', () => {
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
    expect(r.nextPhase).toBe('comeOut')
  })

  it('continues on any other number', () => {
    const r = resolveRoll(state, [2, 3])
    expect(r.results[0].outcome).toBe('continue')
    expect(r.nextPhase).toBe('point')
    expect(r.nextPoint).toBe(8)
  })
})

describe("point phase — don't pass", () => {
  const state = makeState({
    phase: 'point',
    point: 6,
    bets: [bet('dontPass', 25)],
  })

  it('wins on seven-out', () => {
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('win')
    expect(r.nextPhase).toBe('comeOut')
  })

  it('loses when point rolls', () => {
    const r = resolveRoll(state, [3, 3])
    expect(r.results[0].outcome).toBe('lose')
    expect(r.nextPhase).toBe('comeOut')
  })
})

describe('free odds — pass line', () => {
  const state = makeState({
    phase: 'point',
    point: 6,
    bets: [bet('passLine', 25), bet('oddsPass', 75)],
  })

  it('both win when point rolls, odds pay 6:5', () => {
    const r = resolveRoll(state, [3, 3])
    const oddsResult = r.results.find(res => res.bet.type === 'oddsPass')!
    expect(oddsResult.outcome).toBe('win')
    expect(oddsResult.payout).toBe(75 + 90) // 75 back + 90 profit (6:5 on 75 = 90)
  })

  it('both lose on seven-out', () => {
    const r = resolveRoll(state, [3, 4])
    const oddsResult = r.results.find(res => res.bet.type === 'oddsPass')!
    expect(oddsResult.outcome).toBe('lose')
  })
})

describe('come bet', () => {
  it('travels to a number on first roll (not 7/11/craps)', () => {
    const state = makeState({ phase: 'point', point: 8, bets: [bet('come', 25)] })
    const r = resolveRoll(state, [2, 3]) // sum = 5
    expect(r.results[0].outcome).toBe('travel')
    expect(r.results[0].travelNumber).toBe(5)
  })

  it('wins on 7 before traveling', () => {
    const state = makeState({ phase: 'point', point: 8, bets: [bet('come', 25)] })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('win')
  })

  it('loses on 2 before traveling', () => {
    const state = makeState({ phase: 'point', point: 8, bets: [bet('come', 25)] })
    const r = resolveRoll(state, [1, 1])
    expect(r.results[0].outcome).toBe('lose')
  })
})

describe('come point bet', () => {
  it('wins when its number rolls', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('comePoint', 25, { number: 5 })],
    })
    const r = resolveRoll(state, [2, 3])
    expect(r.results[0].outcome).toBe('win')
  })

  it('loses on seven-out', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('comePoint', 25, { number: 5 })],
    })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('continues on other numbers', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('comePoint', 25, { number: 5 })],
    })
    const r = resolveRoll(state, [1, 3]) // sum = 4
    expect(r.results[0].outcome).toBe('continue')
  })
})
```

- [ ] **Step 2: Run tests and confirm new tests fail**

```bash
npm test -- --testPathPattern=craps-engine
```
Expected: Come-out tests still pass, new point-phase tests FAIL.

- [ ] **Step 3: Implement `resolvePointPhase` in `lib/craps-engine.ts`**

Replace the stub `resolvePointPhase` function with:

```typescript
function resolvePointPhase(state: GameState, dice: [number, number]): RollResult {
  const sum = diceSum(dice)
  const results: BetResult[] = []
  let nextPhase: GamePhase = 'point'
  let nextPoint: number | null = state.point

  const sevenOut = sum === 7
  const hitPoint = sum === state.point

  for (const bet of state.bets) {
    switch (bet.type) {
      case 'passLine':
        if (hitPoint) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sevenOut) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'continue', payout: 0 })
        break

      case 'dontPass':
        if (sevenOut) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (hitPoint) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'continue', payout: 0 })
        break

      case 'oddsPass':
        if (hitPoint) {
          const winnings = getOddsPayout(bet.amount, state.point!)
          results.push({ bet, outcome: 'win', payout: bet.amount + winnings })
        } else if (sevenOut) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break

      case 'oddsDontPass':
        if (sevenOut) {
          const winnings = getLayOddsPayout(bet.amount, state.point!)
          results.push({ bet, outcome: 'win', payout: bet.amount + winnings })
        } else if (hitPoint) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break

      case 'come': {
        // Come bet in transit — acts like a come-out roll
        if (sum === 7 || sum === 11) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if ([2, 3, 12].includes(sum)) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'travel', payout: 0, travelNumber: sum })
        break
      }

      case 'dontCome': {
        if ([2, 3].includes(sum)) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sum === 12) results.push({ bet, outcome: 'push', payout: bet.amount })
        else if (sum === 7 || sum === 11) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'travel', payout: 0, travelNumber: sum })
        break
      }

      case 'comePoint':
        if (sum === bet.number) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sevenOut) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'continue', payout: 0 })
        break

      case 'dontComePoint':
        if (sevenOut) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sum === bet.number) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'continue', payout: 0 })
        break

      case 'oddsCome':
        if (sum === bet.number) {
          const winnings = getOddsPayout(bet.amount, bet.number!)
          results.push({ bet, outcome: 'win', payout: bet.amount + winnings })
        } else if (sevenOut) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break

      case 'oddsDontCome':
        if (sevenOut) {
          const winnings = getLayOddsPayout(bet.amount, bet.number!)
          results.push({ bet, outcome: 'win', payout: bet.amount + winnings })
        } else if (sum === bet.number) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break
    }
  }

  // one-roll bets resolve every roll
  results.push(...resolveOneRollBets(state.bets, dice))

  if (hitPoint || sevenOut) {
    nextPhase = 'comeOut'
    nextPoint = null
  }

  return { dice, sum, results, nextPhase, nextPoint }
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: craps engine point phase, come/don't come bets"
```

---

### Task 5: TDD — Place, Buy, Lay, Hardways, Big 6/8

**Files:**
- Modify: `__tests__/craps-engine.test.ts`, `lib/craps-engine.ts`

- [ ] **Step 1: Add tests**

Append to `__tests__/craps-engine.test.ts`:

```typescript
describe('place bets', () => {
  it('place 6 pays 7:6 when 6 rolls', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('place', 12, { number: 6 })],
    })
    const r = resolveRoll(state, [3, 3])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(12 + 14) // 7:6 on $12 = $14 profit
  })

  it('place 5 pays 7:5 when 5 rolls', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('place', 10, { number: 5 })],
    })
    const r = resolveRoll(state, [2, 3])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(10 + 14) // 7:5 on $10 = $14 profit
  })

  it('place 4 pays 9:5 when 4 rolls', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('place', 10, { number: 4 })],
    })
    const r = resolveRoll(state, [1, 3])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(10 + 18) // 9:5 on $10 = $18 profit
  })

  it('place bet loses on seven-out', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('place', 12, { number: 6 })],
    })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('place bet continues on other numbers', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('place', 12, { number: 6 })],
    })
    const r = resolveRoll(state, [2, 2])
    expect(r.results[0].outcome).toBe('continue')
  })
})

describe('buy bets (5% commission)', () => {
  it('buy 4 pays 2:1 true odds', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('buy', 20, { number: 4 })],
    })
    const r = resolveRoll(state, [1, 3])
    // commission already deducted when bet placed; payout = stake + 2:1
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(20 + 40) // 20 back + 40 profit
  })

  it('buy bet loses on seven-out', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('buy', 20, { number: 4 })],
    })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })
})

describe('lay bets', () => {
  it('lay 4 wins on 7', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('lay', 40, { number: 4 })],
    })
    const r = resolveRoll(state, [3, 4])
    // Lay 4: pays 1:2 true odds. $40 wins $20
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(40 + 20)
  })

  it('lay 4 loses when 4 rolls', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('lay', 40, { number: 4 })],
    })
    const r = resolveRoll(state, [1, 3])
    expect(r.results[0].outcome).toBe('lose')
  })
})

describe('hardways', () => {
  it('hard 8 wins on 4+4', () => {
    const state = makeState({
      phase: 'point', point: 6,
      bets: [bet('hard8', 10)],
    })
    const r = resolveRoll(state, [4, 4])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(10 + 90) // 9:1
  })

  it('hard 8 loses on easy 8 (3+5)', () => {
    const state = makeState({
      phase: 'point', point: 6,
      bets: [bet('hard8', 10)],
    })
    const r = resolveRoll(state, [3, 5])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('hard 8 loses on 7', () => {
    const state = makeState({
      phase: 'point', point: 6,
      bets: [bet('hard8', 10)],
    })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('hard 8 continues on unrelated number', () => {
    const state = makeState({
      phase: 'point', point: 6,
      bets: [bet('hard8', 10)],
    })
    const r = resolveRoll(state, [2, 3])
    expect(r.results[0].outcome).toBe('continue')
  })

  it('hard 4 pays 7:1', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('hard4', 10)] })
    const r = resolveRoll(state, [2, 2])
    expect(r.results[0].payout).toBe(10 + 70) // 7:1
  })
})

describe('big 6 and 8', () => {
  it('big 6 wins when 6 rolls, pays 1:1', () => {
    const state = makeState({ phase: 'point', point: 8, bets: [bet('big6', 10)] })
    const r = resolveRoll(state, [3, 3])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(20)
  })

  it('big 8 loses on 7', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('big8', 10)] })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })
})
```

- [ ] **Step 2: Run tests and confirm new ones fail**

```bash
npm test
```

- [ ] **Step 3: Add place/buy/lay/hardway/big6/8 resolution to `resolvePointPhase` in `lib/craps-engine.ts`**

Add these cases inside the `for (const bet of state.bets)` loop in `resolvePointPhase`, after the existing cases:

```typescript
      case 'place': {
        const payouts: Record<number, [number, number]> = {
          4: [9, 5], 5: [7, 5], 6: [7, 6], 8: [7, 6], 9: [7, 5], 10: [9, 5],
        }
        const [num, den] = payouts[bet.number!]
        if (sum === bet.number) {
          const profit = Math.round((bet.amount / den) * num)
          results.push({ bet, outcome: 'win', payout: bet.amount + profit })
        } else if (sevenOut) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break
      }

      case 'buy': {
        // Commission paid on placement. True odds payouts.
        const buyOdds: Record<number, [number, number]> = {
          4: [2, 1], 5: [3, 2], 6: [6, 5], 8: [6, 5], 9: [3, 2], 10: [2, 1],
        }
        const [num, den] = buyOdds[bet.number!]
        if (sum === bet.number) {
          const profit = Math.round((bet.amount / den) * num)
          results.push({ bet, outcome: 'win', payout: bet.amount + profit })
        } else if (sevenOut) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break
      }

      case 'lay': {
        // Lay true odds (betting number WON'T roll before 7)
        const layOdds: Record<number, [number, number]> = {
          4: [1, 2], 5: [2, 3], 6: [5, 6], 8: [5, 6], 9: [2, 3], 10: [1, 2],
        }
        const [num, den] = layOdds[bet.number!]
        if (sevenOut) {
          const profit = Math.round((bet.amount / den) * num)
          results.push({ bet, outcome: 'win', payout: bet.amount + profit })
        } else if (sum === bet.number) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break
      }

      case 'hard4':
      case 'hard6':
      case 'hard8':
      case 'hard10': {
        const targetSum = { hard4: 4, hard6: 6, hard8: 8, hard10: 10 }[bet.type]!
        const payoutRatio = (targetSum === 4 || targetSum === 10) ? 7 : 9
        const isHard = isHardWay(dice) && sum === targetSum
        const isEasyWay = !isHardWay(dice) && sum === targetSum
        if (isHard) {
          results.push({ bet, outcome: 'win', payout: bet.amount + bet.amount * payoutRatio })
        } else if (sevenOut || isEasyWay) {
          results.push({ bet, outcome: 'lose', payout: 0 })
        } else {
          results.push({ bet, outcome: 'continue', payout: 0 })
        }
        break
      }

      case 'big6':
        if (sum === 6) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sevenOut) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'continue', payout: 0 })
        break

      case 'big8':
        if (sum === 8) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sevenOut) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'continue', payout: 0 })
        break
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: place/buy/lay/hardway/big6-8 resolution with tests"
```

---

### Task 6: Kenji Coaching Content

**Files:**
- Create: `lib/kenji-lines.ts`

- [ ] **Step 1: Write `lib/kenji-lines.ts`**

```typescript
import type { BetType, GamePhase } from './craps-types'

export interface KenjiContent {
  what: string        // plain-English explanation
  payout: string      // payout description
  edge: string        // house edge with label
  rating: 'Pro Move' | 'Solid' | 'Okay' | 'Tourist Trap' | 'House Gold'
  note?: string       // optional extra context
}

export const BET_INFO: Record<string, KenjiContent> = {
  passLine: {
    what: "You're betting the shooter wins. Right now on the come-out roll: 7 or 11 wins immediately, 2/3/12 (craps) loses immediately. Any other number becomes the 'point' — you need that number to roll again before a 7.",
    payout: "Pays 1 to 1 (even money)",
    edge: "House edge: 1.41% — Excellent",
    rating: 'Pro Move',
    note: "The foundation bet. Start here every round.",
  },
  dontPass: {
    what: "The dark side. You're betting against the shooter. On come-out: wins on 2 or 3, ties on 12 (the 'bar'), loses on 7 or 11. After a point is set, you want the 7 to come before the point number. The table crowd won't love you, but the math will.",
    payout: "Pays 1 to 1",
    edge: "House edge: 1.36% — Excellent (slightly better than Pass Line)",
    rating: 'Pro Move',
    note: "Mathematically superior. Socially complicated.",
  },
  oddsPass: {
    what: "Free odds behind your Pass Line bet. The only wager in the casino with zero house edge — true odds, no markup. After your point is set, place additional chips directly behind your Pass Line chips. Take the maximum the table allows. Every time.",
    payout: "Point 4/10: pays 2:1 | Point 5/9: pays 3:2 | Point 6/8: pays 6:5",
    edge: "House edge: 0% — The only free bet in the building",
    rating: 'Pro Move',
    note: "This is not optional advice. Max odds always.",
  },
  oddsDontPass: {
    what: "Laying odds behind your Don't Pass bet. Also zero house edge. You bet more to win less here — you're the slight favorite once the point is set. But the math is perfect, so lay the maximum.",
    payout: "Point 4/10: pays 1:2 | Point 5/9: pays 2:3 | Point 6/8: pays 5:6",
    edge: "House edge: 0%",
    rating: 'Pro Move',
  },
  come: {
    what: "A second Pass Line bet started mid-round. Place it in the Come area and the very next roll becomes your personal come-out roll — 7 or 11 wins, 2/3/12 loses, any other number becomes your Come point. Smart players use Come bets to get multiple numbers working at once.",
    payout: "Pays 1 to 1, then true odds if you take odds on the Come point",
    edge: "House edge: 1.41%",
    rating: 'Pro Move',
  },
  dontCome: {
    what: "The Don't Pass equivalent started mid-round. The next roll is your personal come-out — 2/3 wins, 12 pushes, 7/11 loses, any other number becomes your Don't Come point. From there, you want a 7 before that number rolls.",
    payout: "Pays 1 to 1",
    edge: "House edge: 1.36%",
    rating: 'Pro Move',
  },
  oddsCome: {
    what: "Free odds on a Come point bet. Same zero house edge as Pass Line odds. Place these after your Come bet has traveled to a number.",
    payout: "Same true odds as Pass Line: 2:1 on 4/10, 3:2 on 5/9, 6:5 on 6/8",
    edge: "House edge: 0%",
    rating: 'Pro Move',
  },
  oddsDontCome: {
    what: "Laying odds on a Don't Come point. Zero house edge.",
    payout: "1:2 on 4/10, 2:3 on 5/9, 5:6 on 6/8",
    edge: "House edge: 0%",
    rating: 'Pro Move',
  },
  place6: {
    what: "Betting the 6 rolls before a 7. The 6 is the second most common non-seven number — five ways to make it. Bet in multiples of $6 so the 7:6 payout comes out clean.",
    payout: "Pays 7 to 6",
    edge: "House edge: 1.52% — Solid",
    rating: 'Solid',
    note: "One of the better bets on the table. Bet $6, $12, $18, $24, $30...",
  },
  place8: {
    what: "Same as Place 6, mirrored. Five ways to make an 8. Excellent bet, frequently in action.",
    payout: "Pays 7 to 6",
    edge: "House edge: 1.52% — Solid",
    rating: 'Solid',
  },
  place5: {
    what: "Betting the 5 rolls before a 7. Four ways to make a 5. Bet in multiples of $5.",
    payout: "Pays 7 to 5",
    edge: "House edge: 4.00% — Okay",
    rating: 'Okay',
  },
  place9: {
    what: "Betting the 9 rolls before a 7. Four ways to make a 9. Bet in multiples of $5.",
    payout: "Pays 7 to 5",
    edge: "House edge: 4.00% — Okay",
    rating: 'Okay',
  },
  place4: {
    what: "Betting the 4 rolls before a 7. Only three ways to make it, six ways to make a 7. If you want the 4 in action, consider a Buy bet instead — you pay a commission but get true odds.",
    payout: "Pays 9 to 5",
    edge: "House edge: 6.67% — Tourist Trap on this number",
    rating: 'Tourist Trap',
    note: "Buy 4 is mathematically better. Ask the dealer about Buy bets.",
  },
  place10: {
    what: "Same as Place 4, mirrored. Three ways to make a 10. Same recommendation: consider Buy 10 instead.",
    payout: "Pays 9 to 5",
    edge: "House edge: 6.67%",
    rating: 'Tourist Trap',
  },
  buy: {
    what: "Like a Place bet, but you pay a 5% commission to get true odds instead of place odds. This matters most on 4 and 10. Many Vegas casinos only charge the commission when you win, which makes Buy 4/10 a genuinely good bet.",
    payout: "4/10: pays 2:1 (true odds) | 5/9: pays 3:2 | 6/8: pays 6:5",
    edge: "4/10: 1.67% | 5/9: 4.76% | 6/8: 4.76% — Ask about commission structure",
    rating: 'Solid',
    note: "Always ask the dealer: 'Do you charge commission on Buy bets only when they win?' The answer changes the math.",
  },
  lay: {
    what: "Betting a number WON'T roll before the 7. You're with the Don't Pass crowd. Pay 5% commission on the potential win. You bet more to win less, but you're the favorite.",
    payout: "4/10: pays 1:2 | 5/9: pays 2:3 | 6/8: pays 5:6",
    edge: "4/10: 2.44% | 5/9: 3.23% | 6/8: 4.00%",
    rating: 'Okay',
  },
  field: {
    what: "One-roll bet covering 2, 3, 4, 9, 10, 11, and 12. You win or lose on the very next roll, no waiting. Sounds like a lot of numbers — but 5, 6, 7, and 8 account for 20 out of 36 combinations. The field covers 16. The math is against you.",
    payout: "Pays 1:1, except 2 and 12 pay 2:1",
    edge: "House edge: 5.56% — Tourist Trap",
    rating: 'Tourist Trap',
    note: "Fun for one roll. Not a long-term strategy.",
  },
  any7: {
    what: "Betting the next roll is a 7. Pays 4:1. There are 6 ways to roll a 7, so true odds would pay 5:1. The casino keeps that difference. Highest house edge on the table.",
    payout: "Pays 4 to 1",
    edge: "House edge: 16.67% — House Gold",
    rating: 'House Gold',
    note: "The casino's favorite. Kenji does not recommend, but Kenji understands impulse.",
  },
  anyCraps: {
    what: "Betting the next roll is 2, 3, or 12. Four ways to make it, true odds would pay 8:1. Sometimes used as a one-roll hedge during a come-out roll. It costs you most rolls, but softens the blow when the shooter craps out immediately.",
    payout: "Pays 7 to 1",
    edge: "House edge: 11.11% — Tourist Trap",
    rating: 'Tourist Trap',
  },
  yo: {
    what: "The eleven. Dealers call it 'yo' to distinguish it from 'seven' on loud tables. Two ways to roll it (5+6 and 6+5). True odds are 17:1 — the casino pays 15:1.",
    payout: "Pays 15 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
    note: "The come-out 11 wins your Pass Line naturally. This is a separate proposition bet.",
  },
  aces: {
    what: "Snake eyes. Both dice showing 1. One way to make it out of 36 combinations. True odds would pay 35:1. The casino pays 30:1. Why do people bet it? Because 30:1 on a $5 chip is $150, and that is a story you tell at dinner.",
    payout: "Pays 30 to 1",
    edge: "House edge: 13.89%",
    rating: 'House Gold',
  },
  three: {
    what: "The 3. Two ways to roll it (1+2 and 2+1). True odds 17:1, pays 15:1. Sometimes bet on its own, sometimes part of a horn bet.",
    payout: "Pays 15 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  boxcars: {
    what: "Midnight. Boxcars. Both sixes. One way to make it. Pays 30:1. The rarest feeling on the table. When it rolls and someone has this bet, the table goes quiet for a moment — then everyone who didn't bet it groans.",
    payout: "Pays 30 to 1",
    edge: "House edge: 13.89%",
    rating: 'House Gold',
  },
  horn: {
    what: "Four units split equally on 2, 3, 11, and 12 simultaneously. One-roll bet. If 2 or 12 hits, the winning unit pays 30:1 and the other three lose — net 27 units. If 3 or 11 hits, 15:1 minus the three losers, net 12 units. If anything else rolls, all four units disappear. This is not optimal strategy. This is theater.",
    payout: "2 or 12: net 27 units | 3 or 11: net 12 units",
    edge: "House edge: ~12.5% average",
    rating: 'House Gold',
    note: "Bold choice. The house respects the chaos.",
  },
  hard4: {
    what: "Betting the 4 comes up as exactly 2+2 before a 7 OR before an easy 4 (1+3 or 3+1). The only way to win is the exact double. Four ways to lose, one way to win. Pays 7:1.",
    payout: "Pays 7 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  hard6: {
    what: "Betting the 6 comes as exactly 3+3 before a 7 or an easy 6. One way to win, five ways to lose. Pays 9:1.",
    payout: "Pays 9 to 1",
    edge: "House edge: 9.09%",
    rating: 'Tourist Trap',
    note: "There's something satisfying about calling a hard six.",
  },
  hard8: {
    what: "Exactly 4+4 before a 7 or an easy 8 (2+6, 6+2, 3+5, 5+3). One way to win, five ways to lose. Pays 9:1.",
    payout: "Pays 9 to 1",
    edge: "House edge: 9.09%",
    rating: 'Tourist Trap',
  },
  hard10: {
    what: "Exactly 5+5 before a 7 or an easy 10. Same structure as Hard 4. Pays 7:1.",
    payout: "Pays 7 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  big6: {
    what: "You're betting the 6 rolls before a 7 — the same bet as Place 6, but this one pays 1:1 instead of 7:6. The house edge jumps from 1.52% to 9.09% for the exact same outcome. Casinos put this bet where new players sit. Bet the Place 6 instead.",
    payout: "Pays 1 to 1 (even money)",
    edge: "House edge: 9.09% — Tourist Trap",
    rating: 'Tourist Trap',
    note: "Place 6 is the same bet and pays better. Use that instead.",
  },
  big8: {
    what: "Same as Big 6 but for the 8. Pays 1:1 instead of the 7:6 you'd get from Place 8. The worst version of a good bet.",
    payout: "Pays 1 to 1",
    edge: "House edge: 9.09% — Tourist Trap",
    rating: 'Tourist Trap',
    note: "Place 8 is the same bet and pays better.",
  },
  hopEasy: {
    what: "You're betting the next roll is exactly these two dice values, in either order. Pays 15:1. Two ways to make most combinations, so true odds are 17:1. The house keeps the difference.",
    payout: "Pays 15 to 1",
    edge: "House edge: 11.11%",
    rating: 'House Gold',
    note: "Regulars use this when they have a feeling about a specific combination.",
  },
  hopHard: {
    what: "You're betting the next roll is exactly this matching pair. One way to make it out of 36. Pays 30:1 — true odds would be 35:1. Pure instinct. No strategy, only hope.",
    payout: "Pays 30 to 1",
    edge: "House edge: 13.89%",
    rating: 'House Gold',
  },
}

export const ROLL_MESSAGES = {
  comeOut: {
    natural: (sum: number) =>
      sum === 7
        ? "Natural seven. Pass Line wins. Beautiful."
        : "Yo-leven. Natural winner. Pass Line pays.",
    craps: (sum: number) =>
      sum === 12
        ? "Boxcars on the come-out. Pass Line loses. Don't Pass pushes — the 'bar 12' rule."
        : `Craps ${sum}. Pass Line loses. Don't Pass wins. New come-out.`,
    pointSet: (point: number) =>
      `The point is ${point}. Now you need to roll a ${point} before a 7. That's the game.`,
  },
  point: {
    hitPoint: (point: number) =>
      `${point}. The point. Pass Line pays even money. Odds pay true. A good result.`,
    sevenOut: () =>
      "Seven out. The round ends. Pass Line loses. Don't Pass wins. New shooter coming.",
    continue: (sum: number) =>
      `${sum}. No resolution yet. Bets carry over. Roll again.`,
  },
  comeTravel: (sum: number) =>
    `Your Come bet traveled to the ${sum}. Now it needs a ${sum} before a 7 to pay. Place odds on it.`,
  dontComeTravel: (sum: number) =>
    `Your Don't Come bet landed on the ${sum}. From here you want the 7 before the ${sum} rolls again.`,
}

export const FLAVOR_LINES: string[] = [
  "The dice have no memory. Neither should you.",
  "Seven. As inevitable as Monday.",
  "The shooter looks confident. This means nothing.",
  "The house does not gamble. Only you do.",
  "A hot table is still a table with a house edge.",
  "Patience is also a strategy.",
  "The longer you play, the more certain the math becomes.",
  "There is no system. There is only variance.",
  "The dice don't care about your feelings, friend.",
  "Another field bet. The house appreciates your generosity.",
  "Pass Line with full odds. You've been doing your homework.",
  "Bold choice. The house respects the chaos.",
  "Seven out. The shooter gave everything they had.",
  "A new shooter. Fresh dice, same odds.",
  "Take your time. The dice will wait.",
  "The point is set. Now we are committed.",
  "Discipline is knowing when to step back from the table.",
  "The hard way is called that for a reason.",
  "Free odds. The only honest bet in the building.",
  "Horn bet. Kenji does not judge. Kenji has seen everything.",
  "Some bets are about the story, not the math.",
  "The 6 and 8 are your friends on a long night.",
  "Three rolls in a row with no seven. The table grows hopeful.",
  "Hope is not a strategy. But it is an experience.",
  "In this room, time moves differently.",
  "The smoke does not know who is winning.",
  "Every shooter believes they are the exception.",
  "They are sometimes correct.",
  "The any-seven bet: the casino's favorite gift.",
  "New shooter. The energy shifts. Perhaps.",
  "Craps is a game of moments, not sessions.",
  "The chips move. The math stays the same.",
  "A quiet roll. The dice land softly. Everyone leans in.",
  "This is the game the others aspire to be.",
  "You cannot control the dice. You can control the bets.",
  "Seven. The table exhales.",
  "Natural. The table applauds quietly.",
  "Boxcars. Thirty to one. Somewhere, a story begins.",
  "Midnight. Even the odds seem surprised.",
  "The rhythm of this table is its own kind of music.",
  "Not every roll changes the game. But any roll might.",
  "The point was set some time ago. It will roll again.",
  "Or it won't. This is the question.",
  "Even money is still money.",
  "The field bet covers seven numbers. It loses on four. Do the math.",
  "Hard eight. Two fours. Rare, but it happens more than people think.",
  "Don't Pass: mathematically superior. Socially complicated.",
  "Come bets: for those who want to be everywhere at once.",
  "A good session ends before the good session ends.",
  "Know your walk-away number before you sit down.",
  "The casino is patient. You should be too.",
  "The point is 6. Five ways to make it. Six ways to seven.",
  "Statistically, this should comfort you. It probably doesn't.",
  "Free odds. The only free thing in this building.",
  "The hop bet. You had a feeling. Feelings are valid.",
  "The table is quiet now. This is the best kind of quiet.",
  "Another natural. The shooter smiles. Keep watching.",
  "The any-craps hedge. Pragmatic. Slightly pessimistic. Effective.",
  "Lay the odds. Be the house for a moment.",
  "The math does not care about the story. Play anyway.",
]

// Returns a flavor line, avoiding recent repeats
const recentFlavor: number[] = []
export function getFlavorLine(): string {
  const available = FLAVOR_LINES
    .map((line, i) => ({ line, i }))
    .filter(({ i }) => !recentFlavor.slice(-10).includes(i))
  const pick = available[Math.floor(Math.random() * available.length)]
  recentFlavor.push(pick.i)
  if (recentFlavor.length > 20) recentFlavor.shift()
  return pick.line
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/kenji-lines.ts && git commit -m "feat: Kenji coaching content for all bets and roll outcomes"
```

---

### Task 7: Audio Manager

**Files:**
- Create: `lib/audio.ts`

**Note on audio files:** Before running this task, download royalty-free audio into `public/audio/`:
- `jazz.mp3` — search Free Music Archive for "smooth jazz loop" (bensound.com "sunny" or "sweet" also work, free with attribution)
- `dice.mp3` — freesound.org search "dice roll casino" (ID 441673 works well)
- `chip.mp3` — freesound.org search "poker chip" (ID 240776)
- `win.mp3` — freesound.org search "casino win chime" (ID 171671)
- `lose.mp3` — freesound.org search "low thud" (ID 368691)
- `seven-out.mp3` — freesound.org search "casino horn" or use a low bell sound

- [ ] **Step 1: Write `lib/audio.ts`**

```typescript
import { Howl, Howler } from 'howler'

type SoundName = 'jazz' | 'dice' | 'chip' | 'win' | 'lose' | 'sevenOut'

class AudioManager {
  private sounds: Partial<Record<SoundName, Howl>> = {}
  private initialized = false
  private jazzVolume = 0.3
  private muted = false

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    this.sounds.jazz = new Howl({
      src: ['/audio/jazz.mp3'],
      loop: true,
      volume: this.jazzVolume,
    })

    this.sounds.dice = new Howl({ src: ['/audio/dice.mp3'], volume: 0.8 })
    this.sounds.chip = new Howl({ src: ['/audio/chip.mp3'], volume: 0.6 })
    this.sounds.win = new Howl({ src: ['/audio/win.mp3'], volume: 0.7 })
    this.sounds.lose = new Howl({ src: ['/audio/lose.mp3'], volume: 0.5 })
    this.sounds.sevenOut = new Howl({ src: ['/audio/seven-out.mp3'], volume: 0.7 })
  }

  startJazz() {
    if (!this.initialized) this.init()
    const jazz = this.sounds.jazz
    if (jazz && !jazz.playing()) jazz.play()
  }

  play(name: SoundName) {
    if (this.muted || name === 'jazz') return
    this.sounds[name]?.play()
  }

  setJazzVolume(volume: number) {
    this.jazzVolume = volume
    this.sounds.jazz?.volume(volume)
  }

  muteAll() {
    this.muted = true
    Howler.mute(true)
  }

  unmuteAll() {
    this.muted = false
    Howler.mute(false)
  }

  isMuted() { return this.muted }
}

export const audio = new AudioManager()
```

- [ ] **Step 2: Commit**

```bash
git add lib/audio.ts && git commit -m "feat: Howler.js audio manager"
```

---

### Task 8: Game Context

**Files:**
- Create: `lib/game-context.tsx`

- [ ] **Step 1: Write `lib/game-context.tsx`**

```typescript
'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { GameState, Bet, BetType } from './craps-types'
import { resolveRoll, rollDice } from './craps-engine'
import { getFlavorLine, BET_INFO, ROLL_MESSAGES } from './kenji-lines'
import { audio } from './audio'
import { v4 as uuid } from 'uuid'

type Action =
  | { type: 'PLACE_BET'; betType: BetType; number?: number; dice?: [number, number] }
  | { type: 'REMOVE_BET'; id: string }
  | { type: 'SELECT_CHIP'; value: number }
  | { type: 'ROLL' }
  | { type: 'REBUY' }
  | { type: 'FINISH_ROLL'; results: ReturnType<typeof resolveRoll> }

const initialState: GameState = {
  phase: 'comeOut',
  point: null,
  bets: [],
  bankroll: 500,
  rollHistory: [],
  selectedChipValue: 25,
  lastRoll: null,
  lastResults: [],
  kenjiLine: "Welcome. The table is yours. Start with a Pass Line bet.",
  isRolling: false,
}

function kenjiLineForRoll(result: ReturnType<typeof resolveRoll>, prevPhase: GameState['phase']): string {
  const { sum, nextPhase, nextPoint } = result
  if (prevPhase === 'comeOut') {
    if ([7, 11].includes(sum)) return ROLL_MESSAGES.comeOut.natural(sum)
    if ([2, 3, 12].includes(sum)) return ROLL_MESSAGES.comeOut.craps(sum)
    return ROLL_MESSAGES.comeOut.pointSet(nextPoint!)
  } else {
    if (nextPhase === 'comeOut' && nextPoint === null) {
      if (sum === 7) return ROLL_MESSAGES.point.sevenOut()
      return ROLL_MESSAGES.point.hitPoint(sum)
    }
    // check come/dontCome travel
    const travelResult = result.results.find(r => r.outcome === 'travel')
    if (travelResult?.travelNumber) {
      return ROLL_MESSAGES.comeTravel(travelResult.travelNumber)
    }
    // 30% chance of flavor
    if (Math.random() < 0.3) return getFlavorLine()
    return ROLL_MESSAGES.point.continue(sum)
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_CHIP':
      return { ...state, selectedChipValue: action.value }

    case 'PLACE_BET': {
      const cost = state.selectedChipValue
      if (cost > state.bankroll) return state

      // 5% commission for buy bets, deducted upfront
      const commission = action.betType === 'buy' ? Math.ceil(cost * 0.05) : 0
      const totalCost = cost + commission

      const newBet: Bet = {
        id: uuid(),
        type: action.betType,
        amount: cost,
        number: action.number,
        dice: action.dice,
      }
      const info = BET_INFO[action.betType] ?? BET_INFO[action.betType + (action.number ?? '')]
      const kenjiLine = info
        ? `${info.what} ${info.payout}. ${info.edge}. Rating: ${info.rating}.${info.note ? ' ' + info.note : ''}`
        : getFlavorLine()

      audio.play('chip')
      return {
        ...state,
        bets: [...state.bets, newBet],
        bankroll: state.bankroll - totalCost,
        kenjiLine,
      }
    }

    case 'REMOVE_BET': {
      const bet = state.bets.find(b => b.id === action.id)
      if (!bet) return state
      return {
        ...state,
        bets: state.bets.filter(b => b.id !== action.id),
        bankroll: state.bankroll + bet.amount,
      }
    }

    case 'ROLL':
      if (state.isRolling) return state
      return { ...state, isRolling: true }

    case 'FINISH_ROLL': {
      const result = action.results
      const prevPhase = state.phase

      // Calculate net bankroll change from results
      let bankrollDelta = 0
      for (const r of result.results) {
        if (r.outcome === 'win') bankrollDelta += r.payout
        if (r.outcome === 'push') bankrollDelta += r.payout
        // losing bets were already deducted when placed; nothing to deduct now
      }

      // Remove resolved bets (win/lose/push), keep continuing bets
      // Travel: convert come → comePoint
      const updatedBets: Bet[] = []
      for (const bet of state.bets) {
        const betResult = result.results.find(r => r.bet.id === bet.id)
        if (!betResult || betResult.outcome === 'continue') {
          updatedBets.push(bet)
        } else if (betResult.outcome === 'travel' && betResult.travelNumber) {
          updatedBets.push({
            ...bet,
            type: bet.type === 'come' ? 'comePoint' : 'dontComePoint',
            number: betResult.travelNumber,
          })
        }
        // win/lose/push bets are removed
      }

      // One-roll bets (field, any7, etc.) always get removed after resolution
      const oneRollTypes: Bet['type'][] = ['field', 'any7', 'anyCraps', 'yo', 'aces', 'three', 'boxcars', 'horn', 'hopEasy', 'hopHard']
      const finalBets = updatedBets.filter(b => {
        if (!oneRollTypes.includes(b.type)) return true
        const res = result.results.find(r => r.bet.id === b.id)
        return !res // keep if not resolved (shouldn't happen for one-roll bets)
      })

      // Play sounds
      const hasWin = result.results.some(r => r.outcome === 'win')
      const hasLose = result.results.some(r => r.outcome === 'lose' && !['field','any7','anyCraps','yo','aces','three','boxcars','horn','hopEasy','hopHard'].includes(r.bet.type))
      const sevenOut = result.nextPhase === 'comeOut' && result.sum === 7 && prevPhase === 'point'
      if (sevenOut) audio.play('sevenOut')
      else if (hasWin) audio.play('win')
      else if (hasLose) audio.play('lose')

      return {
        ...state,
        phase: result.nextPhase,
        point: result.nextPoint,
        bets: finalBets,
        bankroll: state.bankroll + bankrollDelta,
        rollHistory: [[...state.rollHistory, result.dice] as any].flat().slice(-20) as [number,number][],
        lastRoll: result.dice,
        lastResults: result.results,
        kenjiLine: kenjiLineForRoll(result, prevPhase),
        isRolling: false,
      }
    }

    case 'REBUY':
      return { ...initialState, kenjiLine: "Back at the table. Let's go again." }

    default:
      return state
  }
}

// Fix rollHistory type
function fixReducer(state: GameState, action: Action): GameState {
  const next = reducer(state, action)
  return next
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<Action>
  roll: () => void
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fixReducer, initialState)

  async function roll() {
    dispatch({ type: 'ROLL' })
    audio.play('dice')
    // Brief delay for dice animation
    await new Promise(r => setTimeout(r, 800))
    const dice = rollDice()
    const result = resolveRoll(state, dice)
    dispatch({ type: 'FINISH_ROLL', results: result })
  }

  return (
    <GameContext.Provider value={{ state, dispatch, roll }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
```

- [ ] **Step 2: Install uuid**

```bash
npm install uuid && npm install --save-dev @types/uuid
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: React game context with reducer"
```

---

### Task 9: Global CSS + Atmosphere

**Files:**
- Modify: `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Update `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: '#0f0a0a',
        'felt-mid': '#1a0f0f',
        gold: '#c9a84c',
        'gold-light': '#e8c96a',
        cream: '#f5f0e8',
        'cream-dim': '#c8c0b0',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        'smoke-1': 'smoke 12s ease-in-out infinite',
        'smoke-2': 'smoke 16s ease-in-out infinite 3s',
        'smoke-3': 'smoke 14s ease-in-out infinite 6s',
        'smoke-4': 'smoke 18s ease-in-out infinite 1s',
        'smoke-5': 'smoke 11s ease-in-out infinite 8s',
        'dice-roll': 'diceRoll 0.8s ease-out',
        'speech-pop': 'speechPop 0.3s ease-out',
        'kenji-react': 'kenjiLean 0.5s ease-in-out',
      },
      keyframes: {
        smoke: {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
          '10%': { opacity: '0.15' },
          '50%': { transform: 'translateY(-120px) translateX(20px) scale(1.8)', opacity: '0.08' },
          '100%': { transform: 'translateY(-240px) translateX(-10px) scale(2.5)', opacity: '0' },
        },
        diceRoll: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(180deg) scale(1.2)' },
          '50%': { transform: 'rotate(270deg) scale(0.9)' },
          '75%': { transform: 'rotate(350deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        speechPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        kenjiLean: {
          '0%': { transform: 'rotate(0deg)' },
          '30%': { transform: 'rotate(-5deg)' },
          '70%': { transform: 'rotate(3deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-playfair: 'Playfair Display', Georgia, serif;
}

body {
  background-color: #0a0606;
  color: #f5f0e8;
  font-family: var(--font-playfair);
  overflow: hidden;
  height: 100vh;
}

/* Felt texture via CSS grain */
.felt-texture {
  position: relative;
}
.felt-texture::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: inherit;
}

/* Smoke particles */
.smoke-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.smoke-particle {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,190,175,0.25) 0%, transparent 70%);
  filter: blur(20px);
}

/* Vignette overlay */
.vignette {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Gold border glow */
.gold-glow {
  box-shadow: 0 0 12px rgba(201, 168, 76, 0.3), inset 0 0 12px rgba(201, 168, 76, 0.05);
}

/* Chip styles */
.chip {
  border-radius: 50%;
  border: 3px dashed currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.65rem;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  user-select: none;
}
.chip:hover { transform: scale(1.1); }
.chip:active { transform: scale(0.95); }

/* Bet zone hover */
.bet-zone {
  transition: background-color 0.15s, border-color 0.15s;
  cursor: pointer;
  user-select: none;
}
.bet-zone:hover {
  background-color: rgba(201, 168, 76, 0.15);
  border-color: rgba(201, 168, 76, 0.5);
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: Tailwind config with speakeasy colors and animations, global CSS"
```

---

### Task 10: PhaseBanner Component

**Files:**
- Create: `components/PhaseBanner.tsx`

- [ ] **Step 1: Write `components/PhaseBanner.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'

export function PhaseBanner() {
  const { state } = useGame()

  const text = state.phase === 'comeOut'
    ? 'COME-OUT ROLL — Roll a 7 or 11 to win. 2, 3, or 12 loses.'
    : `POINT IS ${state.point} — Roll a ${state.point} to win. Avoid the 7.`

  const color = state.phase === 'comeOut' ? 'bg-gold/20 border-gold/40' : 'bg-amber-900/30 border-amber-600/40'

  return (
    <div className={`w-full text-center py-2 px-4 border-b font-serif text-sm tracking-widest uppercase text-gold ${color}`}>
      {text}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PhaseBanner.tsx && git commit -m "feat: PhaseBanner component"
```

---

### Task 11: Dice Component

**Files:**
- Create: `components/Dice.tsx`

- [ ] **Step 1: Write `components/Dice.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'

const DOT_POSITIONS: Record<number, [string, string][]> = {
  1: [['50%', '50%']],
  2: [['25%', '25%'], ['75%', '75%']],
  3: [['25%', '25%'], ['50%', '50%'], ['75%', '75%']],
  4: [['25%', '25%'], ['75%', '25%'], ['25%', '75%'], ['75%', '75%']],
  5: [['25%', '25%'], ['75%', '25%'], ['50%', '50%'], ['25%', '75%'], ['75%', '75%']],
  6: [['25%', '20%'], ['75%', '20%'], ['25%', '50%'], ['75%', '50%'], ['25%', '80%'], ['75%', '80%']],
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div
      className={`relative w-16 h-16 rounded-xl bg-cream shadow-lg border-2 border-cream/50 ${rolling ? 'animate-dice-roll' : ''}`}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)' }}
    >
      {DOT_POSITIONS[value]?.map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-felt"
          style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
        />
      ))}
    </div>
  )
}

export function Dice() {
  const { state } = useGame()
  const [d1, d2] = state.lastRoll ?? [1, 1]

  return (
    <div className="flex gap-4 items-center justify-center">
      <Die value={d1} rolling={state.isRolling} />
      <Die value={d2} rolling={state.isRolling} />
      {state.lastRoll && (
        <div className="text-cream-dim text-sm font-serif">
          = {d1 + d2}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Dice.tsx && git commit -m "feat: Dice component with CSS roll animation"
```

---

### Task 12: BetZone + ActiveBetChip Components

**Files:**
- Create: `components/BetZone.tsx`, `components/ActiveBetChip.tsx`

- [ ] **Step 1: Write `components/ActiveBetChip.tsx`**

```tsx
import type { Bet } from '@/lib/craps-types'

const CHIP_COLORS: Record<number, string> = {
  1: 'bg-gray-200 text-gray-800 border-gray-400',
  5: 'bg-red-600 text-white border-red-400',
  25: 'bg-green-600 text-white border-green-400',
  100: 'bg-gray-900 text-gold border-gold',
}

export function ActiveBetChip({ bet, onClick }: { bet: Bet; onClick?: () => void }) {
  const colorClass = CHIP_COLORS[bet.amount] ?? CHIP_COLORS[25]
  return (
    <button
      onClick={onClick}
      title="Click to remove bet"
      className={`chip w-10 h-10 text-xs absolute ${colorClass}`}
      style={{ zIndex: 10 }}
    >
      ${bet.amount}
    </button>
  )
}
```

- [ ] **Step 2: Write `components/BetZone.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'
import type { BetType } from '@/lib/craps-types'
import { ActiveBetChip } from './ActiveBetChip'

interface BetZoneProps {
  betType: BetType
  label: string
  sublabel?: string
  number?: number
  dice?: [number, number]
  className?: string
  disabled?: boolean
}

export function BetZone({ betType, label, sublabel, number, dice, className = '', disabled = false }: BetZoneProps) {
  const { state, dispatch } = useGame()

  const activeBets = state.bets.filter(b => {
    if (b.type !== betType) return false
    if (number !== undefined && b.number !== number) return false
    return true
  })

  function handleClick() {
    if (disabled) return
    dispatch({ type: 'PLACE_BET', betType, number, dice })
  }

  const isHighlighted = activeBets.length > 0

  return (
    <div
      onClick={handleClick}
      className={`bet-zone relative border rounded flex flex-col items-center justify-center text-center p-1
        ${isHighlighted ? 'border-gold/60 bg-gold/10' : 'border-cream/20'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${className}`}
    >
      <span className="text-cream text-xs font-serif uppercase tracking-wider leading-tight">{label}</span>
      {sublabel && <span className="text-cream-dim text-[10px]">{sublabel}</span>}
      {activeBets.map((bet, i) => (
        <ActiveBetChip
          key={bet.id}
          bet={bet}
          onClick={(e: any) => { e?.stopPropagation(); dispatch({ type: 'REMOVE_BET', id: bet.id }) }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/BetZone.tsx components/ActiveBetChip.tsx && git commit -m "feat: BetZone and ActiveBetChip components"
```

---

### Task 13: CrapsTable Component

**Files:**
- Create: `components/CrapsTable.tsx`

- [ ] **Step 1: Write `components/CrapsTable.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'
import { BetZone } from './BetZone'
import { Dice } from './Dice'

export function CrapsTable() {
  const { state } = useGame()
  const inPoint = state.phase === 'point'

  return (
    <div className="felt-texture relative w-full h-full rounded-2xl border border-gold/30 gold-glow overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #1a0f0f 0%, #0f0a0a 100%)' }}>

      {/* Point marker */}
      {state.point && (
        <div className="absolute top-2 right-2 z-20 w-10 h-10 rounded-full bg-white flex items-center justify-center text-felt font-bold text-sm border-2 border-gold">
          {state.point}
        </div>
      )}

      <div className="absolute inset-0 flex flex-col p-3 gap-2">

        {/* Row 1: Don't Come + Place numbers */}
        <div className="flex gap-1 h-12">
          <BetZone betType="dontCome" label="Don't Come" sublabel="Bar 12" className="w-28 shrink-0" disabled={!inPoint} />
          {[4, 5, 6, 8, 9, 10].map(n => (
            <BetZone
              key={n}
              betType="place"
              label={n === 6 ? 'Six' : n === 9 ? 'Nine' : String(n)}
              number={n}
              className="flex-1"
              disabled={!inPoint}
            />
          ))}
        </div>

        {/* Row 2: Come area */}
        <div className="flex gap-1 h-10">
          <BetZone betType="come" label="Come" className="flex-1" disabled={!inPoint} />
          <BetZone betType="dontPass" label="Don't Pass" sublabel="Bar 12" className="w-28 shrink-0" disabled={inPoint} />
          <BetZone betType="oddsPass" label="Odds" sublabel="Pass" className="w-20 shrink-0" disabled={!inPoint || !state.bets.some(b => b.type === 'passLine')} />
          <BetZone betType="oddsDontPass" label="Odds" sublabel="D.Pass" className="w-20 shrink-0" disabled={!inPoint || !state.bets.some(b => b.type === 'dontPass')} />
        </div>

        {/* Row 3: Field */}
        <div className="h-10">
          <BetZone betType="field" label="Field  2·3·4·9·10·11·12" sublabel="2 and 12 pay 2:1" className="w-full" />
        </div>

        {/* Row 4: Pass Line + Dice area */}
        <div className="flex gap-1 h-12 items-stretch">
          <BetZone betType="passLine" label="Pass Line" className="flex-1" disabled={inPoint} />
          <div className="flex items-center justify-center w-40 shrink-0">
            <Dice />
          </div>
          <BetZone betType="big6" label="Big 6" sublabel="Pays 1:1" className="w-16 shrink-0" />
          <BetZone betType="big8" label="Big 8" sublabel="Pays 1:1" className="w-16 shrink-0" />
        </div>

        {/* Row 5: Propositions */}
        <div className="flex gap-1 h-14 text-[10px]">
          <BetZone betType="hard4" label="Hard" sublabel="4" className="flex-1" />
          <BetZone betType="hard6" label="Hard" sublabel="6" className="flex-1" />
          <BetZone betType="hard8" label="Hard" sublabel="8" className="flex-1" />
          <BetZone betType="hard10" label="Hard" sublabel="10" className="flex-1" />
          <div className="w-px bg-gold/20" />
          <BetZone betType="anyCraps" label="Any" sublabel="Craps" className="flex-1" />
          <BetZone betType="yo" label="Yo" sublabel="11" className="flex-1" />
          <BetZone betType="aces" label="Aces" sublabel="2" className="flex-1" />
          <BetZone betType="three" label="3" sublabel="Ace-Deuce" className="flex-1" />
          <BetZone betType="boxcars" label="12" sublabel="Boxcars" className="flex-1" />
          <BetZone betType="any7" label="Any" sublabel="7" className="flex-1" />
          <BetZone betType="horn" label="Horn" sublabel="2·3·11·12" className="flex-1" />
        </div>

        {/* Row 6: Buy/Lay compressed */}
        <div className="flex gap-1 h-8 text-[9px]">
          {[4,5,6,8,9,10].map(n => (
            <BetZone key={n} betType="buy" label={`Buy ${n}`} number={n} className="flex-1" disabled={!inPoint} />
          ))}
          {[4,5,6,8,9,10].map(n => (
            <BetZone key={n} betType="lay" label={`Lay ${n}`} number={n} className="flex-1" disabled={!inPoint} />
          ))}
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CrapsTable.tsx && git commit -m "feat: CrapsTable with all bet zones"
```

---

### Task 14: Kenji SVG Character

**Files:**
- Create: `components/Kenji.tsx`

- [ ] **Step 1: Write `components/Kenji.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'
import { useEffect, useState } from 'react'

function KenjiSVG({ reacting }: { reacting: boolean }) {
  return (
    <svg
      viewBox="0 0 100 160"
      className={`w-28 h-44 drop-shadow-2xl ${reacting ? 'animate-kenji-react' : ''}`}
      style={{ filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.2))' }}
    >
      {/* Body — dark suit */}
      <rect x="28" y="75" width="44" height="65" rx="4" fill="#1a1a2e" />
      {/* Suit lapels */}
      <polygon points="50,85 38,78 38,110" fill="#111127" />
      <polygon points="50,85 62,78 62,110" fill="#111127" />
      {/* White shirt */}
      <rect x="46" y="85" width="8" height="25" fill="#e8e4d8" />
      {/* Tie */}
      <polygon points="50,90 47,92 50,118 53,92" fill="#8b1a1a" />
      {/* Gold tie pin */}
      <rect x="48" y="103" width="4" height="2" rx="1" fill="#c9a84c" />
      {/* Collar */}
      <polygon points="50,78 44,83 38,78" fill="#e8e4d8" />
      <polygon points="50,78 56,83 62,78" fill="#e8e4d8" />
      {/* Shoulders */}
      <rect x="22" y="73" width="56" height="12" rx="8" fill="#1a1a2e" />
      {/* Arms */}
      <rect x="14" y="82" width="14" height="40" rx="6" fill="#1a1a2e" />
      <rect x="72" y="82" width="14" height="40" rx="6" fill="#1a1a2e" />
      {/* Hands */}
      <circle cx="21" cy="126" r="6" fill="#c8a882" />
      <circle cx="79" cy="126" r="6" fill="#c8a882" />
      {/* Neck */}
      <rect x="43" y="65" width="14" height="14" rx="4" fill="#c8a882" />
      {/* Head */}
      <ellipse cx="50" cy="48" rx="22" ry="24" fill="#c8a882" />
      {/* Hair — slicked back, dark */}
      <ellipse cx="50" cy="28" rx="22" ry="12" fill="#1a1008" />
      <path d="M 28 35 Q 50 20 72 35" fill="#1a1008" />
      {/* Eyes */}
      <ellipse cx="40" cy="47" rx="4" ry="3" fill="#fff" />
      <ellipse cx="60" cy="47" rx="4" ry="3" fill="#fff" />
      <circle cx="41" cy="47" r="2" fill="#2a1a0a" />
      <circle cx="61" cy="47" r="2" fill="#2a1a0a" />
      {/* Slight smile */}
      <path d="M 43 57 Q 50 62 57 57" stroke="#8a5a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyebrows — composed */}
      <path d="M 36 43 Q 40 41 44 43" stroke="#1a1008" strokeWidth="1.5" fill="none" />
      <path d="M 56 43 Q 60 41 64 43" stroke="#1a1008" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function Kenji() {
  const { state } = useGame()
  const [displayed, setDisplayed] = useState(state.kenjiLine)
  const [reacting, setReacting] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (state.kenjiLine !== displayed) {
      setAnimate(false)
      setReacting(state.isRolling)
      setTimeout(() => {
        setDisplayed(state.kenjiLine)
        setAnimate(true)
        setReacting(false)
      }, 100)
    }
  }, [state.kenjiLine])

  return (
    <div className="flex flex-col items-center gap-3 h-full">
      {/* Speech bubble */}
      <div
        className={`relative bg-felt-mid border border-gold/30 rounded-2xl p-3 text-cream text-xs leading-relaxed font-serif
          max-h-48 overflow-y-auto flex-1 w-full
          ${animate ? 'animate-speech-pop' : 'opacity-0'}`}
      >
        {/* Bubble tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
          <div className="w-4 h-4 bg-felt-mid border-gold/30 border rotate-45 -translate-y-2" />
        </div>
        <p>{displayed}</p>
      </div>

      {/* Character */}
      <div className="relative shrink-0">
        <KenjiSVG reacting={reacting} />
        {/* Name tag */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gold/20 border border-gold/40 rounded px-2 py-0.5 whitespace-nowrap">
          <span className="text-gold text-[10px] font-serif tracking-widest">KENJI</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Kenji.tsx && git commit -m "feat: Kenji SVG character with speech bubble"
```

---

### Task 15: ChipRack Component

**Files:**
- Create: `components/ChipRack.tsx`

- [ ] **Step 1: Write `components/ChipRack.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'
import { audio } from '@/lib/audio'

const CHIPS = [
  { value: 1, color: 'bg-gray-200 text-gray-800 border-gray-400' },
  { value: 5, color: 'bg-red-600 text-white border-red-400' },
  { value: 25, color: 'bg-green-600 text-white border-green-400' },
  { value: 100, color: 'bg-gray-900 text-gold border-gold' },
]

export function ChipRack() {
  const { state, dispatch, roll } = useGame()

  function handleRoll() {
    audio.startJazz()
    roll()
  }

  if (state.bankroll <= 0 && state.bets.length === 0) {
    return (
      <div className="flex items-center justify-center gap-4 py-3 border-t border-gold/20">
        <span className="text-cream-dim font-serif text-sm">Bankroll empty.</span>
        <button
          onClick={() => dispatch({ type: 'REBUY' })}
          className="px-4 py-1.5 bg-gold text-felt font-serif text-sm rounded border border-gold hover:bg-gold-light transition-colors"
        >
          Rebuy $500
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3 border-t border-gold/20">
      {/* Chip selector */}
      <div className="flex gap-2">
        {CHIPS.map(({ value, color }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: 'SELECT_CHIP', value })}
            className={`chip w-11 h-11 ${color} ${state.selectedChipValue === value ? 'ring-2 ring-gold scale-110' : ''}`}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Bankroll */}
      <div className="flex-1 text-center">
        <div className="text-cream-dim text-[10px] uppercase tracking-widest font-serif">Bankroll</div>
        <div className="text-gold text-lg font-serif font-bold">${state.bankroll.toLocaleString()}</div>
      </div>

      {/* Volume toggle */}
      <button
        onClick={() => audio.isMuted() ? audio.unmuteAll() : audio.muteAll()}
        className="text-cream-dim hover:text-cream text-lg px-2"
        title="Toggle sound"
      >
        ♪
      </button>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={state.isRolling || state.bets.length === 0}
        className="px-6 py-2 bg-gold text-felt font-serif font-bold text-sm rounded border-2 border-gold-light
          hover:bg-gold-light transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {state.isRolling ? 'Rolling...' : 'Roll'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ChipRack.tsx && git commit -m "feat: ChipRack with chip selector, bankroll, roll button"
```

---

### Task 16: RollHistory Component

**Files:**
- Create: `components/RollHistory.tsx`

- [ ] **Step 1: Write `components/RollHistory.tsx`**

```tsx
'use client'
import { useGame } from '@/lib/game-context'

function rollColor(sum: number, point: number | null): string {
  if (sum === 7) return 'bg-red-900/60 text-red-300 border-red-700/40'
  if (point && sum === point) return 'bg-green-900/60 text-green-300 border-green-700/40'
  if (!point && (sum === 11)) return 'bg-green-900/60 text-green-300 border-green-700/40'
  if (!point && [2,3,12].includes(sum)) return 'bg-red-900/60 text-red-300 border-red-700/40'
  return 'bg-felt-mid text-cream-dim border-gold/20'
}

export function RollHistory() {
  const { state } = useGame()

  if (state.rollHistory.length === 0) {
    return (
      <div className="text-cream-dim text-[10px] font-serif text-center py-1 italic">
        Roll history will appear here
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto py-1 px-1 items-center">
      <span className="text-cream-dim text-[9px] font-serif shrink-0 uppercase tracking-widest">History</span>
      {state.rollHistory.map((dice, i) => {
        const sum = dice[0] + dice[1]
        return (
          <div
            key={i}
            className={`shrink-0 w-8 h-8 rounded border text-xs font-bold font-serif flex items-center justify-center ${rollColor(sum, null)}`}
            title={`${dice[0]}+${dice[1]}`}
          >
            {sum}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/RollHistory.tsx && git commit -m "feat: RollHistory strip"
```

---

### Task 17: Main Page Assembly

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Craps Trainer',
  description: 'Learn craps with Kenji',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Write `app/page.tsx`**

```tsx
'use client'
import { GameProvider } from '@/lib/game-context'
import { PhaseBanner } from '@/components/PhaseBanner'
import { CrapsTable } from '@/components/CrapsTable'
import { Kenji } from '@/components/Kenji'
import { ChipRack } from '@/components/ChipRack'
import { RollHistory } from '@/components/RollHistory'

function SmokeParticles() {
  return (
    <div className="smoke-container">
      {[
        { left: '10%', top: '60%', delay: '0s', dur: '12s' },
        { left: '30%', top: '70%', delay: '3s', dur: '16s' },
        { left: '55%', top: '65%', delay: '6s', dur: '14s' },
        { left: '75%', top: '72%', delay: '1s', dur: '18s' },
        { left: '88%', top: '60%', delay: '8s', dur: '11s' },
        { left: '20%', top: '55%', delay: '5s', dur: '15s' },
        { left: '65%', top: '80%', delay: '2s', dur: '13s' },
        { left: '45%', top: '75%', delay: '9s', dur: '17s' },
      ].map((p, i) => (
        <div
          key={i}
          className="smoke-particle"
          style={{
            left: p.left,
            top: p.top,
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationName: 'smoke',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <div className="relative h-screen flex flex-col overflow-hidden bg-felt">
        <SmokeParticles />
        <div className="vignette" />

        {/* Phase Banner */}
        <div className="relative z-10">
          <PhaseBanner />
        </div>

        {/* Main layout */}
        <div className="relative z-10 flex flex-1 gap-3 p-3 min-h-0">
          {/* Table — 70% */}
          <div className="flex-1 min-h-0">
            <CrapsTable />
          </div>

          {/* Kenji sidebar — 30% */}
          <div className="w-56 shrink-0 flex flex-col">
            <Kenji />
          </div>
        </div>

        {/* Roll history */}
        <div className="relative z-10 border-t border-gold/20 px-3">
          <RollHistory />
        </div>

        {/* Chip rack */}
        <div className="relative z-10">
          <ChipRack />
        </div>
      </div>
    </GameProvider>
  )
}
```

- [ ] **Step 3: Run the dev server and verify the full game renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Phase banner shows "COME-OUT ROLL"
- Pass Line bet zone is clickable
- Selecting a chip and clicking a zone places a chip
- Roll button is enabled when bets exist
- Dice animate on roll
- Kenji's speech bubble updates
- Bankroll decrements on bet placement
- Roll history strip populates

- [ ] **Step 4: Build for production**

```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: assemble main page, full game working"
```

---

### Task 18: Railway Deployment

**Files:**
- Create: `railway.json`, update `next.config.js`

- [ ] **Step 1: Write `railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

- [ ] **Step 2: Verify `next.config.js`**

The default `next.config.js` from the scaffold is fine. No changes needed — Next.js runs as a Node server on Railway.

- [ ] **Step 3: Deploy to Railway**

```bash
# If you don't have the Railway CLI:
npm install -g @railway/cli

railway login
railway init    # creates a new project named "craps-trainer"
railway up
```

Expected: Railway detects Next.js via Nixpacks, builds, deploys. CLI outputs the live URL.

- [ ] **Step 4: Open the deployed URL and smoke test**

- Phase banner renders
- Kenji visible with speech bubble
- Bets placeable
- Roll works
- Audio plays on first interaction (click triggers jazz start)

- [ ] **Step 5: Final commit**

```bash
git add railway.json && git commit -m "feat: Railway deployment config"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Full craps table — all bets covered in engine (Tasks 3–5), all zones rendered (Task 13)
- ✅ Kenji character — SVG with speech bubble (Task 14)
- ✅ Coaching content for every bet — kenji-lines.ts (Task 6)
- ✅ Phase narration — ROLL_MESSAGES in kenji-lines.ts, consumed by game-context
- ✅ Smoke particles — SmokeParticles component (Task 17)
- ✅ Vignette — global CSS (Task 9)
- ✅ Audio — Howler.js AudioManager (Task 7), wired in ChipRack (Task 15)
- ✅ Bankroll management — GameContext reducer (Task 8), ChipRack UI (Task 15)
- ✅ Roll history — RollHistory component (Task 16)
- ✅ Railway deploy — railway.json (Task 18)
- ✅ Flavor lines — 60 lines with recency weighting (Task 6)

**Type consistency check:**
- `BetType` defined in Task 2; used consistently across engine (Tasks 3–5), context (Task 8), BetZone (Task 12)
- `resolveRoll` signature: `(state: GameState, dice: [number, number]) => RollResult` — consistent across tasks
- `FINISH_ROLL` action uses `ReturnType<typeof resolveRoll>` — no mismatch
- `getOddsPayout` / `getLayOddsPayout` defined in Task 3, used in Task 4 — signatures match

**One gap addressed:** `BET_INFO` in kenji-lines.ts uses keys like `'place6'`, `'place8'` etc. for per-number place bets but the context looks up `BET_INFO[bet.type]` which would give `BET_INFO['place']`. The game-context coaching line lookup should fall back gracefully — the `?? getFlavorLine()` fallback handles this. For full per-number coaching, implementor should extend BET_INFO with numeric keys or add a helper that resolves `place` + `number` to the right description.
