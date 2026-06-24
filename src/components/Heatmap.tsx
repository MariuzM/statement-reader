import { formatMoney, MONTHS } from '../lib/format'
import type { YearlyEarnings } from '../lib/types'

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
    <section className="border-border bg-panel overflow-x-auto rounded-[16px] border px-6 py-[22px]">
      <div className="text-base font-semibold tracking-tight">Per month, per year</div>
      <div className="text-muted mt-1 text-[12.5px]">
        Heatmap shaded by earnings · brighter means more
      </div>
      <table className="mt-4 w-full border-separate border-spacing-1 font-mono">
        <thead>
          <tr>
            <th className="text-subtle px-2.5 py-1.5 text-left font-sans text-[11px] font-medium tracking-[0.04em] uppercase">
              Month
            </th>
            {years.map((y) => (
              <th
                key={y.year}
                className="text-muted px-3.5 py-1.5 text-right text-xs font-semibold"
              >
                {y.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((label, mi) => (
            <tr key={label}>
              <td className="px-2.5 py-[7px] font-sans text-[13px] whitespace-nowrap text-[#c6cbd4]">
                {label}
              </td>
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
            <td className="text-muted px-2.5 py-[9px] font-sans text-xs font-semibold tracking-[0.04em] uppercase">
              Total
            </td>
            {years.map((y) => (
              <td
                key={y.year}
                className="bg-accent/[0.16] text-accent-soft rounded-[7px] px-3.5 py-2.5 text-right text-[13px] font-semibold"
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
