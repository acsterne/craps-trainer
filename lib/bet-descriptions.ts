import type { BetType } from './craps-types'

const staticDescriptions: Partial<Record<BetType, string>> = {
  passLine:     'Bet the shooter wins. 7 or 11 on come-out wins immediately. 2, 3, or 12 loses. Any other number sets the point — roll it again before a 7. Best beginner bet. Pays 1:1. House edge 1.41%.',
  dontPass:     'Opposite of Pass Line. 2 or 3 wins, 12 pushes (tie), 7 or 11 loses on come-out. After point is set, wins if a 7 rolls before the point. Pays 1:1. House edge 1.36%.',
  come:         'Like Pass Line but placed mid-game after the point is set. The next roll is your personal come-out: 7/11 wins, 2/3/12 loses, any other number moves your bet to that box — win if it rolls before a 7. Pays 1:1.',
  dontCome:     'Like Don\'t Pass but placed mid-game. 2/3 wins, 12 pushes, 7/11 loses. Once moved to a number, wins if 7 rolls before that number. Pays 1:1.',
  oddsPass:     'Free odds behind your Pass Line — zero house edge. The best bet in the casino. Pays true odds: 2:1 on 4 & 10, 3:2 on 5 & 9, 6:5 on 6 & 8. Only available after the point is set.',
  oddsDontPass: 'Free odds behind Don\'t Pass — zero house edge. You lay the odds (bet more to win less). Wins if 7 rolls before the point. True odds, no edge.',
  field:        'One-roll bet. Wins on 2, 3, 4, 9, 10, 11, or 12. Loses on 5, 6, 7, or 8. 2 and 12 pay double (2:1). House edge 2.78%.',
  any7:         'One-roll bet. Wins only if the next roll is a 7. Pays 4:1. House edge 16.67% — one of the worst bets on the table. Entertain yourself sparingly.',
  hard4:        'Wins if 2+2 rolls before any 7 or an easy 4 (1+3 or 3+1). Pays 7:1. House edge 11.11%.',
  hard6:        'Wins if 3+3 rolls before any 7 or an easy 6. Pays 9:1. House edge 9.09%.',
  hard8:        'Wins if 4+4 rolls before any 7 or an easy 8. Pays 9:1. House edge 9.09%.',
  hard10:       'Wins if 5+5 rolls before any 7 or an easy 10. Pays 7:1. House edge 11.11%.',
  aces:         'One-roll bet. Wins only on a 2 (snake eyes — both dice showing 1). Pays 30:1. House edge 13.89%. Long shot.',
  three:        'One-roll bet. Wins only on a 3. Pays 15:1. House edge 11.11%.',
  yo:           'One-roll bet. Wins only on an 11 — dealers yell "Yo!" so it\'s not confused with "seven." Pays 15:1. House edge 11.11%.',
  boxcars:      'One-roll bet. Wins only on a 12 (both dice showing 6). Pays 30:1. House edge 13.89%. Long shot.',
  horn:         'One bet split equally across 2, 3, 11, and 12. Wins on any of those rolls but at reduced payout. Effectively a bundle of long-shot one-rollers. High house edge.',
  anyCraps:     'One-roll bet. Wins if 2, 3, or 12 is rolled. Pays 7:1. House edge 11.11%. Often used to hedge a Pass Line bet on the come-out.',
  big6:         'Wins if 6 rolls before a 7. Pays 1:1. Sucker bet — Place 6 pays 7:6 for the exact same result. Avoid.',
  big8:         'Wins if 8 rolls before a 7. Pays 1:1. Sucker bet — Place 8 pays 7:6 for the exact same result. Avoid.',
  comePoint:    'Your Come bet has traveled to this number. Wins if this number rolls before a 7. Add free odds on top for zero house edge.',
  dontComePoint:'Your Don\'t Come bet is working against this number. Wins if 7 rolls before this number.',
  oddsCome:     'Free odds on your Come point — zero house edge. Pays true odds: 2:1 on 4&10, 3:2 on 5&9, 6:5 on 6&8.',
  oddsDontCome: 'Free odds on your Don\'t Come point — zero house edge. You lay the odds against the number.',
}

const numberDescriptions: Partial<Record<BetType, (n: number) => string>> = {
  place: (n) => `Bet that ${n} rolls before a 7. Pays ${n === 6 || n === 8 ? '7:6' : n === 5 || n === 9 ? '7:5' : '9:5'}. Always working except on come-out. ${n === 6 || n === 8 ? 'Best place bet on the table.' : ''}`,
  buy:   (n) => `Pay 5% commission to get true odds on ${n}. Wins if ${n} rolls before a 7. Pays ${n === 4 || n === 10 ? '2:1' : n === 5 || n === 9 ? '3:2' : '6:5'} true odds.`,
  lay:   (n) => `Bet against ${n}. Pay 5% commission. Wins if a 7 rolls before ${n}. Opposite of a Buy bet.`,
}

export function getBetDescription(betType: BetType, number?: number): string {
  if (number !== undefined && numberDescriptions[betType]) {
    return numberDescriptions[betType]!(number)
  }
  return staticDescriptions[betType] ?? ''
}

export function getBetLabel(type: BetType, number?: number): string {
  const labels: Partial<Record<BetType, string>> = {
    passLine: 'Pass Line', dontPass: "Don't Pass",
    oddsPass: 'Pass Line Odds', oddsDontPass: "Don't Pass Odds",
    come: 'Come', comePoint: 'Come Point',
    dontCome: "Don't Come", dontComePoint: "Don't Come Point",
    oddsCome: 'Come Odds', oddsDontCome: "Don't Come Odds",
    field: 'Field', any7: 'Seven', anyCraps: 'Any Craps',
    yo: 'Yo (11)', aces: 'Aces (2)', three: 'Three', boxcars: 'Boxcars (12)',
    horn: 'Horn', hard4: 'Hard 4', hard6: 'Hard 6', hard8: 'Hard 8', hard10: 'Hard 10',
    big6: 'Big 6', big8: 'Big 8',
  }
  if ((type === 'place' || type === 'buy' || type === 'lay') && number) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${number}`
  }
  return labels[type] ?? type
}
