import { useState } from 'react'

import { formatMoney, MONTHS } from '../lib/format'
import type { Transaction, YearlyEarnings } from '../lib/types'

import { YearModal } from './YearModal'

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
      <div className="text-muted text-[12.5px]">
        Bars scaled to the busiest month across the selected range
      </div>
      <div className="mt-4 grid [grid-template-columns:repeat(auto-fill,minmax(330px,1fr))] gap-3.5">
        {years.map((y) => (
          <div key={y.year} className="border-border bg-panel rounded-[14px] border px-5 py-[18px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">{y.year}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-accent-soft font-mono text-sm font-semibold">
                  {formatMoney(y.total, currency)}
                </span>
                <button
                  onClick={() => setOpenYear(y.year)}
                  className="border-border bg-panel-2 hover:border-accent hover:text-text rounded-lg border px-2.5 py-1 text-xs font-medium text-[#aeb4c0] transition-colors"
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
                    <div
                      className="flex h-[118px] w-full items-end"
                      title={`${MONTHS[mi]}: ${formatMoney(m.total, currency)}`}
                    >
                      <div
                        className="from-accent-soft to-accent min-h-[3px] w-full rounded-[4px_4px_2px_2px] bg-linear-180 transition-opacity hover:opacity-75"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-subtle font-mono text-[9px]">{MONTHS[mi]?.[0]}</span>
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
