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
