import Papa from 'papaparse'

import type { Transaction } from './types'

export const normalizeType = (t: string) => t.trim().toUpperCase().replace(/\s+/g, '_')

const toNumber = (v: string | undefined) => {
  if (!v) return 0
  const cleaned = String(v).replace(/[^0-9.,-]/g, '')
  const normalized =
    cleaned.includes(',') && !cleaned.includes('.')
      ? cleaned.replace(',', '.')
      : cleaned.replace(/,/g, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

const pick = (row: Record<string, string>, keys: string[]) => {
  const lookup = Object.keys(row)
  for (const key of keys) {
    const match = lookup.find((rk) => rk.trim().toLowerCase() === key.toLowerCase())
    if (match) {
      const value = row[match]
      if (value != null && String(value).trim() !== '') return String(value).trim()
    }
  }
  return ''
}

const parseDate = (s: string): Date | null => {
  if (!s) return null
  const trimmed = s.trim()
  const isoLike = new Date(trimmed.replace(' ', 'T'))
  if (!Number.isNaN(isoLike.getTime())) return isoLike
  const fallback = new Date(trimmed)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export const parseStatement = (csv: string): Transaction[] => {
  const res = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const out: Transaction[] = []
  for (const row of res.data) {
    const dateStr = pick(row, ['Completed Date', 'Started Date', 'Date'])
    const date = parseDate(dateStr)
    if (!date) continue

    const type = pick(row, ['Type']) || 'UNKNOWN'
    out.push({
      type,
      typeKey: normalizeType(type),
      description: pick(row, ['Description']),
      amount: toNumber(pick(row, ['Amount'])),
      fee: toNumber(pick(row, ['Fee'])),
      currency: pick(row, ['Currency']) || '—',
      state: (pick(row, ['State']) || 'COMPLETED').toUpperCase(),
      date,
      year: date.getFullYear(),
      month: date.getMonth(),
    })
  }
  return out
}
