import { currencySymbol } from '../lib/dashboard'
import type { YearFilter } from '../lib/dashboard'
import { formatMoney } from '../lib/format'

type View = 'earnings' | 'types' | 'tax'
type TypeInfo = { key: string; type: string; count: number; total: number }

const VIEWS: { key: View; label: string }[] = [
  { key: 'earnings', label: 'Earnings' },
  { key: 'types', label: 'By type' },
  { key: 'tax', label: 'Tax (LT)' },
]

export const Sidebar = ({
  fileName,
  txnCount,
  yearCount,
  view,
  onView,
  currencies,
  currency,
  onCurrency,
  years,
  yearFilter,
  onYearFilter,
  types,
  excludedTypes,
  onToggleType,
  onReset,
}: {
  fileName: string
  txnCount: number
  yearCount: number
  view: View
  onView: (v: View) => void
  currencies: string[]
  currency: string
  onCurrency: (c: string) => void
  years: number[]
  yearFilter: YearFilter
  onYearFilter: (f: YearFilter) => void
  types: TypeInfo[]
  excludedTypes: Set<string>
  onToggleType: (key: string) => void
  onReset: () => void
}) => {
  const yearChips: { label: string; value: YearFilter }[] = [
    { label: 'All', value: 'all' },
    ...years.map((y) => ({ label: String(y), value: y as YearFilter })),
  ]

  return (
    <aside className="sticky top-0 flex h-screen w-[266px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-[#0c0e12] px-[18px] py-[22px]">
      <div className="flex items-center gap-[11px]">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-linear-145 from-accent-soft to-accent-dark text-base font-bold text-[#06120d]">
          S
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">Statement Reader</div>
          <div className="mt-px text-[11px] text-muted">Earnings report</div>
        </div>
      </div>

      <div className="rounded-[11px] border border-border bg-panel-2 px-[13px] py-3">
        <div className="flex items-center gap-2 overflow-hidden text-[12.5px] font-medium">
          <span className="h-[7px] w-[7px] shrink-0 rounded-sm bg-accent" />
          <span className="truncate">{fileName || 'No file loaded'}</span>
        </div>
        <div className="mt-1.5 text-[11px] text-muted">
          {txnCount} earning transactions · {yearCount} {yearCount === 1 ? 'year' : 'years'}
        </div>
      </div>

      <div>
        <div className="mb-[9px] px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
          Views
        </div>
        <nav className="flex flex-col gap-0.5">
          {VIEWS.map((v) => {
            const active = view === v.key
            return (
              <button
                key={v.key}
                onClick={() => onView(v.key)}
                className={`flex items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-[13.5px] font-medium transition-colors ${
                  active ? 'bg-white/[0.055] text-text' : 'text-muted hover:bg-white/[0.03] hover:text-[#c6cbd4]'
                }`}
              >
                <span className={`h-2 w-2 rounded-sm ${active ? 'bg-accent' : 'bg-[#3a3f4b]'}`} />
                {v.label}
              </button>
            )
          })}
        </nav>
      </div>

      {currencies.length ? (
        <div>
          <div className="mb-[9px] px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
            Currency
          </div>
          {currencies.length > 1 ? (
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => onCurrency(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-[9px] border border-border bg-panel-2 px-3 py-[9px] text-[13px] font-medium text-text outline-none focus:border-accent"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {currencySymbol(c)}  {c}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-subtle">
                ▾
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-[9px] border border-border bg-panel-2 px-3 py-[9px] text-[13px] font-medium">
              <span className="font-mono text-muted">{currencySymbol(currency)}</span>
              {currency}
            </div>
          )}
          <div className="mt-[7px] px-1 text-[10.5px] leading-[1.4] text-subtle">
            Earnings are summed per currency — switch to see another.
          </div>
        </div>
      ) : null}

      {years.length ? (
        <div>
          <div className="mb-[9px] px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
            Filter by year
          </div>
          <div className="flex flex-wrap gap-1.5">
            {yearChips.map((c) => {
              const active = yearFilter === c.value
              return (
                <button
                  key={c.label}
                  onClick={() => onYearFilter(c.value)}
                  className={`rounded-lg border px-[13px] py-1.5 text-[12.5px] font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent/[0.12] text-accent-soft'
                      : 'border-border bg-panel-2 text-[#aeb4c0] hover:border-border-strong'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {types.length ? (
        <div>
          <div className="mb-[9px] px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
            Count as earnings
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => {
              const on = !excludedTypes.has(t.key)
              return (
                <button
                  key={t.key}
                  onClick={() => onToggleType(t.key)}
                  title={`${t.count} transactions · ${formatMoney(t.total, currency)}`}
                  className={`rounded-lg border px-[11px] py-1.5 text-[12px] font-medium transition-colors ${
                    on
                      ? 'border-accent bg-accent/[0.12] text-accent-soft'
                      : 'border-border bg-panel-2 text-[#aeb4c0] hover:border-border-strong'
                  }`}
                >
                  {on ? '✓ ' : ''}
                  {t.type}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2.5 px-1">
        <button
          onClick={onReset}
          className="rounded-[9px] border border-border bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-[#aeb4c0] transition-colors hover:border-accent hover:text-text"
        >
          Load new file
        </button>
        <div className="text-[10.5px] leading-[1.5] text-[#4f5666]">
          Runs entirely in your browser.
          <br />
          No data leaves this device.
        </div>
      </div>
    </aside>
  )
}
