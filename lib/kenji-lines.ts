export interface KenjiContent {
  what: string
  payout: string
  edge: string
  rating: 'Pro Move' | 'Solid' | 'Okay' | 'Tourist Trap' | 'House Gold'
  note?: string
}

export const BET_INFO: Record<string, KenjiContent> = {
  passLine: {
    what: "You're betting the shooter wins. On the come-out roll: 7 or 11 wins immediately, 2/3/12 (craps) loses immediately. Any other number becomes the 'point' — you need that number to roll again before a 7.",
    payout: "Pays 1 to 1 (even money)",
    edge: "House edge: 1.41% — Excellent",
    rating: 'Pro Move',
    note: "The foundation bet. Start here every round.",
  },
  dontPass: {
    what: "The dark side. You're betting against the shooter. On come-out: wins on 2 or 3, ties (pushes) on 12 — that's the 'bar 12' rule — loses on 7 or 11. After a point is set, you want the 7 to come before the point number.",
    payout: "Pays 1 to 1",
    edge: "House edge: 1.36% — Excellent (slightly better than Pass Line)",
    rating: 'Pro Move',
    note: "Mathematically superior. Socially complicated. The table crowd won't love you, but the math will.",
  },
  oddsPass: {
    what: "Free odds behind your Pass Line bet. The only wager in any casino with zero house edge — true odds, no markup. After your point is set, place additional chips directly behind your Pass Line chips. Take the maximum the table allows, every single time.",
    payout: "Point 4/10: pays 2:1 | Point 5/9: pays 3:2 | Point 6/8: pays 6:5",
    edge: "House edge: 0% — The only free bet in the building",
    rating: 'Pro Move',
    note: "This is not optional advice. Max odds always.",
  },
  oddsDontPass: {
    what: "Laying odds behind your Don't Pass bet. Also zero house edge. You bet more to win less here — once the point is set, you're the slight favorite. But the math is perfect, so lay the maximum.",
    payout: "Point 4/10: pays 1:2 | Point 5/9: pays 2:3 | Point 6/8: pays 5:6",
    edge: "House edge: 0%",
    rating: 'Pro Move',
  },
  come: {
    what: "A second Pass Line bet started mid-round. Place it in the Come area and the very next roll becomes your personal come-out roll — 7 or 11 wins, 2/3/12 loses, any other number becomes your Come point. Smart players use Come bets to get multiple numbers working at once.",
    payout: "Pays 1 to 1, then take free odds once your Come point is established",
    edge: "House edge: 1.41%",
    rating: 'Pro Move',
  },
  comePoint: {
    what: "Your Come bet has traveled to this number. It works just like a Pass Line bet now — you need this number to roll again before a 7. You can place free odds on it.",
    payout: "Pays 1 to 1 (plus true odds if you have them)",
    edge: "House edge: 1.41%",
    rating: 'Pro Move',
  },
  dontCome: {
    what: "The Don't Pass equivalent started mid-round. The next roll is your personal come-out — 2/3 wins, 12 pushes, 7/11 loses, any other number becomes your Don't Come point. From there, you want a 7 before that number rolls.",
    payout: "Pays 1 to 1",
    edge: "House edge: 1.36%",
    rating: 'Pro Move',
  },
  dontComePoint: {
    what: "Your Don't Come bet has settled on this number. You're rooting for a 7 to come before this number rolls again. You can lay odds on it — zero house edge.",
    payout: "Pays 1 to 1 (plus lay odds if placed)",
    edge: "House edge: 1.36%",
    rating: 'Pro Move',
  },
  oddsCome: {
    what: "Free odds on a Come point. Same zero house edge as Pass Line odds. Place these chips after your Come bet has traveled to a number — the dealer will stack them on top slightly offset.",
    payout: "Same true odds: 4/10 pays 2:1, 5/9 pays 3:2, 6/8 pays 6:5",
    edge: "House edge: 0%",
    rating: 'Pro Move',
  },
  oddsDontCome: {
    what: "Laying odds on a Don't Come point. Zero house edge. You're the favorite once the point is set.",
    payout: "4/10: pays 1:2 | 5/9: pays 2:3 | 6/8: pays 5:6",
    edge: "House edge: 0%",
    rating: 'Pro Move',
  },
  place6: {
    what: "Betting the 6 rolls before a 7. The 6 is the second most rolled non-seven number — five ways to make it out of 36 combinations. Bet in multiples of $6 so the 7:6 payout comes out clean.",
    payout: "Pays 7 to 6 — bet $6, $12, $18, $24, $30...",
    edge: "House edge: 1.52% — Solid",
    rating: 'Solid',
  },
  place8: {
    what: "Same math as Place 6, mirrored on the 8. Five ways to make it. Excellent bet to have working alongside the 6.",
    payout: "Pays 7 to 6 — bet in multiples of $6",
    edge: "House edge: 1.52% — Solid",
    rating: 'Solid',
  },
  place5: {
    what: "Betting the 5 rolls before a 7. Four ways to make a 5. Bet in multiples of $5 for clean payouts.",
    payout: "Pays 7 to 5",
    edge: "House edge: 4.00% — Okay",
    rating: 'Okay',
  },
  place9: {
    what: "Betting the 9 rolls before a 7. Four ways to make a 9. Same math as Place 5.",
    payout: "Pays 7 to 5 — bet in multiples of $5",
    edge: "House edge: 4.00% — Okay",
    rating: 'Okay',
  },
  place4: {
    what: "Betting the 4 rolls before a 7. Only three ways to make it, six ways to make a 7. If you want the 4 in action, a Buy bet is mathematically better — you pay a 5% commission but get true 2:1 odds.",
    payout: "Pays 9 to 5",
    edge: "House edge: 6.67% — consider Buy 4 instead",
    rating: 'Tourist Trap',
    note: "Buy 4 gives you true 2:1 odds. If the casino charges commission only on wins, Buy 4 is the play.",
  },
  place10: {
    what: "Same structure as Place 4, mirrored. Three ways to make a 10. Same recommendation: compare to Buy 10.",
    payout: "Pays 9 to 5",
    edge: "House edge: 6.67%",
    rating: 'Tourist Trap',
  },
  buy: {
    what: "Like a Place bet, but you pay a 5% commission to get true odds. Matters most on 4 and 10 where place odds are rougher. Many Vegas casinos charge commission only when you win — always ask the dealer. If they charge commission only on wins, Buy 4/10 is your best bet on those numbers.",
    payout: "4/10: pays 2:1 true odds | 5/9: pays 3:2 | 6/8: pays 6:5",
    edge: "4/10: ~1.67% | 5/9: ~4.76% | 6/8: ~4.76% (varies by commission structure)",
    rating: 'Solid',
    note: "Ask: 'Do you charge commission on Buy bets only when they win?' The answer changes the math.",
  },
  lay: {
    what: "Betting a number won't roll before the 7. You pay 5% commission on the potential win. You're the slight favorite since there are more ways to roll a 7 than most individual numbers. You bet more to win less.",
    payout: "4/10: pays 1:2 | 5/9: pays 2:3 | 6/8: pays 5:6",
    edge: "4/10: 2.44% | 5/9: 3.23% | 6/8: 4.00%",
    rating: 'Okay',
  },
  field: {
    what: "One-roll bet covering 2, 3, 4, 9, 10, 11, and 12. You win or lose on the very next roll only. Looks like you're covering a lot — but 5, 6, 7, and 8 account for 20 out of 36 combinations. The field covers 16. The math is against you.",
    payout: "Pays 1:1, except 2 and 12 pay 2:1",
    edge: "House edge: 5.56%",
    rating: 'Tourist Trap',
    note: "Fun for a single roll. Not a sustained strategy.",
  },
  any7: {
    what: "Betting the next roll is a 7. There are 6 ways to roll a 7, so true odds would pay 5:1. The casino pays 4:1, keeping that difference. Highest house edge on the table.",
    payout: "Pays 4 to 1",
    edge: "House edge: 16.67% — the casino's favorite",
    rating: 'House Gold',
    note: "Kenji does not recommend this. Kenji understands impulse.",
  },
  anyCraps: {
    what: "Betting the next roll is 2, 3, or 12. Four ways to make it — true odds would pay 8:1. Sometimes used as a one-roll hedge during a come-out roll: it costs most rolls but softens the blow if the shooter craps out immediately.",
    payout: "Pays 7 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  yo: {
    what: "The eleven. Dealers say 'yo' to distinguish it from 'seven' on loud tables. Two ways to roll it (5+6 and 6+5) — true odds are 17:1. The casino pays 15:1.",
    payout: "Pays 15 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
    note: "Note: 11 wins your Pass Line naturally on a come-out roll — that is a separate thing.",
  },
  aces: {
    what: "Snake eyes. Both dice showing 1. One way to make it out of 36. True odds would be 35:1. The casino pays 30:1. Why do people bet it? Because 30:1 on a $5 chip is $150, and that's a story you tell at dinner.",
    payout: "Pays 30 to 1",
    edge: "House edge: 13.89%",
    rating: 'House Gold',
  },
  three: {
    what: "The 3. Two ways to roll it (1+2 and 2+1). True odds 17:1, pays 15:1. Sometimes bet on its own, sometimes part of a horn or any-craps bet.",
    payout: "Pays 15 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  boxcars: {
    what: "Midnight. Boxcars. Both sixes. One way to make it. Pays 30:1. The rarest feeling on the table. When it rolls and someone has this bet, everything goes quiet for a moment — then everyone who didn't bet it groans.",
    payout: "Pays 30 to 1",
    edge: "House edge: 13.89%",
    rating: 'House Gold',
  },
  horn: {
    what: "Four units split equally on 2, 3, 11, and 12 simultaneously — one on each. If 2 or 12 hits: the winning unit pays 30:1, the three losers cost 3 units, net 27 units profit. If 3 or 11 hits: 15:1 minus the three losers, net 12 units profit. Anything else: all four gone.",
    payout: "2 or 12: net ~27 units | 3 or 11: net ~12 units",
    edge: "House edge: ~12.5% average",
    rating: 'House Gold',
    note: "This is not optimal strategy. This is theater. Bold choice — the house respects the chaos.",
  },
  hard4: {
    what: "Betting the 4 comes as exactly 2+2 before a 7 OR before an easy 4 (1+3 or 3+1). The hard way is the only winner. Four ways to lose, one way to win. This bet stays up until it wins, a 7 rolls, or an easy 4 rolls.",
    payout: "Pays 7 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  hard6: {
    what: "Exactly 3+3 before a 7 or easy 6. One winner, five paths to losing. Stays up between rolls. Pays 9:1.",
    payout: "Pays 9 to 1",
    edge: "House edge: 9.09%",
    rating: 'Tourist Trap',
    note: "There's something satisfying about calling a hard six.",
  },
  hard8: {
    what: "Exactly 4+4 before a 7 or easy 8 (2+6, 6+2, 3+5, 5+3). Five ways to lose, one way to win. Pays 9:1.",
    payout: "Pays 9 to 1",
    edge: "House edge: 9.09%",
    rating: 'Tourist Trap',
  },
  hard10: {
    what: "Exactly 5+5 before a 7 or easy 10. Same structure as Hard 4 — three ways to make ten, only the double wins.",
    payout: "Pays 7 to 1",
    edge: "House edge: 11.11%",
    rating: 'Tourist Trap',
  },
  big6: {
    what: "Betting the 6 rolls before a 7 — the exact same bet as Place 6, but this one pays 1:1 instead of 7:6. The house edge jumps from 1.52% to 9.09% for the identical outcome. Casinos put this bet where new players sit. Use Place 6 instead.",
    payout: "Pays 1 to 1 (even money)",
    edge: "House edge: 9.09% — Place 6 is the same bet and pays better",
    rating: 'Tourist Trap',
    note: "Seriously — Place 6 pays 7:6 for the same bet. Big 6 is a trap.",
  },
  big8: {
    what: "Same as Big 6 but for the 8. Even money instead of the 7:6 you'd get from Place 8. The worst version of a decent bet.",
    payout: "Pays 1 to 1",
    edge: "House edge: 9.09% — Place 8 pays better",
    rating: 'Tourist Trap',
  },
  hopEasy: {
    what: "You're betting the next roll is exactly these two dice values, in either order. Two ways to make most combinations — true odds are 17:1, the casino pays 15:1. Regulars use hop bets when they have a strong feeling about a specific combination.",
    payout: "Pays 15 to 1",
    edge: "House edge: 11.11%",
    rating: 'House Gold',
    note: "The hop bet. You had a feeling. Feelings are valid.",
  },
  hopHard: {
    what: "Betting the next roll is exactly this matching pair. One way to make it out of 36. Pays 30:1 — true odds would be 35:1. Pure instinct. No system, no strategy, only hope.",
    payout: "Pays 30 to 1",
    edge: "House edge: 13.89%",
    rating: 'House Gold',
  },
}

