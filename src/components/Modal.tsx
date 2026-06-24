import { useEffect } from 'react'

type Props = {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}

export const Modal = ({ title, subtitle, onClose, children }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-card border-border bg-panel flex h-[85vh] w-full max-w-[880px] flex-col border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-border flex items-start justify-between gap-3 border-b px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            {subtitle ? <p className="text-muted mt-0.5 text-sm">{subtitle}</p> : null}
          </div>
          <button
            className="border-border bg-panel-2 text-muted hover:border-accent hover:text-text shrink-0 rounded-lg border px-2.5 py-1 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
