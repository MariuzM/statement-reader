import { formatMoney } from '../lib/format'

type TypeRow = { key: string; type: string; count: number; total: number; in: number; out: number }

export const TypeBreakdown = ({ rows, currency }: { rows: TypeRow[]; currency: string }) => {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.total)))
  const netTotal = rows.reduce((sum, r) => sum + r.total, 0)
  const totalCount = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="rounded-card border-border bg-panel overflow-x-auto border">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="bg-panel text-muted sticky top-0 px-[14px] py-2.5 text-left font-semibold">
              Type
            </th>
            {['Count', 'In', 'Out', 'Net'].map((h) => (
              <th
                key={h}
                className="border-border bg-panel text-muted sticky top-0 border-b px-[14px] py-2.5 text-right font-semibold whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-panel-2">
              <td className="text-text px-[14px] py-2.5 text-left font-semibold">{r.type}</td>
              <td className="px-[14px] py-2.5 text-right whitespace-nowrap">{r.count}</td>
              <td className="px-[14px] py-2.5 text-right whitespace-nowrap">
                {r.in ? formatMoney(r.in, currency) : '·'}
              </td>
              <td className="px-[14px] py-2.5 text-right whitespace-nowrap">
                {r.out ? formatMoney(r.out, currency) : '·'}
              </td>
              <td
                className="relative px-[14px] py-2.5 text-right whitespace-nowrap"
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
            <td className="border-border text-text border-t px-[14px] py-2.5 text-left font-bold">
              Total
            </td>
            <td className="border-border border-t px-[14px] py-2.5 text-right font-bold whitespace-nowrap">
              {totalCount}
            </td>
            <td className="border-border border-t" />
            <td className="border-border border-t" />
            <td className="border-border text-good border-t px-[14px] py-2.5 text-right font-bold whitespace-nowrap">
              {formatMoney(netTotal, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
