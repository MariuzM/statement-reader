type Props = {
  label: string
  value: string
  hint?: string
  tone?: 'muted' | 'good' | 'danger'
  strong?: boolean
}

export const TaxRow = ({ label, value, hint, tone, strong }: Props) => {
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
