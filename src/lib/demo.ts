const HEADER = 'Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance'

type Sender = {
  type: string
  description: string
  base: number
  spread: number
}

const SENDERS: Sender[] = [
  { type: 'Transfer', description: 'Acme Studio Ltd', base: 2400, spread: 600 },
  { type: 'Transfer', description: 'Northwind Agency', base: 1800, spread: 400 },
  { type: 'Transfer', description: 'Globex Consulting', base: 950, spread: 300 },
  { type: 'Card Payment', description: 'Stripe Payout', base: 540, spread: 220 },
  { type: 'Topup', description: 'Apple Pay Top-Up', base: 300, spread: 120 },
]

const OUTGOING = [
  { type: 'Card Payment', description: 'Whole Foods Market', amount: -84.3 },
  { type: 'Card Payment', description: 'Spotify', amount: -10.99 },
  { type: 'Exchange', description: 'Exchanged to USD', amount: -150 },
]

const pad = (n: number) => String(n).padStart(2, '0')

const wave = (seed: number) => (Math.sin(seed * 1.7) + Math.cos(seed * 0.6)) / 2

export const demoCsv = (): string => {
  const now = new Date()
  const rows: string[] = [HEADER]
  const thisYear = now.getFullYear()
  const years = [thisYear - 4, thisYear - 3, thisYear - 2, thisYear - 1, thisYear]

  for (const year of years) {
    const lastMonth = year === thisYear ? now.getMonth() : 11
    for (let month = 0; month <= lastMonth; month++) {
      SENDERS.forEach((sender, i) => {
        const seed = year * 12 + month + i * 7
        const amount = Math.round((sender.base + wave(seed) * sender.spread) * 100) / 100
        if (amount <= 0) return
        const day = 3 + ((i * 5) % 22)
        const date = `${year}-${pad(month + 1)}-${pad(day)} 09:${pad(15 + i)}:00`
        rows.push(
          `${sender.type},Current,${date},${date},${sender.description},${amount},0.00,EUR,COMPLETED,0.00`,
        )
      })

      OUTGOING.forEach((out, i) => {
        const day = 8 + i * 6
        const date = `${year}-${pad(month + 1)}-${pad(day)} 18:${pad(20 + i)}:00`
        rows.push(
          `${out.type},Current,${date},${date},${out.description},${out.amount},0.00,EUR,COMPLETED,0.00`,
        )
      })
    }
  }

  return rows.join('\n')
}
