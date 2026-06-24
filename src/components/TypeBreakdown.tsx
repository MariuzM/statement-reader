import { formatMoney } from '../lib/format'

type TypeRow = { key: string; type: string; count: number; total: number; in: number; out: number }

export const TypeBreakdown = ({
  rows,
  currency,
}: {
  rows: TypeRow[]
  currency: string
}) => {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.total)))
  const netTotal = rows.reduce((sum, r) => sum + r.total, 0)
  const totalCount = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-panel">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="sticky top-0 bg-panel px-[14px] py-2.5 text-left font-semibold text-muted">Type</th>
            {['Count', 'In', 'Out', 'Net'].map((h) => (
              <th
                key={h}
                className="sticky top-0 whitespace-nowrap border-b border-border bg-panel px-[14px] py-2.5 text-right font-semibold text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-panel-2">
              <td className="px-[14px] py-2.5 text-left font-semibold text-text">{r.type}</td>
              <td className="whitespace-nowrap px-[14px] py-2.5 text-right">{r.count}</td>
              <td className="whitespace-nowrap px-[14px] py-2.5 text-right">
                {r.in ? formatMoney(r.in, currency) : '·'}
              </td>
              <td className="whitespace-nowrap px-[14px] py-2.5 text-right">
                {r.out ? formatMoney(r.out, currency) : '·'}
              </td>
              <td
                className="relative whitespace-nowrap px-[14px] py-2.5 text-right"
                style={{ '--ratio': Math.abs(r.total) / max } as React.CSSProperties}
              >
                <span className="absolute inset-[4px_6px] z-0 rounded-md bg-[color-mix(in_srgb,var(--color-accent)_calc(var(--ratio,0)*70%),transparent)]" />
                <span className="relative z-[1]">{formatMoney(r.total, currency)}</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border-t border-border px-[14px] py-2.5 text-left font-bold text-text">Total</td>
            <td className="whitespace-nowrap border-t border-border px-[14px] py-2.5 text-right font-bold">
              {totalCount}
            </td>
            <td className="border-t border-border" />
            <td className="border-t border-border" />
            <td className="whitespace-nowrap border-t border-border px-[14px] py-2.5 text-right font-bold text-good">
              {formatMoney(netTotal, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
