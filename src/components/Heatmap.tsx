import type { YearlyEarnings } from '../lib/types'
import { formatMoney, MONTHS } from '../lib/format'

export const Heatmap = ({
  years,
  selMax,
  currency,
}: {
  years: YearlyEarnings[]
  selMax: number
  currency: string
}) => {
  const cellBg = (total: number) => {
    const ratio = selMax > 0 ? total / selMax : 0
    const pct = ((0.05 + ratio * 0.5) * 100).toFixed(1)
    return `color-mix(in srgb, var(--color-accent) ${pct}%, transparent)`
  }

  return (
    <section className="overflow-x-auto rounded-[16px] border border-border bg-panel px-6 py-[22px]">
      <div className="text-base font-semibold tracking-tight">Per month, per year</div>
      <div className="mt-1 text-[12.5px] text-muted">Heatmap shaded by earnings · brighter means more</div>
      <table className="mt-4 w-full border-separate border-spacing-1 font-mono">
        <thead>
          <tr>
            <th className="px-2.5 py-1.5 text-left font-sans text-[11px] font-medium uppercase tracking-[0.04em] text-subtle">
              Month
            </th>
            {years.map((y) => (
              <th key={y.year} className="px-3.5 py-1.5 text-right text-xs font-semibold text-muted">
                {y.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((label, mi) => (
            <tr key={label}>
              <td className="whitespace-nowrap px-2.5 py-[7px] font-sans text-[13px] text-[#c6cbd4]">{label}</td>
              {years.map((y) => {
                const total = y.months[mi]?.total ?? 0
                return (
                  <td
                    key={y.year}
                    className="rounded-[7px] px-3.5 py-[9px] text-right text-[12.5px] text-[#e1e5ec]"
                    style={{ background: cellBg(total) }}
                  >
                    {total > 0 ? formatMoney(total, currency) : '·'}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <td className="px-2.5 py-[9px] font-sans text-xs font-semibold uppercase tracking-[0.04em] text-muted">
              Total
            </td>
            {years.map((y) => (
              <td
                key={y.year}
                className="rounded-[7px] bg-accent/[0.16] px-3.5 py-2.5 text-right text-[13px] font-semibold text-accent-soft"
              >
                {formatMoney(y.total, currency)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  )
}
