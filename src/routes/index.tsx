import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { DashboardHero } from '../components/DashboardHero'
import { Dropzone } from '../components/Dropzone'
import { Heatmap } from '../components/Heatmap'
import { MonthlyBreakdown } from '../components/MonthlyBreakdown'
import { SenderPanel } from '../components/SenderPanel'
import { Sidebar } from '../components/Sidebar'
import { StatCards } from '../components/StatCards'
import { TaxBreakdown } from '../components/TaxBreakdown'
import { TypeBreakdown } from '../components/TypeBreakdown'
import {
  buildReport,
  collectCurrencies,
  collectIncomeTxns,
  collectTypeBreakdown,
  collectTypes,
  yearSenderKey,
} from '../lib/aggregate'
import { buildDashboard, sendersForYears } from '../lib/dashboard'
import type { ChartMode, YearFilter } from '../lib/dashboard'
import { parseStatement } from '../lib/parse'
import {
  loadExcludedSenders,
  loadExcludedTypes,
  saveExcludedSenders,
  saveExcludedTypes,
} from '../lib/storage'
import type { Transaction } from '../lib/types'

export const Route = createFileRoute('/')({
  component: Home,
})

type View = 'earnings' | 'types' | 'tax'

function Home() {
  const [txns, setTxns] = useState<Transaction[]>([])
  const [fileName, setFileName] = useState('')
  const [currency, setCurrency] = useState('')
  const [excluded, setExcluded] = useState<Set<string>>(loadExcludedTypes)
  const [excludedSenders, setExcludedSenders] = useState<Set<string>>(loadExcludedSenders)
  const [excludedByYear, setExcludedByYear] = useState<Set<string>>(new Set())
  const [view, setView] = useState<View>('earnings')
  const [yearFilter, setYearFilter] = useState<YearFilter>('all')
  const [chartMode, setChartMode] = useState<ChartMode>('cumulative')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (name: string, text: string) => {
    setBusy(true)
    setError('')
    try {
      const parsed = parseStatement(text)
      if (!parsed.length) {
        setError('No transactions found. Make sure this is a Revolut CSV export.')
        setBusy(false)
        return
      }
      const currencies = collectCurrencies(parsed)
      const startCurrency = currencies[0] ?? parsed[0]?.currency ?? '—'
      setTxns(parsed)
      setFileName(name)
      setCurrency(startCurrency)
      setYearFilter('all')
      setExcludedByYear(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read file.')
    }
    setBusy(false)
  }

  useEffect(() => {
    saveExcludedSenders(excludedSenders)
  }, [excludedSenders])

  useEffect(() => {
    saveExcludedTypes(excluded)
  }, [excluded])

  const types = useMemo(() => collectTypes(txns).filter((t) => t.type), [txns])
  const report = useMemo(
    () =>
      txns.length ? buildReport(txns, currency, excluded, excludedSenders, excludedByYear) : null,
    [txns, currency, excluded, excludedSenders, excludedByYear],
  )

  const yearList = useMemo(
    () => (report ? [...report.years].map((y) => y.year).sort((a, b) => b - a) : []),
    [report],
  )

  const dashboard = useMemo(
    () => (report ? buildDashboard(report, yearFilter, chartMode) : null),
    [report, yearFilter, chartMode],
  )

  const yearSet = useMemo<Set<number> | null>(
    () => (yearFilter === 'all' ? null : new Set([yearFilter])),
    [yearFilter],
  )

  const senders = useMemo(
    () => (txns.length ? sendersForYears(txns, currency, excluded, yearSet) : []),
    [txns, currency, excluded, yearSet],
  )

  const txnsByYear = useMemo(() => {
    const map = new Map<number, Transaction[]>()
    if (!txns.length) return map
    for (const t of collectIncomeTxns(txns, currency, excluded)) {
      const arr = map.get(t.year)
      if (arr) arr.push(t)
      else map.set(t.year, [t])
    }
    return map
  }, [txns, currency, excluded])

  const filteredTxns = useMemo(
    () => (yearSet ? txns.filter((t) => yearSet.has(t.year)) : txns),
    [txns, yearSet],
  )

  const typeBreakdown = useMemo(
    () => (txns.length ? collectTypeBreakdown(filteredTxns, currency) : []),
    [txns, filteredTxns, currency],
  )

  const taxYears = useMemo(
    () =>
      report ? (yearSet ? report.years.filter((y) => yearSet.has(y.year)) : report.years) : [],
    [report, yearSet],
  )

  const onCurrency = (c: string) => {
    setCurrency(c)
    setYearFilter('all')
  }

  const toggleType = (key: string) => {
    setExcluded((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleSender = (key: string) => {
    setExcludedSenders((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleYearSender = (year: number, key: string) => {
    const composite = yearSenderKey(year, key)
    setExcludedByYear((s) => {
      const next = new Set(s)
      if (next.has(composite)) next.delete(composite)
      else next.add(composite)
      return next
    })
  }

  const allSenders = () => setExcludedSenders(new Set())
  const noSenders = () => setExcludedSenders(new Set(senders.map((x) => x.key)))

  const reset = () => {
    setTxns([])
    setFileName('')
    setError('')
    setView('earnings')
    setYearFilter('all')
  }

  if (!report || !dashboard) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-center px-6 py-16">
        <header className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight">Statement Reader</h1>
          <p className="text-muted mt-1.5">How much you earned, per month and per year.</p>
        </header>
        <Dropzone onFile={handleFile} busy={busy} />
        {error ? <p className="text-danger mt-4 text-sm">{error}</p> : null}
        <ul className="text-muted mt-6 list-disc pl-[18px] text-sm leading-[1.9]">
          <li>Everything runs in your browser — nothing is uploaded.</li>
          <li>Earnings = incoming money, excluding top-ups and card refunds by default.</li>
          <li>Toggle which transaction types count once your file is loaded.</li>
        </ul>
      </main>
    )
  }

  const sel = dashboard.years
  const first = sel[0]
  const last = sel[sel.length - 1]
  const dateRange =
    first && last
      ? first.year === last.year
        ? `Jan – Dec ${first.year}`
        : `${first.year} – ${last.year}`
      : '—'

  const headers: Record<View, { title: string; sub: string }> = {
    earnings: { title: 'Earnings', sub: `${dateRange} · ${currency}` },
    types: { title: 'By type', sub: 'Every transaction grouped by type' },
    tax: { title: 'Tax (LT)', sub: 'Lithuania individual-activity estimate' },
  }
  const head = headers[view]

  return (
    <div className="flex min-h-screen">
      <Sidebar
        fileName={fileName}
        txnCount={report.grandCount}
        yearCount={report.years.length}
        view={view}
        onView={setView}
        currencies={report.currencies}
        currency={currency}
        onCurrency={onCurrency}
        years={yearList}
        yearFilter={yearFilter}
        onYearFilter={setYearFilter}
        types={types}
        excludedTypes={excluded}
        onToggleType={toggleType}
        onReset={reset}
      />

      <main className="min-w-0 flex-1 px-[42px] pt-[34px] pb-[90px]">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-[18px]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.025em]">{head.title}</h1>
              <div className="text-muted mt-1.5 text-[13px]">{head.sub}</div>
            </div>
          </div>

          {view === 'earnings' ? (
            dashboard.years.length ? (
              <>
                <DashboardHero
                  total={dashboard.total}
                  currency={currency}
                  delta={dashboard.delta}
                  hero={dashboard.hero}
                  mode={chartMode}
                  onMode={setChartMode}
                />
                <StatCards data={dashboard} currency={currency} />
                {senders.length ? (
                  <SenderPanel
                    senders={senders}
                    currency={currency}
                    excluded={excludedSenders}
                    onToggle={toggleSender}
                    onAll={allSenders}
                    onNone={noSenders}
                  />
                ) : null}
                <Heatmap years={dashboard.years} selMax={dashboard.selMax} currency={currency} />
                <MonthlyBreakdown
                  years={dashboard.years}
                  selMax={dashboard.selMax}
                  currency={currency}
                  txnsByYear={txnsByYear}
                  excludedSenders={excludedSenders}
                  excludedByYear={excludedByYear}
                  onToggleGlobal={toggleSender}
                  onToggleYear={toggleYearSender}
                />
              </>
            ) : (
              <p className="text-danger text-sm">
                No earnings in {currency} with the current filters.
              </p>
            )
          ) : view === 'types' ? (
            <TypeBreakdown rows={typeBreakdown} currency={currency} />
          ) : (
            <TaxBreakdown years={taxYears} currency={currency} />
          )}
        </div>
      </main>
    </div>
  )
}
