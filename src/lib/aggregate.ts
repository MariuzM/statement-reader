import type { EarningsReport, Transaction, YearlyEarnings } from './types'

export const DEFAULT_EXCLUDED_TYPES = ['TOPUP', 'CARD_REFUND']

export const DEFAULT_EXCLUDED_SENDERS = ['Withdrawing savings', 'Pocket Withdrawal']

export const senderKey = (description: string) => (description.trim() || '(no description)').toLowerCase()

export const collectSenders = (
  txns: Transaction[],
  currency: string,
  excludedTypes: Set<string>,
) => {
  const map = new Map<string, { name: string; count: number; total: number }>()
  for (const t of txns) {
    if (t.state !== 'COMPLETED') continue
    if (t.amount <= 0) continue
    if (t.currency !== currency) continue
    if (excludedTypes.has(t.typeKey)) continue
    const name = t.description.trim() || '(no description)'
    const key = senderKey(t.description)
    const existing = map.get(key)
    if (existing) {
      existing.count += 1
      existing.total += t.amount
    } else {
      map.set(key, { name, count: 1, total: t.amount })
    }
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.total - a.total)
}

export const collectTypes = (txns: Transaction[]) => {
  const map = new Map<string, { type: string; count: number; total: number }>()
  for (const t of txns) {
    if (t.amount <= 0) continue
    const existing = map.get(t.typeKey)
    if (existing) {
      existing.count += 1
      existing.total += t.amount
    } else {
      map.set(t.typeKey, { type: t.type, count: 1, total: t.amount })
    }
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.total - a.total)
}

export const yearSenderKey = (year: number, key: string) => `${year}:${key}`

export const collectIncomeTxns = (
  txns: Transaction[],
  currency: string,
  excludedTypes: Set<string>,
) =>
  txns
    .filter(
      (t) =>
        t.state === 'COMPLETED' &&
        t.amount > 0 &&
        t.currency === currency &&
        !excludedTypes.has(t.typeKey),
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())

export const collectTypeBreakdown = (txns: Transaction[], currency: string) => {
  const map = new Map<string, { type: string; count: number; total: number; in: number; out: number }>()
  for (const t of txns) {
    if (t.state !== 'COMPLETED') continue
    if (t.currency !== currency) continue
    const existing = map.get(t.typeKey)
    const entry = existing ?? { type: t.type, count: 0, total: 0, in: 0, out: 0 }
    entry.count += 1
    entry.total += t.amount
    if (t.amount >= 0) entry.in += t.amount
    else entry.out += t.amount
    if (!existing) map.set(t.typeKey, entry)
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
}

export const collectCurrencies = (txns: Transaction[]) => {
  const counts = new Map<string, number>()
  for (const t of txns) {
    if (t.amount <= 0) continue
    counts.set(t.currency, (counts.get(t.currency) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
}

export const buildReport = (
  txns: Transaction[],
  currency: string,
  excludedTypes: Set<string>,
  excludedSenders: Set<string>,
  excludedByYear: Set<string>,
): EarningsReport => {
  const currencies = collectCurrencies(txns)
  const yearMap = new Map<number, YearlyEarnings>()

  let grandTotal = 0
  let grandCount = 0
  let bestMonth: EarningsReport['bestMonth'] = null

  for (const t of txns) {
    if (t.state !== 'COMPLETED') continue
    if (t.amount <= 0) continue
    if (t.currency !== currency) continue
    if (excludedTypes.has(t.typeKey)) continue
    if (excludedSenders.has(senderKey(t.description))) continue
    if (excludedByYear.has(yearSenderKey(t.year, senderKey(t.description)))) continue

    let year = yearMap.get(t.year)
    if (!year) {
      year = {
        year: t.year,
        total: 0,
        count: 0,
        months: Array.from({ length: 12 }, () => ({ total: 0, count: 0 })),
      }
      yearMap.set(t.year, year)
    }

    const cell = year.months[t.month]
    if (cell) {
      cell.total += t.amount
      cell.count += 1
    }
    year.total += t.amount
    year.count += 1
    grandTotal += t.amount
    grandCount += 1

    if (cell && (!bestMonth || cell.total > bestMonth.total)) {
      bestMonth = { year: t.year, month: t.month, total: cell.total }
    }
  }

  const years = [...yearMap.values()].sort((a, b) => b.year - a.year)

  return {
    currency,
    currencies,
    years,
    grandTotal,
    grandCount,
    bestMonth,
  }
}
