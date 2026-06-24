import { useMemo, useState } from 'react'

import { yearSenderKey } from '../lib/aggregate'
import { initialsOf } from '../lib/dashboard'
import { formatDate, formatMoney } from '../lib/format'
import type { Transaction } from '../lib/types'

import { Modal } from './Modal'

type Props = {
  year: number
  currency: string
  transactions: Transaction[]
  total: number
  excludedSenders: Set<string>
  excludedByYear: Set<string>
  onToggleGlobal: (key: string) => void
  onToggleYear: (year: number, key: string) => void
  onClose: () => void
}

export const YearModal = ({
  year,
  currency,
  transactions,
  total,
  excludedSenders,
  excludedByYear,
  onToggleGlobal,
  onToggleYear,
  onClose,
}: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; count: number; total: number; txns: Transaction[] }
    >()
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
          <div className="text-subtle mb-1 flex items-center gap-2 border-b border-[#1d2128] pb-3 text-[12.5px]">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            Toggle a payer out of{' '}
            <strong className="font-semibold text-[#aeb4c0]">this year</strong> only, or{' '}
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
                  <div className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.04]">
                    <button
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                      onClick={() => setExpanded((cur) => (cur === g.key ? null : g.key))}
                      style={{ opacity: off ? 0.45 : 1 }}
                    >
                      <span
                        className={`text-subtle w-2.5 shrink-0 text-center text-xs transition-transform ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      >
                        ▸
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1f232c] text-[11px] font-semibold text-[#aeb4c0]">
                        {initialsOf(g.name)}
                      </span>
                      <span
                        className={`truncate text-[15px] font-medium ${off ? 'line-through' : ''}`}
                      >
                        {g.name}
                      </span>
                      <span className="text-muted shrink-0 rounded-full bg-[#1a1d23] px-2 py-px text-xs">
                        {g.count}
                      </span>
                    </button>
                    <button
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        offYear
                          ? 'border-accent bg-accent/[0.14] text-accent-soft'
                          : 'border-border bg-panel-2 text-muted hover:border-accent hover:text-text'
                      }`}
                      onClick={() => onToggleYear(year, g.key)}
                    >
                      This year
                    </button>
                    <button
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        offGlobal
                          ? 'border-danger bg-danger/[0.14] text-danger'
                          : 'border-border bg-panel-2 text-muted hover:border-danger hover:text-text'
                      }`}
                      onClick={() => onToggleGlobal(g.key)}
                    >
                      Global
                    </button>
                    <span
                      className={`min-w-24 shrink-0 text-right font-mono text-[15px] font-medium ${
                        off ? 'text-subtle' : 'text-accent-soft'
                      }`}
                    >
                      {formatMoney(g.total, currency)}
                    </span>
                  </div>

                  {isOpen ? (
                    <div className="overflow-x-auto pb-3 pl-11">
                      <table className="w-full border-collapse text-[13px]">
                        <thead>
                          <tr className="text-muted text-left">
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
                                <td className="text-muted py-1.5 pr-3 font-mono whitespace-nowrap">
                                  {formatDate(t.date)}
                                </td>
                                <td className="py-1.5 pr-3 whitespace-nowrap text-[#c6cbd4]">
                                  {t.type}
                                </td>
                                <td className="text-muted py-1.5 pr-3 whitespace-nowrap">
                                  {t.state}
                                </td>
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
        <p className="text-muted text-sm">No transactions for this year.</p>
      )}
    </Modal>
  )
}
