export type TaxYearConfig = {
  year: number
  expenseRate: number
  gpmFullRate: number
  gpmLowRate: number
  gpmLowThreshold: number
  gpmHighThreshold: number
  contribBaseFactor: number
  vsdRate: number
  vsdCeiling: number
  psdRate: number
  psdMinAnnual: number
}

const base = {
  expenseRate: 0.3,
  gpmFullRate: 0.15,
  gpmLowRate: 0.05,
  gpmLowThreshold: 20000,
  gpmHighThreshold: 35000,
  contribBaseFactor: 0.9,
  vsdRate: 0.1252,
  psdRate: 0.0698,
}

const LT_CONFIGS: Record<number, TaxYearConfig> = {
  2022: { ...base, year: 2022, vsdCeiling: 90246, psdMinAnnual: 611.33 },
  2023: { ...base, year: 2023, vsdCeiling: 101094, psdMinAnnual: 703.58 },
  2024: { ...base, year: 2024, vsdCeiling: 114162, psdMinAnnual: 773.94 },
  2025: { ...base, year: 2025, vsdCeiling: 126506, psdMinAnnual: 869.43 },
}

const LATEST_LT_YEAR = 2025

export const ltConfigForYear = (year: number): { config: TaxYearConfig; exact: boolean } => {
  const exact = LT_CONFIGS[year]
  if (exact) return { config: exact, exact: true }
  const fallback = LT_CONFIGS[LATEST_LT_YEAR] as TaxYearConfig
  return { config: { ...fallback, year }, exact: false }
}

export const effectiveGpmRate = (taxableProfit: number, cfg: TaxYearConfig) => {
  if (taxableProfit <= cfg.gpmLowThreshold) return cfg.gpmLowRate
  if (taxableProfit >= cfg.gpmHighThreshold) return cfg.gpmFullRate
  const span = cfg.gpmHighThreshold - cfg.gpmLowThreshold
  const ratio = (taxableProfit - cfg.gpmLowThreshold) / span
  return cfg.gpmLowRate + ratio * (cfg.gpmFullRate - cfg.gpmLowRate)
}

export type TaxBreakdown = {
  year: number
  exact: boolean
  config: TaxYearConfig
  grossRevenue: number
  expenses: number
  taxableProfit: number
  contribBase: number
  gpm: number
  gpmRate: number
  vsd: number
  vsdBase: number
  vsdCapped: boolean
  psd: number
  psdComputed: number
  psdAtMinimum: boolean
  incomeTax: number
  totalDue: number
  takeHome: number
  effectiveRate: number
}

export const computeLtTaxes = (years: { year: number; total: number }[]): TaxBreakdown[] => {
  const out: TaxBreakdown[] = []

  for (const { year, total } of years) {
    const { config, exact } = ltConfigForYear(year)
    const gross = total

    const expenses = gross * config.expenseRate
    const taxableProfit = Math.max(0, gross - expenses)

    const gpmRate = effectiveGpmRate(taxableProfit, config)
    const gpm = taxableProfit * gpmRate

    const contribBase = taxableProfit * config.contribBaseFactor
    const vsdBase = Math.min(contribBase, config.vsdCeiling)
    const vsd = vsdBase * config.vsdRate

    const psdComputed = contribBase * config.psdRate
    const psd = Math.max(psdComputed, config.psdMinAnnual)

    const incomeTax = gpm + vsd + psd
    const totalDue = incomeTax
    const takeHome = gross - totalDue

    out.push({
      year,
      exact,
      config,
      grossRevenue: gross,
      expenses,
      taxableProfit,
      contribBase,
      gpm,
      gpmRate,
      vsd,
      vsdBase,
      vsdCapped: contribBase > config.vsdCeiling,
      psd,
      psdComputed,
      psdAtMinimum: psd > psdComputed,
      incomeTax,
      totalDue,
      takeHome,
      effectiveRate: gross > 0 ? totalDue / gross : 0,
    })
  }

  return out.sort((a, b) => b.year - a.year)
}
