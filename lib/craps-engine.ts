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
  const ratios: Record<number, number> = { 4: 0.5, 5: 2 / 3, 6: 5 / 6, 8: 5 / 6, 9: 2 / 3, 10: 0.5 }
  return Math.round(oddsAmount * ratios[point])
}

function resolveOneRollBets(bets: Bet[], dice: [number, number]): BetResult[] {
  const sum = diceSum(dice)
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
        results.push([2, 3, 12].includes(sum)
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
        const unitAmount = Math.round(bet.amount / 4)
        if (sum === 2 || sum === 12) {
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
    } else if (['hard4', 'hard6', 'hard8', 'hard10'].includes(bet.type)) {
      results.push({ bet, outcome: 'continue', payout: 0 })
    }
  }

  results.push(...resolveOneRollBets(state.bets, dice))

  if (!isNatural && !isCraps2or3 && !isCraps12) {
    nextPhase = 'point'
    nextPoint = sum
  }

  return { dice, sum, results, nextPhase, nextPoint }
}

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

      case 'come':
        if (sum === 7 || sum === 11) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if ([2, 3, 12].includes(sum)) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'travel', payout: 0, travelNumber: sum })
        break

      case 'dontCome':
        if ([2, 3].includes(sum)) results.push({ bet, outcome: 'win', payout: bet.amount * 2 })
        else if (sum === 12) results.push({ bet, outcome: 'push', payout: bet.amount })
        else if (sum === 7 || sum === 11) results.push({ bet, outcome: 'lose', payout: 0 })
        else results.push({ bet, outcome: 'travel', payout: 0, travelNumber: sum })
        break

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

      case 'place': {
        const placePayouts: Record<number, [number, number]> = {
          4: [9, 5], 5: [7, 5], 6: [7, 6], 8: [7, 6], 9: [7, 5], 10: [9, 5],
        }
        const [num, den] = placePayouts[bet.number!]
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
        const targetSum = ({ hard4: 4, hard6: 6, hard8: 8, hard10: 10 } as Record<string, number>)[bet.type]
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
    }
  }

  results.push(...resolveOneRollBets(state.bets, dice))

  if (hitPoint || sevenOut) {
    nextPhase = 'comeOut'
    nextPoint = null
  }

  return { dice, sum, results, nextPhase, nextPoint }
}

export function resolveRoll(state: GameState, dice: [number, number]): RollResult {
  if (state.phase === 'comeOut') return resolveComeOut(state, dice)
  return resolvePointPhase(state, dice)
}
