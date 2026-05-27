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

describe('buy bets', () => {
  it('buy 4 pays 2:1 true odds', () => {
    const state = makeState({
      phase: 'point', point: 8,
      bets: [bet('buy', 20, { number: 4 })],
    })
    const r = resolveRoll(state, [1, 3])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(20 + 40)
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
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(40 + 20) // 1:2 on $40 = $20 profit
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
    const state = makeState({ phase: 'point', point: 6, bets: [bet('hard8', 10)] })
    const r = resolveRoll(state, [3, 5])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('hard 8 loses on 7', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('hard8', 10)] })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('hard 8 continues on unrelated number', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('hard8', 10)] })
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

describe('one-roll prop bets', () => {
  it('field wins on 9 (even money)', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('field', 10)] })
    const r = resolveRoll(state, [4, 5])
    expect(r.results[0].outcome).toBe('win')
    expect(r.results[0].payout).toBe(20)
  })

  it('field pays 2:1 on 2', () => {
    const state = makeState({ phase: 'comeOut', bets: [bet('field', 10)] })
    const r = resolveRoll(state, [1, 1])
    const fieldResult = r.results.find(res => res.bet.type === 'field')!
    expect(fieldResult.outcome).toBe('win')
    expect(fieldResult.payout).toBe(30) // 10 + 20
  })

  it('field loses on 7', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('field', 10)] })
    const r = resolveRoll(state, [3, 4])
    expect(r.results[0].outcome).toBe('lose')
  })

  it('any7 wins on 7', () => {
    const state = makeState({ phase: 'point', point: 6, bets: [bet('any7', 10)] })
    const r = resolveRoll(state, [3, 4])
    const any7 = r.results.find(res => res.bet.type === 'any7')!
    expect(any7.outcome).toBe('win')
    expect(any7.payout).toBe(50) // 4:1 = return 5x
  })

  it('aces pays 30:1 on snake eyes', () => {
    const state = makeState({ phase: 'comeOut', bets: [bet('aces', 5)] })
    const r = resolveRoll(state, [1, 1])
    const acesResult = r.results.find(res => res.bet.type === 'aces')!
    expect(acesResult.outcome).toBe('win')
    expect(acesResult.payout).toBe(5 * 31) // 30:1 pays back stake + 30x
  })
})

describe('getOddsPayout', () => {
  it('point 6: pays 6:5', () => expect(getOddsPayout(60, 6)).toBe(72))
  it('point 5: pays 3:2', () => expect(getOddsPayout(40, 5)).toBe(60))
  it('point 4: pays 2:1', () => expect(getOddsPayout(30, 4)).toBe(60))
})

describe('getLayOddsPayout', () => {
  it('point 6: pays 5:6', () => expect(getLayOddsPayout(60, 6)).toBe(50))
  it('point 4: pays 1:2', () => expect(getLayOddsPayout(40, 4)).toBe(20))
})
