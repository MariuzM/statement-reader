import { useEffect } from 'react'

export const Modal = ({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) => {
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
        className="rounded-card border-border bg-panel flex max-h-[82vh] w-full max-w-[720px] flex-col border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-border flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {subtitle ? <p className="text-muted mt-0.5 text-[13px]">{subtitle}</p> : null}
          </div>
          <button
            className="border-border bg-panel-2 text-muted hover:border-accent hover:text-text shrink-0 rounded-lg border px-2.5 py-1 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
