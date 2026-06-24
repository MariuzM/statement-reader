export const panel = 'bg-panel border border-border rounded-card'

export const sectionTitle = 'text-base font-semibold tracking-tight'

export const btn =
  'bg-panel-2 text-text border border-border rounded-[10px] px-4 py-[9px] text-sm cursor-pointer transition-colors hover:border-accent'

export const btnSm =
  'bg-panel-2 text-text border border-border rounded-lg px-3 py-1.5 text-[13px] cursor-pointer transition-colors hover:border-accent'

export const chip = (active: boolean) =>
  `rounded-full border px-3.5 py-[7px] text-[13px] cursor-pointer transition-colors ${
    active
      ? 'bg-accent/20 border-accent text-text'
      : 'bg-panel-2 border-border text-muted hover:text-text'
  }`
