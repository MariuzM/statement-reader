import { useRef, useState } from 'react'

export const Dropzone = ({ onFile, busy }: { onFile: (name: string, text: string) => void; busy: boolean }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const text = await file.text()
    onFile(file.name, text)
  }

  return (
    <div
      className={`cursor-pointer rounded-card border-2 border-dashed bg-panel px-6 py-14 text-center transition-all hover:border-accent hover:bg-panel-2 ${
        over ? 'scale-[1.01] border-accent bg-panel-2' : 'border-border'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        void handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-accent text-[28px] leading-[56px] text-white">↑</div>
      <div className="text-lg font-semibold">{busy ? 'Reading…' : 'Drop your statement CSV here'}</div>
      <div className="mt-1.5 text-sm text-muted">or click to choose a file · Revolut export format</div>
    </div>
  )
}
