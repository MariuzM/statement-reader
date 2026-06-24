export type Transaction = {
  type: string
  typeKey: string
  description: string
  amount: number
  fee: number
  currency: string
  state: string
  date: Date
  year: number
  month: number
}

export type MonthlyEarnings = {
  total: number
  count: number
}

export type YearlyEarnings = {
  year: number
  total: number
  count: number
  months: MonthlyEarnings[]
}

export type EarningsReport = {
  currency: string
  currencies: string[]
  years: YearlyEarnings[]
  grandTotal: number
  grandCount: number
  bestMonth: { year: number; month: number; total: number } | null
}
