import { useMemo, useState } from 'react'

import type { SenderRow } from '../lib/dashboard'
import { initialsOf } from '../lib/dashboard'
import { formatMoney } from '../lib/format'

export const SenderPanel = ({
  senders,
  currency,
  excluded,
  onToggle,
  onAll,
  onNone,
}: {
  senders: SenderRow[]
  currency: string
  excluded: Set<string>
  onToggle: (key: string) => void
  onAll: () => void
  onNone: () => void
}) => {
  const [search, setSearch] = useState('')

  const max = Math.max(1, ...senders.map((s) => s.total))
  const included = senders.filter((s) => !excluded.has(s.key))
  const includedTotal = included.reduce((sum, s) => sum + s.total, 0)

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? senders.filter((s) => s.name.toLowerCase().includes(q)) : senders
  }, [senders, search])

  return (
    <section className="rounded-[16px] border border-border bg-panel px-6 py-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold tracking-tight">Who paid you</div>
          <div className="mt-1 text-[12.5px] text-muted">
            {included.length} of {senders.length} included ·{' '}
            <span className="font-mono text-[#c6cbd4]">{formatMoney(includedTotal, currency)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search senders"
            className="w-[170px] rounded-[9px] border border-border bg-panel-2 px-3 py-2 text-[13px] text-text outline-none transition-colors focus:border-accent"
          />
          <button
            onClick={onAll}
            className="rounded-lg border border-border bg-panel-2 px-[13px] py-2 text-xs font-medium text-[#aeb4c0] transition-colors hover:border-accent hover:text-text"
          >
            Select all
          </button>
          <button
            onClick={onNone}
            className="rounded-lg border border-border bg-panel-2 px-[13px] py-2 text-xs font-medium text-[#aeb4c0] transition-colors hover:border-danger hover:text-text"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex max-h-[420px] flex-col gap-px overflow-y-auto">
        {list.map((s) => {
          const on = !excluded.has(s.key)
          return (
            <div
              key={s.key}
              onClick={() => onToggle(s.key)}
              className={`flex cursor-pointer items-center gap-3.5 rounded-[10px] p-2.5 transition-colors hover:bg-[#1a1d23] ${
                on ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                  on ? 'border-[1.5px] border-accent bg-accent text-[#06120d]' : 'border-[1.5px] border-[#3a3f4b]'
                }`}
              >
                {on ? '✓' : ''}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1f232c] text-[11px] font-semibold text-[#aeb4c0]">
                {initialsOf(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-medium">{s.name}</span>
                  <span className="shrink-0 rounded-full bg-[#1a1d23] px-2 py-px text-[11px] text-muted">{s.count}</span>
                </div>
                <div className="mt-2 h-[5px] overflow-hidden rounded bg-[#16191f]">
                  <div
                    className="h-full rounded bg-linear-90 from-accent-dark to-accent-soft"
                    style={{ width: `${(s.total / max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="min-w-[88px] text-right font-mono text-sm font-medium">
                {formatMoney(s.total, currency)}
              </div>
            </div>
          )
        })}
        {!list.length ? <div className="px-2.5 py-6 text-sm text-muted">No senders match “{search}”.</div> : null}
      </div>
    </section>
  )
}
