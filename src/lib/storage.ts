import { DEFAULT_EXCLUDED_SENDERS, DEFAULT_EXCLUDED_TYPES, senderKey } from './aggregate'

const SETTINGS_KEY = 'statement-reader:settings'

type Settings = {
  excludedSenders: string[]
  excludedTypes: string[]
}

const defaults = (): Settings => ({
  excludedSenders: DEFAULT_EXCLUDED_SENDERS.map(senderKey),
  excludedTypes: [...DEFAULT_EXCLUDED_TYPES],
})

const strings = (v: unknown, fallback: string[]) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : fallback

const read = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults()
    const parsed = JSON.parse(raw) as Partial<Settings>
    const d = defaults()
    return {
      excludedSenders: strings(parsed.excludedSenders, d.excludedSenders),
      excludedTypes: strings(parsed.excludedTypes, d.excludedTypes),
    }
  } catch {
    return defaults()
  }
}

const write = (s: Settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export const loadExcludedSenders = () => new Set(read().excludedSenders)
export const loadExcludedTypes = () => new Set(read().excludedTypes)

export const saveExcludedSenders = (set: Set<string>) => {
  write({ ...read(), excludedSenders: [...set] })
}

export const saveExcludedTypes = (set: Set<string>) => {
  write({ ...read(), excludedTypes: [...set] })
}
