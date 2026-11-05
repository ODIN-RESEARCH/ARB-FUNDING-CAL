export interface HyperliquidAsset {
  name: string
  dex?: string
  markPx: number
  oraclePx: number
  midPx: number
  funding: number // 1h rate from API (e.g. 0.0000080097)
  premium: number // premium index from API (e.g. 0.0004244482)
  impactPxs: [number, number]
  dayNtlVlm?: number
  openInterest?: number
  lastUpdated?: number
}

export type MarketTier = 'crypto' | 'tradfi' | 'fx'

export interface HLFundingParams {
  tier?: MarketTier // 'crypto' | 'tradfi' | 'fx'
  interestRate8hBps: number // standard: 1.0 bps (0.01%), or 0 for FX
  interestRateAnnualPct: number // 10.95% (crypto), 5.48% (tradfi), or 0.0% (FX)
  clampBps: number // 5.0 for crypto, 3.0 for tradfi/fx
  decayDivisor: number // 8 for crypto, 16 for tradfi/fx
  floorMinBps: number // default: -4.0 (crypto), -2.0 (tradfi), -3.0 (fx)
  floorMaxBps: number // default: +6.0 (crypto), +4.0 (tradfi), +3.0 (fx)
  hourlyCapBps: number // default: 400 bps (4%/h)
  multiplier: number // e.g. 0.5 for HIP-3 forex
}

export interface MT5SwapPreset {
  id: string
  label: string
  symbol: string
  assetName: string
  swapLongPoints: number
  swapShortPoints: number
  pointSize: number // e.g. 0.00001 for EURUSD, 0.001 for USDJPY, 0.01 for XAUUSD
  contractSize: number // standard lot, e.g. 100,000 for FX, 100 for Gold
  defaultPrice: number
}

export interface FundingCalculationResult {
  premiumPrice: number
  premiumBps: number
  isInsideFloor: boolean
  funding1hBps: number
  funding8hBps: number
  fundingAnnualizedBps: number
  fundingAnnualizedPct: number
  costPer10kHourly: number
  costPer10kDaily: number
  costPer10kAnnual: number
  longsPayShorts: boolean
  statusBadge: string
}

export interface MT5CalculationResult {
  annualizedLongPct: number
  annualizedShortPct: number
  impliedAnnualRatePct: number
  brokerMarkupPct: number
  fairPremiumBps: number
  fairPremiumPrice: number
  noCarryBandMinBps: number
  noCarryBandMaxBps: number
  premiumVsFairBps: number
  recommendation: 'SHORT_HL_LONG_MT5' | 'LONG_HL_SHORT_MT5' | 'NEUTRAL'
  recommendationText: string
  netCarryLongHlShortMt5: number // % per year
  netCarryShortHlLongMt5: number // % per year
}

export type RangeOption = 20 | 50 | 200
export type FundingUnit = 'yr' | '8h' | '1h'
export type PremiumUnit = 'bps' | 'price'
export type YRangeOption = 'auto' | 20 | 50 | 100 | 200

export interface ChartCurvePoint {
  premiumBps: number
  premiumPrice: number
  fundingPctYr: number
  fundingBps8h: number
  fundingBps1h: number
  isFloor: boolean
}