export const ROLL_MESSAGES = {
  comeOut: {
    natural: (sum: number) =>
      sum === 7
        ? "Natural seven. Pass Line wins. A good start."
        : "Yo-leven. Natural winner. Pass Line pays even money.",
    craps: (sum: number) =>
      sum === 12
        ? "Boxcars on the come-out. Pass Line loses. Don't Pass pushes — that's the 'bar 12' rule. Nobody wins on 12 for the dark side, the casino keeps the edge there."
        : `Craps ${sum}. Pass Line loses. Don't Pass wins. New come-out roll begins.`,
    pointSet: (point: number) =>
      `The point is ${point}. The game shifts. Now you need to roll a ${point} before a 7 shows up. Place your odds bet behind the Pass Line — it's the only zero-edge bet in the casino.`,
  },
  point: {
    hitPoint: (point: number) =>
      `${point}. The point. Pass Line pays even money, odds pay at true rates. A good result. New come-out roll now.`,
    sevenOut: () =>
      "Seven out. The round ends. Pass Line loses, Don't Pass wins, place bets lose, come points lose. New shooter coming. This is how craps works — the seven takes everything when the point is set.",
    continue: (sum: number) =>
      `${sum}. No resolution on the main line. Active bets carry over. Keep rolling.`,
  },
  comeTravel: (sum: number) =>
    `Your Come bet moved to the ${sum}. It now works like a Pass Line bet — needs a ${sum} before a 7. You can place free odds on it by clicking it.`,
  dontComeTravel: (sum: number) =>
    `Your Don't Come bet landed on the ${sum}. From here you want the 7 to come before the ${sum} rolls again. You can lay odds on it.`,
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
  "Five ways to make the six. Six ways to make the seven.",
  "Statistically, this should comfort you. It probably doesn't.",
  "Free odds. The only free thing in this building.",
  "The hop bet. You had a feeling. Feelings are valid.",
  "The table is quiet now. This is the best kind of quiet.",
  "Another natural. The shooter smiles. Keep watching.",
  "The any-craps hedge. Pragmatic. Slightly pessimistic. Effective.",
  "Lay the odds. Be the house for a moment.",
  "The math does not care about the story. Play anyway.",
]

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

export function getBetKenjiLine(betType: string, number?: number): string {
  // Try specific keyed version first (e.g. 'place6'), fall back to generic
  const specificKey = number ? `${betType}${number}` : betType
  const info = BET_INFO[specificKey] ?? BET_INFO[betType]
  if (!info) return getFlavorLine()
  const ratingLabel = {
    'Pro Move': '✦ Pro Move',
    'Solid': '◆ Solid',
    'Okay': '◇ Okay',
    'Tourist Trap': '⚠ Tourist Trap',
    'House Gold': '✗ House Gold',
  }[info.rating]
  return `${info.what} ${info.payout}. ${info.edge}. ${ratingLabel}.${info.note ? ' ' + info.note : ''}`
}
