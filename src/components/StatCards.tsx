import type { Dashboard } from '../lib/dashboard'
import { formatMoney, MONTHS } from '../lib/format'

type Props = {
  data: Dashboard
  currency: string
}

export const StatCards = ({ data, currency }: Props) => {
  const cards: {
    label: string
    value: string
    accent?: boolean
    chip?: { label: string; up: boolean }
    sub: string
  }[] = [
    {
      label: 'Total earned',
      value: formatMoney(data.total, currency),
      accent: true,
      chip: data.delta ? { label: data.delta.label, up: data.delta.up } : undefined,
      sub: data.delta
        ? 'vs previous year'
        : `${data.years.length} ${data.years.length === 1 ? 'year' : 'years'}`,
    },
    {
      label: 'Avg / active month',
      value: formatMoney(data.avgActiveMonth, currency),
      sub: `${data.activeMonths} active months`,
    },
    {
      label: 'Avg / year',
      value: formatMoney(data.avgYear, currency),
      sub: `${data.years.length} ${data.years.length === 1 ? 'year' : 'years'}`,
    },
    {
      label: 'Best month',
      value: data.bestMonth ? formatMoney(data.bestMonth.total, currency) : '—',
      sub: data.bestMonth
        ? `${MONTHS[data.bestMonth.month]} ${data.bestMonth.year}`
        : 'No earnings',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="border-border bg-panel hover:border-border-strong rounded-[14px] border px-[18px] py-[17px] transition-colors"
        >
          <div className="text-muted text-[11.5px] font-medium tracking-[0.04em] uppercase">
            {c.label}
          </div>
          <div
            className={`mt-2.5 font-mono text-[25px] font-semibold tracking-[-0.01em] ${
              c.accent ? 'text-accent-soft' : 'text-text'
            }`}
          >
            {c.value}
          </div>
          <div className="text-muted mt-2 flex items-center gap-[7px] text-xs">
            {c.chip ? (
              <span
                className={`rounded-md px-[7px] py-0.5 font-mono text-[11px] font-semibold ${
                  c.chip.up ? 'bg-accent/[0.14] text-accent-soft' : 'bg-danger/[0.14] text-danger'
                }`}
              >
                {c.chip.label}
              </span>
            ) : null}
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
