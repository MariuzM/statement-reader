import { useMemo } from 'react'

import { formatMoney, formatPercent } from '../lib/format'
import { computeLtTaxes } from '../lib/tax'
import type { YearlyEarnings } from '../lib/types'
import { sectionTitle } from '../lib/ui'

const Row = ({
  label,
  value,
  hint,
  tone,
  strong,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'muted' | 'good' | 'danger'
  strong?: boolean
}) => {
  const valueColor = tone === 'good' ? 'text-good' : tone === 'danger' ? 'text-danger' : ''
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className={`text-sm ${strong ? 'font-semibold' : 'text-muted'}`}>
        {label}
        {hint ? <span className="text-muted ml-1.5 text-xs">{hint}</span> : null}
      </span>
      <span className={`shrink-0 tabular-nums ${strong ? 'font-semibold' : ''} ${valueColor}`}>
        {value}
      </span>
    </div>
  )
}

export const TaxBreakdown = ({
  years,
  currency,
}: {
  years: YearlyEarnings[]
  currency: string
}) => {
  const rows = useMemo(
    () => computeLtTaxes(years.map((y) => ({ year: y.year, total: y.total }))),
    [years],
  )

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          revenue: acc.revenue + r.grossRevenue,
          incomeTax: acc.incomeTax + r.incomeTax,
          takeHome: acc.takeHome + r.takeHome,
        }),
        { revenue: 0, incomeTax: 0, takeHome: 0 },
      ),
    [rows],
  )

  if (!rows.length) {
    return <p className="text-muted text-sm">No earnings to calculate tax on.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border-border bg-panel border px-5 py-[18px]">
        <h2 className={sectionTitle}>Lithuania · individual activity (pažyma)</h2>
        <p className="text-muted mt-1 text-[13px]">
          Flat 30% expenses · GPM with 5–15% credit · VSD 12.52% + PSD 6.98% on 90% of profit.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="border-border bg-panel-2 rounded-lg border px-4 py-3">
            <div className="text-muted text-xs">Total earned</div>
            <div className="mt-1 text-lg font-bold tabular-nums">
              {formatMoney(totals.revenue, currency)}
            </div>
          </div>
          <div className="border-border bg-panel-2 rounded-lg border px-4 py-3">
            <div className="text-muted text-xs">Tax + Sodra</div>
            <div className="text-danger mt-1 text-lg font-bold tabular-nums">
              {formatMoney(totals.incomeTax, currency)}
            </div>
          </div>
          <div className="border-border bg-panel-2 rounded-lg border px-4 py-3">
            <div className="text-muted text-xs">Take home</div>
            <div className="text-good mt-1 text-lg font-bold tabular-nums">
              {formatMoney(totals.takeHome, currency)}
            </div>
            <div className="text-muted text-xs">
              {formatPercent(totals.revenue > 0 ? totals.incomeTax / totals.revenue : 0)} taken
            </div>
          </div>
        </div>
      </div>

      {rows.map((r) => (
        <div key={r.year} className="rounded-card border-border bg-panel border p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-lg">
              {r.year}
              {!r.exact ? (
                <span className="text-muted ml-2 align-middle text-xs">(estimated rates)</span>
              ) : null}
            </h3>
            <span className="text-muted text-[13px]">
              {formatPercent(r.effectiveRate)} effective rate
            </span>
          </div>

          <div className="divide-border divide-y">
            <Row label="Earnings (gross)" value={formatMoney(r.grossRevenue, currency)} strong />
            <Row
              label="Expenses"
              hint={`${formatPercent(r.config.expenseRate)} flat`}
              value={`− ${formatMoney(r.expenses, currency)}`}
              tone="muted"
            />
            <Row label="Taxable profit" value={formatMoney(r.taxableProfit, currency)} strong />
            <Row
              label="GPM (income tax)"
              hint={`${formatPercent(r.gpmRate)} of profit`}
              value={`− ${formatMoney(r.gpm, currency)}`}
              tone="danger"
            />
            <Row
              label="VSD (Sodra pension)"
              hint={`${formatPercent(r.config.vsdRate)} of ${formatMoney(r.vsdBase, currency)}${
                r.vsdCapped ? ' · capped' : ''
              }`}
              value={`− ${formatMoney(r.vsd, currency)}`}
              tone="danger"
            />
            <Row
              label="PSD (health)"
              hint={
                r.psdAtMinimum
                  ? 'annual minimum'
                  : `${formatPercent(r.config.psdRate)} of ${formatMoney(r.contribBase, currency)}`
              }
              value={`− ${formatMoney(r.psd, currency)}`}
              tone="danger"
            />
            <Row
              label="Total due (tax + Sodra)"
              value={`− ${formatMoney(r.totalDue, currency)}`}
              tone="danger"
              strong
            />
            <Row label="Take home" value={formatMoney(r.takeHome, currency)} tone="good" strong />
          </div>
        </div>
      ))}
    </div>
  )
}
