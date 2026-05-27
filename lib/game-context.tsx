'use client'

import { createContext, useContext, useReducer, useRef, ReactNode } from 'react'
import type { GameState, Bet, BetType, BetResult } from './craps-types'
import { resolveRoll, rollDice } from './craps-engine'
import { getFlavorLine, getBetKenjiLine, ROLL_MESSAGES } from './kenji-lines'
import { audio } from './audio'
import { v4 as uuid } from 'uuid'

type Action =
  | { type: 'PLACE_BET'; betType: BetType; number?: number; dice?: [number, number] }
  | { type: 'REMOVE_BET'; id: string }
  | { type: 'SELECT_CHIP'; value: number }
  | { type: 'START_ROLL' }
  | { type: 'FINISH_ROLL'; result: ReturnType<typeof resolveRoll> }
  | { type: 'REBUY' }

const initialState: GameState = {
  phase: 'comeOut',
  point: null,
  bets: [],
  bankroll: 500,
  rollHistory: [],
  selectedChipValue: 25,
  lastRoll: null,
  lastResults: [],
  kenjiLine: "Welcome. The table is yours. Start with a Pass Line bet — it's the best bet on the table.",
  isRolling: false,
}

const ONE_ROLL_TYPES: BetType[] = [
  'field', 'any7', 'anyCraps', 'yo', 'aces', 'three', 'boxcars', 'horn', 'hopEasy', 'hopHard',
]

function kenjiLineForRoll(result: ReturnType<typeof resolveRoll>, prevPhase: GameState['phase']): string {
  const { sum, nextPhase, nextPoint } = result

  if (prevPhase === 'comeOut') {
    if (sum === 7 || sum === 11) return ROLL_MESSAGES.comeOut.natural(sum)
    if ([2, 3, 12].includes(sum)) return ROLL_MESSAGES.comeOut.craps(sum)
    return ROLL_MESSAGES.comeOut.pointSet(nextPoint!)
  }

  // Check for come/dontCome travel first
  const travelResult = result.results.find(r => r.outcome === 'travel')
  if (travelResult?.travelNumber) {
    const isCome = travelResult.bet.type === 'come'
    return isCome
      ? ROLL_MESSAGES.comeTravel(travelResult.travelNumber)
      : ROLL_MESSAGES.dontComeTravel(travelResult.travelNumber)
  }

  if (nextPhase === 'comeOut' && nextPoint === null) {
    if (sum === 7) return ROLL_MESSAGES.point.sevenOut()
    return ROLL_MESSAGES.point.hitPoint(sum)
  }

  // 30% chance of flavor commentary, otherwise explain the roll
  if (Math.random() < 0.3) return getFlavorLine()
  return ROLL_MESSAGES.point.continue(sum)
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_CHIP':
      return { ...state, selectedChipValue: action.value }

    case 'PLACE_BET': {
      const cost = state.selectedChipValue
      if (cost > state.bankroll) return { ...state, kenjiLine: "Not enough chips for that bet." }

      // 5% commission deducted upfront for buy bets
      const commission = action.betType === 'buy' ? Math.ceil(cost * 0.05) : 0
      const totalCost = cost + commission

      if (totalCost > state.bankroll) return { ...state, kenjiLine: "Not enough chips including the commission." }

      const newBet: Bet = {
        id: uuid(),
        type: action.betType,
        amount: cost,
        number: action.number,
        dice: action.dice,
      }

      const kenjiLine = getBetKenjiLine(action.betType, action.number)

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
      // Only allow removing bets that can be taken down (not pass line once point is set)
      const locked = state.phase === 'point' && (bet.type === 'passLine' || bet.type === 'dontPass')
      if (locked) return { ...state, kenjiLine: "Pass Line and Don't Pass bets cannot be removed once the point is set. This is a casino rule." }
      return {
        ...state,
        bets: state.bets.filter(b => b.id !== action.id),
        bankroll: state.bankroll + bet.amount,
      }
    }

    case 'START_ROLL':
      if (state.isRolling || state.bets.length === 0) return state
      return { ...state, isRolling: true }

    case 'FINISH_ROLL': {
      const { result } = action
      const prevPhase = state.phase

      let bankrollDelta = 0
      for (const r of result.results) {
        if (r.outcome === 'win' || r.outcome === 'push') bankrollDelta += r.payout
      }

      // Rebuild bet list: remove resolved, convert traveled come bets
      const nextBets: Bet[] = []
      for (const bet of state.bets) {
        const betResult = result.results.find(r => r.bet.id === bet.id)

        if (!betResult || betResult.outcome === 'continue') {
          nextBets.push(bet)
          continue
        }

        if (betResult.outcome === 'travel' && betResult.travelNumber) {
          nextBets.push({
            ...bet,
            type: bet.type === 'come' ? 'comePoint' : 'dontComePoint',
            number: betResult.travelNumber,
          })
          continue
        }
        // win/lose/push: bet is removed from table
      }

      // One-roll bets that weren't in results (e.g. not placed) stay; those that were resolved get removed
      // (they are already excluded by the win/lose branch above)

      // Play sounds
      const isSevenOut = result.nextPhase === 'comeOut' && result.sum === 7 && prevPhase === 'point'
      const hasWin = result.results.some(r => r.outcome === 'win' && !ONE_ROLL_TYPES.includes(r.bet.type))
      const fieldWin = result.results.some(r => r.bet.type === 'field' && r.outcome === 'win')

      if (isSevenOut) audio.play('sevenOut')
      else if (hasWin || fieldWin) audio.play('win')
      else if (result.results.some(r => r.outcome === 'lose')) audio.play('lose')

      const newHistory: Array<[number, number]> = [...state.rollHistory, result.dice].slice(-20) as Array<[number, number]>

      return {
        ...state,
        phase: result.nextPhase,
        point: result.nextPoint,
        bets: nextBets,
        bankroll: state.bankroll + bankrollDelta,
        rollHistory: newHistory,
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

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
  roll: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Keep a ref to state for the async roll closure
  const stateRef = useRef(state)
  stateRef.current = state

  async function roll() {
    if (stateRef.current.bets.length === 0) return
    audio.startJazz()
    dispatch({ type: 'START_ROLL' })
    audio.play('dice')
    await new Promise(r => setTimeout(r, 800))
    const dice = rollDice()
    const result = resolveRoll(stateRef.current, dice)
    dispatch({ type: 'FINISH_ROLL', result })
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
