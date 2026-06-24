import { useState } from 'react'

import type { ChartMode, Hero } from '../lib/dashboard'
import { formatCompact, formatMoney } from '../lib/format'

const LINE_COLORS = ['#35d39a', '#60a5fa', '#f59e0b', '#a78bfa', '#f472b6', '#2dd4bf']

const colorFor = (i: number, n: number) => LINE_COLORS[(n - 1 - i) % LINE_COLORS.length] ?? '#35d39a'

const MODES: { key: ChartMode; label: string }[] = [
  { key: 'cumulative', label: 'Cumulative' },
  { key: 'byMonth', label: 'By month' },
]

export const DashboardHero = ({
  total,
  currency,
  delta,
  hero,
  mode,
  onMode,
}: {
  total: number
  currency: string
  delta: { label: string; up: boolean } | null
  hero: Hero
  mode: ChartMode
  onMode: (m: ChartMode) => void
}) => {
  const [hovered, setHovered] = useState<number | null>(null)

  const yLabels = [
    formatCompact(hero.max, currency),
    formatCompact((hero.max * 2) / 3, currency),
    formatCompact(hero.max / 3, currency),
    formatCompact(0, currency),
  ]

  return (
    <section className="rounded-[16px] border border-border bg-panel px-[26px] py-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.04em] text-muted">Total earnings</div>
          <div className="mt-[9px] flex items-center gap-3">
            <span className="font-mono text-[38px] font-semibold tracking-[-0.02em] text-accent-soft">
              {formatMoney(total, currency)}
            </span>
            {delta ? (
              <span
                className={`rounded-[7px] px-[9px] py-[3px] font-mono text-xs font-semibold ${
                  delta.up ? 'bg-accent/[0.14] text-accent-soft' : 'bg-danger/[0.14] text-danger'
                }`}
              >
                {delta.label} YoY
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-[3px] rounded-[10px] border border-border bg-panel-2 p-[3px]">
          {MODES.map((m) => {
            const active = mode === m.key
            return (
              <button
                key={m.key}
                onClick={() => onMode(m.key)}
                className={`rounded-[7px] px-[15px] py-1.5 text-[12.5px] font-medium transition-colors ${
                  active ? 'bg-border text-text' : 'text-muted hover:text-text'
                }`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-[22px] flex gap-3.5">
        <div className="flex h-[240px] w-[46px] shrink-0 flex-col justify-between py-1.5 text-right font-mono text-[10.5px] text-subtle">
          {yLabels.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <svg viewBox="0 0 1000 260" preserveAspectRatio="none" className="block h-[240px] w-full overflow-visible">
            <defs>
              <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.34" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[14, 93, 172].map((yy) => (
              <line key={yy} x1="0" y1={yy} x2="1000" y2={yy} stroke="#1d2128" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1="0" y1="251" x2="1000" y2="251" stroke="#262b38" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {hero.isCumulative ? (
              <>
                {hero.areaPath ? <path d={hero.areaPath} fill="url(#heroArea)" /> : null}
                <polyline
                  points={hero.linePoints}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            ) : (
              hero.lines.map((ln, i) => {
                const dim = hovered !== null && hovered !== ln.year
                return (
                  <g key={ln.year}>
                    <polyline
                      points={ln.points}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      vectorEffect="non-scaling-stroke"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHovered(ln.year)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    <polyline
                      points={ln.points}
                      fill="none"
                      stroke={colorFor(i, hero.lines.length)}
                      strokeWidth={hovered === ln.year ? 3.5 : 2.5}
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{
                        opacity: dim ? 0.18 : 1,
                        pointerEvents: 'none',
                        transition: 'opacity .15s, stroke-width .15s',
                      }}
                    />
                  </g>
                )
              })
            )}
          </svg>
          <div className="mt-2.5 flex justify-between font-mono text-[10.5px] text-subtle">
            {hero.xLabels.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-[18px] pl-[60px]">
        {hero.legend.map((lg, i) => {
          const color = lg.year != null ? colorFor(i, hero.legend.length) : 'var(--color-accent)'
          const dim = hovered !== null && lg.year !== hovered
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-muted transition-opacity"
              style={{ opacity: dim ? 0.35 : 1, cursor: lg.year != null ? 'pointer' : 'default' }}
              onMouseEnter={() => lg.year != null && setHovered(lg.year)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: color }} />
              {lg.label}
              <span className="font-mono font-medium text-text">{formatMoney(lg.amount, currency)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
