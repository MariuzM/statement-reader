import { senderKey } from './aggregate'
import { MONTHS } from './format'
import type { EarningsReport, Transaction, YearlyEarnings } from './types'

export type YearFilter = 'all' | number
export type ChartMode = 'cumulative' | 'byMonth'

export type LineTone = 'accent' | 'prior' | 'older'

export type HeroLine = { year: number; points: string; tone: LineTone }
export type HeroLegend = { label: string; amount: number; tone: LineTone; year?: number }

export type Hero = {
  isCumulative: boolean
  linePoints: string
  areaPath: string
  lines: HeroLine[]
  max: number
  xLabels: string[]
  legend: HeroLegend[]
}

export type Dashboard = {
  years: YearlyEarnings[]
  selMax: number
  total: number
  grandTotal: number
  activeMonths: number
  avgActiveMonth: number
  avgYear: number
  bestMonth: { year: number; month: number; total: number } | null
  delta: { label: string; up: boolean } | null
  hero: Hero
}

export type SenderRow = { key: string; name: string; count: number; total: number }

const monthsOf = (y: YearlyEarnings) => y.months.map((m) => m.total)

const ascYears = (report: EarningsReport) => [...report.years].sort((a, b) => a.year - b.year)

export const selectedYears = (report: EarningsReport, filter: YearFilter): YearlyEarnings[] => {
  const asc = ascYears(report)
  return filter === 'all' ? asc : asc.filter((y) => y.year === filter)
}

export const sendersForYears = (
  txns: Transaction[],
  currency: string,
  excludedTypes: Set<string>,
  yearSet: Set<number> | null,
): SenderRow[] => {
  const map = new Map<string, SenderRow>()
  for (const t of txns) {
    if (t.state !== 'COMPLETED') continue
    if (t.amount <= 0) continue
    if (t.currency !== currency) continue
    if (excludedTypes.has(t.typeKey)) continue
    if (yearSet && !yearSet.has(t.year)) continue
    const name = t.description.trim() || '(no description)'
    const key = senderKey(t.description)
    const existing = map.get(key)
    if (existing) {
      existing.count += 1
      existing.total += t.amount
    } else {
      map.set(key, { key, name, count: 1, total: t.amount })
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

type Line = { linePoints: string; areaPath: string }

const buildLine = (values: number[], maxV: number): Line => {
  const W = 1000
  const H = 260
  const padT = 14
  const padB = 8
  const n = values.length
  const x = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const y = (v: number) => H - padB - (maxV > 0 ? v / maxV : 0) * (H - padT - padB)
  const pts = values.map((v, i) => [Number(x(i).toFixed(1)), Number(y(v).toFixed(1))] as const)
  const linePoints = pts.map((p) => p.join(',')).join(' ')
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return { linePoints: '', areaPath: '' }
  const base = H - padB
  const areaPath = `M${first[0]},${base} ${pts.map((p) => `L${p[0]},${p[1]}`).join(' ')} L${last[0]},${base} Z`
  return { linePoints, areaPath }
}

const lineTone = (i: number, count: number): LineTone => {
  if (i === count - 1) return 'accent'
  if (i === count - 2) return 'prior'
  return 'older'
}

export const buildDashboard = (
  report: EarningsReport,
  filter: YearFilter,
  chartMode: ChartMode,
): Dashboard => {
  const years = selectedYears(report, filter)
  const asc = ascYears(report)
  const total = years.reduce((s, y) => s + y.total, 0)
  const grandTotal = report.grandTotal
  const monthsFlat = years.flatMap(monthsOf)
  const activeMonths = monthsFlat.filter((v) => v > 0).length
  const avgActiveMonth = activeMonths ? total / activeMonths : 0
  const avgYear = years.length ? total / years.length : 0
  const selMax = monthsFlat.length ? Math.max(...monthsFlat) : 0

  let bestMonth: Dashboard['bestMonth'] = null
  for (const y of years) {
    y.months.forEach((m, mi) => {
      if (m.total > 0 && (!bestMonth || m.total > bestMonth.total)) {
        bestMonth = { year: y.year, month: mi, total: m.total }
      }
    })
  }

  const totalOf = (year: number) => asc.find((y) => y.year === year)?.total ?? null
  const growth = (a: number, b: number) => (a > 0 ? (b - a) / a : 0)
  let delta: Dashboard['delta'] = null
  if (years.length >= 2) {
    const prev = years[years.length - 2]
    const last = years[years.length - 1]
    if (prev && last) {
      const g = growth(prev.total, last.total)
      delta = { label: `${g >= 0 ? '+' : ''}${Math.round(g * 100)}%`, up: g >= 0 }
    }
  } else if (years.length === 1 && years[0]) {
    const prior = totalOf(years[0].year - 1)
    if (prior !== null) {
      const g = growth(prior, years[0].total)
      delta = { label: `${g >= 0 ? '+' : ''}${Math.round(g * 100)}%`, up: g >= 0 }
    }
  }

  const isCumulative = chartMode === 'cumulative'
  const chrono = years.flatMap(monthsOf)
  let run = 0
  const cum = chrono.map((v) => {
    run += v
    return run
  })
  const cumLine = buildLine(cum, run || 1)
  const lines: HeroLine[] = isCumulative
    ? []
    : years.map((y, i) => ({
        year: y.year,
        points: buildLine(monthsOf(y), selMax || 1).linePoints,
        tone: lineTone(i, years.length),
      }))

  let xLabels: string[]
  if (!isCumulative) xLabels = MONTHS
  else if (years.length > 1) xLabels = years.map((y) => String(y.year))
  else xLabels = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']

  const legend: HeroLegend[] = isCumulative
    ? [{ label: 'Cumulative', amount: total, tone: 'accent' }]
    : years.map((y, i) => ({
        label: String(y.year),
        amount: y.total,
        tone: lineTone(i, years.length),
        year: y.year,
      }))

  const hero: Hero = {
    isCumulative,
    linePoints: cumLine.linePoints,
    areaPath: cumLine.areaPath,
    lines,
    max: isCumulative ? total : selMax,
    xLabels,
    legend,
  }

  return {
    years,
    selMax,
    total,
    grandTotal,
    activeMonths,
    avgActiveMonth,
    avgYear,
    bestMonth,
    delta,
    hero,
  }
}

export const currencySymbol = (currency: string) => {
  try {
    return (0)
      .toLocaleString('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
      .replace(/[\d\s.,]/g, '')
  } catch {
    return currency
  }
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
