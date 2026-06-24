import { useMemo, useState } from 'react'

import { yearSenderKey } from '../lib/aggregate'
import { initialsOf } from '../lib/dashboard'
import { formatDate, formatMoney, MONTHS } from '../lib/format'
import type { Transaction, YearlyEarnings } from '../lib/types'
import { Modal } from './Modal'

type Props = {
  years: YearlyEarnings[]
  selMax: number
  currency: string
  txnsByYear: Map<number, Transaction[]>
  excludedSenders: Set<string>
  excludedByYear: Set<string>
  onToggleGlobal: (key: string) => void
  onToggleYear: (year: number, key: string) => void
}

export const MonthlyBreakdown = ({
  years,
  selMax,
  currency,
  txnsByYear,
  excludedSenders,
  excludedByYear,
  onToggleGlobal,
  onToggleYear,
}: Props) => {
  const [openYear, setOpenYear] = useState<number | null>(null)

  return (
    <section>
      <div className="text-base font-semibold tracking-tight">Monthly breakdown</div>
      <div className="text-[12.5px] text-muted">Bars scaled to the busiest month across the selected range</div>
      <div className="mt-4 grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(330px,1fr))]">
        {years.map((y) => (
          <div key={y.year} className="rounded-[14px] border border-border bg-panel px-5 py-[18px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">{y.year}</span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold text-accent-soft">{formatMoney(y.total, currency)}</span>
                <button
                  onClick={() => setOpenYear(y.year)}
                  className="rounded-lg border border-border bg-panel-2 px-2.5 py-1 text-xs font-medium text-[#aeb4c0] transition-colors hover:border-accent hover:text-text"
                >
                  Details
                </button>
              </div>
            </div>
            <div className="mt-[18px] flex items-end gap-1.5">
              {y.months.map((m, mi) => {
                const h = selMax > 0 ? (m.total / selMax) * 100 : 0
                return (
                  <div key={mi} className="flex flex-1 flex-col items-center gap-[7px]">
                    <div className="flex h-[118px] w-full items-end" title={`${MONTHS[mi]}: ${formatMoney(m.total, currency)}`}>
                      <div
                        className="min-h-[3px] w-full rounded-[4px_4px_2px_2px] bg-linear-180 from-accent-soft to-accent transition-opacity hover:opacity-75"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-subtle">{MONTHS[mi]?.[0]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {openYear !== null ? (
        <YearModal
          year={openYear}
          currency={currency}
          transactions={txnsByYear.get(openYear) ?? []}
          total={years.find((y) => y.year === openYear)?.total ?? 0}
          excludedSenders={excludedSenders}
          excludedByYear={excludedByYear}
          onToggleGlobal={onToggleGlobal}
          onToggleYear={onToggleYear}
          onClose={() => setOpenYear(null)}
        />
      ) : null}
    </section>
  )
}

const YearModal = ({
  year,
  currency,
  transactions,
  total,
  excludedSenders,
  excludedByYear,
  onToggleGlobal,
  onToggleYear,
  onClose,
}: {
  year: number
  currency: string
  transactions: Transaction[]
  total: number
  excludedSenders: Set<string>
  excludedByYear: Set<string>
  onToggleGlobal: (key: string) => void
  onToggleYear: (year: number, key: string) => void
  onClose: () => void
}) => {
  const [expanded, setExpanded] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; name: string; count: number; total: number; txns: Transaction[] }>()
    for (const t of transactions) {
      const name = t.description.trim() || '(no description)'
      const key = name.toLowerCase()
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
        existing.total += t.amount
        existing.txns.push(t)
      } else {
        map.set(key, { key, name, count: 1, total: t.amount, txns: [t] })
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [transactions])

  return (
    <Modal
      title={`Transactions · ${year}`}
      subtitle={`${transactions.length} transactions · ${formatMoney(total, currency)}`}
      onClose={onClose}
    >
      {grouped.length ? (
        <>
          <div className="mb-1 flex items-center gap-2 border-b border-[#1d2128] pb-3 text-[11px] text-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Toggle a payer out of <strong className="font-semibold text-[#aeb4c0]">this year</strong> only, or{' '}
            <strong className="font-semibold text-[#aeb4c0]">globally</strong> across every year.
          </div>
          <ul className="flex flex-col">
            {grouped.map((g) => {
              const offGlobal = excludedSenders.has(g.key)
              const offYear = excludedByYear.has(yearSenderKey(year, g.key))
              const off = offGlobal || offYear
              const isOpen = expanded === g.key
              return (
                <li key={g.key} className="border-b border-[#1d2128] last:border-b-0">
                  <div className="flex items-center gap-3 py-2.5">
                    <button
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                      onClick={() => setExpanded((cur) => (cur === g.key ? null : g.key))}
                      style={{ opacity: off ? 0.45 : 1 }}
                    >
                      <span className="w-2.5 shrink-0 text-xs text-subtle">{isOpen ? '▾' : '▸'}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1f232c] text-[10px] font-semibold text-[#aeb4c0]">
                        {initialsOf(g.name)}
                      </span>
                      <span className={`truncate text-sm font-medium ${off ? 'line-through' : ''}`}>{g.name}</span>
                      <span className="shrink-0 rounded-full bg-[#1a1d23] px-2 py-px text-[11px] text-muted">
                        {g.count}
                      </span>
                    </button>
                    <button
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        offYear
                          ? 'border-accent bg-accent/[0.14] text-accent-soft'
                          : 'border-border bg-panel-2 text-muted hover:border-accent hover:text-text'
                      }`}
                      onClick={() => onToggleYear(year, g.key)}
                    >
                      This year
                    </button>
                    <button
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        offGlobal
                          ? 'border-danger bg-danger/[0.14] text-danger'
                          : 'border-border bg-panel-2 text-muted hover:border-danger hover:text-text'
                      }`}
                      onClick={() => onToggleGlobal(g.key)}
                    >
                      Global
                    </button>
                    <span
                      className={`min-w-24 shrink-0 text-right font-mono text-sm font-medium ${
                        off ? 'text-subtle' : 'text-accent-soft'
                      }`}
                    >
                      {formatMoney(g.total, currency)}
                    </span>
                  </div>

                  {isOpen ? (
                    <div className="overflow-x-auto pb-3 pl-11">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="text-left text-muted">
                            <th className="py-1.5 pr-3 font-medium">Date</th>
                            <th className="py-1.5 pr-3 font-medium">Type</th>
                            <th className="py-1.5 pr-3 font-medium">State</th>
                            <th className="py-1.5 pl-3 text-right font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...g.txns]
                            .sort((a, b) => b.date.getTime() - a.date.getTime())
                            .map((t, i) => (
                              <tr key={i} className="border-t border-[#1d2128]">
                                <td className="py-1.5 pr-3 whitespace-nowrap font-mono text-muted">
                                  {formatDate(t.date)}
                                </td>
                                <td className="py-1.5 pr-3 whitespace-nowrap text-[#c6cbd4]">{t.type}</td>
                                <td className="py-1.5 pr-3 whitespace-nowrap text-muted">{t.state}</td>
                                <td className="py-1.5 pl-3 text-right font-mono font-medium text-[#e1e5ec]">
                                  {formatMoney(t.amount, t.currency)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted">No transactions for this year.</p>
      )}
    </Modal>
  )
}
