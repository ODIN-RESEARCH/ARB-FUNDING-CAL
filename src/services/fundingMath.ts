import {
  HLFundingParams,
  MarketTier,
  FundingCalculationResult,
  MT5CalculationResult,
  ChartCurvePoint,
  MT5SwapPreset
} from '../types/calculator'

/**
 * Hyperliquid Funding Engine Parameter Tiers:
 * 1. Crypto / Main DEX: Interest rate 1 bps / 8h (10.95%/yr), Clamp ±5 bps, Band -4 to +6 bps, 8h decay.
 * 2. xyz TradFi (Commodities, Equities, Indices): Interest rate 1 bps / 8h (5.48%/yr), Clamp ±3 bps, Band -2 to +4 bps, 16h decay.
 * 3. xyz FX Pairs (JPY, EUR, GBP): Interest rate 0 bps / 8h (0.00%/yr), Clamp ±3 bps, Zero band -3 to +3 bps, 16h decay.
 */
export const MARKET_TIER_PARAMS: Record<MarketTier, HLFundingParams> = {
  fx: {
    tier: 'fx',
    interestRate8hBps: 0.0,
    interestRateAnnualPct: 0.0,
    clampBps: 3.0,
    decayDivisor: 16.0,
    floorMinBps: -3.0,
    floorMaxBps: 3.0,
    hourlyCapBps: 400.0,
    multiplier: 1.0
  },
  tradfi: {
    tier: 'tradfi',
    interestRate8hBps: 1.0,
    interestRateAnnualPct: 5.475, // (1.0 / 16) * 24 * 365 / 100
    clampBps: 3.0,
    decayDivisor: 16.0,
    floorMinBps: -2.0,
    floorMaxBps: 4.0,
    hourlyCapBps: 400.0,
    multiplier: 1.0
  },
  crypto: {
    tier: 'crypto',
    interestRate8hBps: 1.0,
    interestRateAnnualPct: 10.95, // (1.0 / 8) * 24 * 365 / 100
    clampBps: 5.0,
    decayDivisor: 8.0,
    floorMinBps: -4.0,
    floorMaxBps: 6.0,
    hourlyCapBps: 400.0,
    multiplier: 1.0
  }
}

// Default to FX tier since xyz:EUR / xyz:JPY are the primary forex carry arbitrage pairs
export const DEFAULT_HL_PARAMS: HLFundingParams = MARKET_TIER_PARAMS.fx

/**
 * Auto-detects the market tier from asset symbol/name.
 */
export function detectMarketTier(assetName: string): MarketTier {
  const upper = assetName.toUpperCase()
  const clean = upper.replace('XYZ:', '').replace('/', '').trim()

  const fxCurrencies = new Set([
    'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD',
    'EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'
  ])
  if (fxCurrencies.has(clean)) {
    return 'fx'
  }

  if (upper.startsWith('XYZ:') || upper.startsWith('KW:') || upper.startsWith('MKTS:') || upper.startsWith('CASH:') || upper.startsWith('PARA:')) {
    return 'tradfi'
  }

  const tradfiAssets = new Set([
    'GOLD', 'XAU', 'SILVER', 'XAG', 'OIL', 'COPPER',
    'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META',
    'SPX', 'SPY', 'QQQ', 'NDX', 'DJI', 'JP225', 'US500', 'US30', 'NAS100', 'DAX', 'GER40', 'UK100', 'NIKKEI'
  ])
  if (tradfiAssets.has(clean)) {
    return 'tradfi'
  }

  return 'crypto'
}

/**
 * Returns calibrated parameters for any asset.
 */
export function getParamsForAsset(assetName: string): HLFundingParams {
  const tier = detectMarketTier(assetName)
  return MARKET_TIER_PARAMS[tier]
}

/**
 * Calculates Hyperliquid perp funding rate given a premium in basis points.
 * Implements the piecewise funding curve:
 * - If inside floor [floorMinBps, floorMaxBps]: funding = interestRate / decayDivisor
 * - If above floor (> floorMaxBps): funding = (P - clampBps) / decayDivisor
 * - If below floor (< floorMinBps): funding = (P + clampBps) / decayDivisor
 */
export function calculateHLFundingFromPremiumBps(
  premiumBps: number,
  params: HLFundingParams = DEFAULT_HL_PARAMS
): {
  isInsideFloor: boolean
  funding8hBps: number
  funding1hBps: number
  fundingAnnualizedPct: number
  fundingAnnualizedBps: number
} {
  const {
    floorMinBps = -3.0,
    floorMaxBps = 3.0,
    hourlyCapBps = 400.0,
    interestRate8hBps = 0.0,
    clampBps = 3.0,
    decayDivisor = 16.0
  } = params

  let funding1hBps: number
  let isInsideFloor = false

  if (premiumBps >= floorMinBps && premiumBps <= floorMaxBps) {
    // Inside the zero-slope floor band
    isInsideFloor = true
    funding1hBps = interestRate8hBps / decayDivisor
  } else if (premiumBps > floorMaxBps) {
    // Above floor: slope 1/divisor from clamp
    funding1hBps = (premiumBps - clampBps) / decayDivisor
  } else {
    // Below floor: slope 1/divisor from clamp
    funding1hBps = (premiumBps + clampBps) / decayDivisor
  }

  // Apply hourly cap
  if (funding1hBps > hourlyCapBps) funding1hBps = hourlyCapBps
  if (funding1hBps < -hourlyCapBps) funding1hBps = -hourlyCapBps

  // Recalculate 8h and annualized from capped 1h
  const funding8hBps = funding1hBps * 8.0
  const fundingAnnualizedBps = funding1hBps * 24.0 * 365.0
  const fundingAnnualizedPct = fundingAnnualizedBps / 100.0

  return {
    isInsideFloor,
    funding8hBps,
    funding1hBps,
    fundingAnnualizedPct,
    fundingAnnualizedBps
  }
}

/**
 * Inverts an annualized funding percentage to find the exact corresponding premium in bps.
 * Inverse of calculateHLFundingFromPremiumBps.
 */
export function invertFundingPctToPremiumBps(
  fundingPct: number,
  params: HLFundingParams = DEFAULT_HL_PARAMS
): number {
  const {
    interestRate8hBps = 0.0,
    clampBps = 3.0,
    decayDivisor = 16.0,
    floorMinBps = -3.0,
    floorMaxBps = 3.0
  } = params

  // 1h bps = annualizedPct * 100 / (24 * 365) = annualizedPct / 87.6
  const target1hBps = fundingPct / 87.6
  const flat1hBps = interestRate8hBps / decayDivisor

  if (Math.abs(target1hBps - flat1hBps) < 1e-8) {
    return (floorMinBps + floorMaxBps) / 2.0
  } else if (target1hBps > flat1hBps) {
    // F_1h = (P - clamp) / divisor => P = F_1h * divisor + clamp
    return target1hBps * decayDivisor + clampBps
  } else {
    // F_1h = (P + clamp) / divisor => P = F_1h * divisor - clamp
    return target1hBps * decayDivisor - clampBps
  }
}

/**
 * Full quote calculation from Mark & Oracle prices.
 */
export function calculateQuote(
  markPrice: number,
  oraclePrice: number,
  params: HLFundingParams = DEFAULT_HL_PARAMS
): FundingCalculationResult {
  const premiumPrice = markPrice - oraclePrice
  const premiumBps = oraclePrice > 0 ? (premiumPrice / oraclePrice) * 10000 : 0

  const { isInsideFloor, funding8hBps, funding1hBps, fundingAnnualizedPct, fundingAnnualizedBps } =
    calculateHLFundingFromPremiumBps(premiumBps, params)

  // Per $10k notional costs
  // 1 bps = 0.0001. On $10,000 notional, 1 bps = $1.00.
  // 0.125 bps = $0.125.
  const costPer10kHourly = 10000 * (funding1hBps / 10000)
  const costPer10kDaily = costPer10kHourly * 24
  const costPer10kAnnual = costPer10kHourly * 24 * 365

  const longsPayShorts = funding1hBps >= 0

  let statusBadge = ''
  if (isInsideFloor) {
    statusBadge = '▲ Longs pay shorts · floor'
  } else if (funding1hBps > 0) {
    statusBadge = '▲ Longs pay shorts'
  } else if (funding1hBps < 0) {
    statusBadge = '▼ Shorts pay longs'
  } else {
    statusBadge = '● Neutral (0 bps)'
  }

  return {
    premiumPrice,
    premiumBps,
    isInsideFloor,
    funding1hBps,
    funding8hBps,
    fundingAnnualizedBps,
    fundingAnnualizedPct,
    costPer10kHourly,
    costPer10kDaily,
    costPer10kAnnual,
    longsPayShorts,
    statusBadge
  }
}

/**
 * Calculates MT5 swap metrics and fair value comparison against Hyperliquid.
 */
export function calculateMT5FairValue(
  swapLongPoints: number,
  swapShortPoints: number,
  pointSize: number,
  oraclePrice: number,
  livePremiumBps: number,
  params: HLFundingParams = DEFAULT_HL_PARAMS
): MT5CalculationResult {
  const safeOracle = oraclePrice > 0 ? oraclePrice : 1.0

  // Annualized long & short swap percentage
  // swap * pointSize is the daily swap cashflow per 1 unit of base asset
  const dailyLongDollar = swapLongPoints * pointSize
  const dailyShortDollar = swapShortPoints * pointSize

  const annualizedLongPct = (dailyLongDollar / safeOracle) * 365 * 100
  const annualizedShortPct = (dailyShortDollar / safeOracle) * 365 * 100

  // Implied annual rate = (short swap - long swap) / 2
  const impliedAnnualRatePct = (annualizedShortPct - annualizedLongPct) / 2

  // Broker markup = (-long swap - short swap) / 2
  const brokerMarkupPct = (-annualizedLongPct - annualizedShortPct) / 2

  // Calculate Fair Premium (where HL funding = Implied Annual Rate)
  // Inverse of calculateHLFundingFromPremiumBps
  const fairPremiumBps = invertFundingPctToPremiumBps(impliedAnnualRatePct, params)
  const fairPremiumPrice = (fairPremiumBps / 10000) * safeOracle

  // No-carry band: range where neither hedge earns positive carry:
  // HL funding is between short swap (+annualizedShortPct) and minus long swap (-annualizedLongPct)
  const b1 = invertFundingPctToPremiumBps(annualizedShortPct, params)
  const b2 = invertFundingPctToPremiumBps(-annualizedLongPct, params)
  const noCarryBandMinBps = Math.min(b1, b2)
  const noCarryBandMaxBps = Math.max(b1, b2)

  const premiumVsFairBps = livePremiumBps - fairPremiumBps

  // Strategies net carry:
  // Strategy 1: Long HL, Short MT5
  // HL cost: -fundingAnnualizedPct
  // MT5 earn: +annualizedShortPct
  // Strategy 2: Short HL, Long MT5
  // HL earn: +fundingAnnualizedPct
  // MT5 cost: +annualizedLongPct (note annualizedLongPct is typically negative)
  const hlFunding = calculateHLFundingFromPremiumBps(livePremiumBps, params).fundingAnnualizedPct
  const netCarryLongHlShortMt5 = -hlFunding + annualizedShortPct
  const netCarryShortHlLongMt5 = hlFunding + annualizedLongPct

  let recommendation: 'SHORT_HL_LONG_MT5' | 'LONG_HL_SHORT_MT5' | 'NEUTRAL'
  let recommendationText: string

  if (livePremiumBps > noCarryBandMaxBps) {
    recommendation = 'SHORT_HL_LONG_MT5'
    recommendationText = 'Short HL / long MT5 earns carry'
  } else if (livePremiumBps < noCarryBandMinBps) {
    recommendation = 'LONG_HL_SHORT_MT5'
    recommendationText = 'Long HL / short MT5 earns carry'
  } else {
    recommendation = 'NEUTRAL'
    recommendationText = 'Within no-carry band (no edge)'
  }

  return {
    annualizedLongPct,
    annualizedShortPct,
    impliedAnnualRatePct,
    brokerMarkupPct,
    fairPremiumBps,
    fairPremiumPrice,
    noCarryBandMinBps,
    noCarryBandMaxBps,
    premiumVsFairBps,
    recommendation,
    recommendationText,
    netCarryLongHlShortMt5,
    netCarryShortHlLongMt5
  }
}

/**
 * Generates the curve points for the interactive SVG chart.
 */
export function generateChartPoints(
  rangeBps: number,
  oraclePrice: number,
  params: HLFundingParams = DEFAULT_HL_PARAMS,
  steps: number = 300
): ChartCurvePoint[] {
  const points: ChartCurvePoint[] = []
  const minBps = -rangeBps
  const maxBps = rangeBps
  const stepSize = (maxBps - minBps) / steps

  for (let i = 0; i <= steps; i++) {
    const pBps = minBps + i * stepSize
    const pPrice = (pBps / 10000) * oraclePrice
    const res = calculateHLFundingFromPremiumBps(pBps, params)

    points.push({
      premiumBps: pBps,
      premiumPrice: pPrice,
      fundingPctYr: res.fundingAnnualizedPct,
      fundingBps8h: res.funding8hBps,
      fundingBps1h: res.funding1hBps,
      isFloor: res.isInsideFloor
    })
  }

  return points
}

export const POPULAR_MT5_PRESETS: MT5SwapPreset[] = [
  {
    id: 'EURUSD',
    label: 'EUR · EURUSD (IC Markets)',
    symbol: 'EURUSD',
    assetName: 'xyz:EUR',
    swapLongPoints: -8.00,
    swapShortPoints: 1.30,
    pointSize: 0.00001,
    contractSize: 100000,
    defaultPrice: 1.1154
  },
  {
    id: 'USDJPY',
    label: 'JPY · USDJPY (IC Markets)',
    symbol: 'USDJPY',
    assetName: 'xyz:JPY',
    swapLongPoints: 8.20,
    swapShortPoints: -17.00,
    pointSize: 0.001,
    contractSize: 100000,
    defaultPrice: 157.48
  },
  {
    id: 'GBPUSD',
    label: 'GBP · GBPUSD (IC Markets)',
    symbol: 'GBPUSD',
    assetName: 'xyz:GBP',
    swapLongPoints: -4.50,
    swapShortPoints: 0.95,
    pointSize: 0.00001,
    contractSize: 100000,
    defaultPrice: 1.3050
  },
  {
    id: 'XAUUSD',
    label: 'GOLD · XAUUSD',
    symbol: 'XAUUSD',
    assetName: 'xyz:GOLD',
    swapLongPoints: -68.50,
    swapShortPoints: 24.20,
    pointSize: 0.01,
    contractSize: 100,
    defaultPrice: 4165.80
  },
  {
    id: 'XAGUSD',
    label: 'SILVER · XAGUSD',
    symbol: 'XAGUSD',
    assetName: 'xyz:SILVER',
    swapLongPoints: -12.10,
    swapShortPoints: 4.80,
    pointSize: 0.001,
    contractSize: 5000,
    defaultPrice: 31.50
  },
  {
    id: 'AUDUSD',
    label: 'AUD · AUDUSD',
    symbol: 'AUDUSD',
    assetName: 'xyz:AUD',
    swapLongPoints: -3.80,
    swapShortPoints: 0.60,
    pointSize: 0.00001,
    contractSize: 100000,
    defaultPrice: 0.6720
  },
  {
    id: 'USDCAD',
    label: 'CAD · USDCAD',
    symbol: 'USDCAD',
    assetName: 'xyz:CAD',
    swapLongPoints: -4.20,
    swapShortPoints: 0.85,
    pointSize: 0.00001,
    contractSize: 100000,
    defaultPrice: 1.3850
  },
  {
    id: 'USDCHF',
    label: 'CHF · USDCHF',
    symbol: 'USDCHF',
    assetName: 'xyz:CHF',
    swapLongPoints: 3.10,
    swapShortPoints: -7.60,
    pointSize: 0.00001,
    contractSize: 100000,
    defaultPrice: 0.8650
  },
  {
    id: 'US500',
    label: 'SP500 · US500 (S&P CFD)',
    symbol: 'US500',
    assetName: 'xyz:SP500',
    swapLongPoints: -14.50,
    swapShortPoints: 2.10,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 7802.90
  },
  {
    id: 'US100',
    label: 'XYZ100 · US100 (Nasdaq CFD)',
    symbol: 'US100',
    assetName: 'xyz:XYZ100',
    swapLongPoints: -22.40,
    swapShortPoints: 3.60,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 20450.00
  },
  {
    id: 'JP225',
    label: 'JP225 · JP225 (Nikkei CFD)',
    symbol: 'JP225',
    assetName: 'xyz:JP225',
    swapLongPoints: -11.238,
    swapShortPoints: -6.743,
    pointSize: 1.0,
    contractSize: 1,
    defaultPrice: 59179.00
  },
  {
    id: 'USOIL',
    label: 'CL · USOIL (WTI Crude)',
    symbol: 'USOIL',
    assetName: 'xyz:CL',
    swapLongPoints: -8.50,
    swapShortPoints: 1.40,
    pointSize: 0.01,
    contractSize: 100,
    defaultPrice: 71.50
  },
  {
    id: 'BTCUSD',
    label: 'BTC · BTCUSD (MT5 CFD)',
    symbol: 'BTCUSD',
    assetName: 'BTC',
    swapLongPoints: -466.44,
    swapShortPoints: 77.15,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 64002.00
  },
  {
    id: 'ETHUSD',
    label: 'ETH · ETHUSD (MT5 CFD)',
    symbol: 'ETHUSD',
    assetName: 'ETH',
    swapLongPoints: -10.50,
    swapShortPoints: 1.80,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 2600.00
  },
  {
    id: 'SOLUSD',
    label: 'SOL · SOLUSD (MT5 CFD)',
    symbol: 'SOLUSD',
    assetName: 'SOL',
    swapLongPoints: -4.20,
    swapShortPoints: 0.80,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 155.00
  },
  {
    id: 'NVDA',
    label: 'NVDA · NVDA (Stock CFD)',
    symbol: 'NVDA',
    assetName: 'xyz:NVDA',
    swapLongPoints: -3.80,
    swapShortPoints: 0.50,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 135.00
  },
  {
    id: 'TSLA',
    label: 'TSLA · TSLA (Stock CFD)',
    symbol: 'TSLA',
    assetName: 'xyz:TSLA',
    swapLongPoints: -4.50,
    swapShortPoints: 0.60,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 220.00
  },
  {
    id: 'AAPL',
    label: 'AAPL · AAPL (Stock CFD)',
    symbol: 'AAPL',
    assetName: 'xyz:AAPL',
    swapLongPoints: -2.90,
    swapShortPoints: 0.40,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 230.00
  },
  {
    id: 'DRAM',
    label: 'DRAM · DRAM (Stock CFD)',
    symbol: 'DRAM',
    assetName: 'xyz:DRAM',
    swapLongPoints: -1.80,
    swapShortPoints: 0.25,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 95.00
  },
  {
    id: 'EBAY',
    label: 'EBAY · EBAY (Stock CFD)',
    symbol: 'EBAY',
    assetName: 'xyz:EBAY',
    swapLongPoints: -1.50,
    swapShortPoints: 0.20,
    pointSize: 0.01,
    contractSize: 1,
    defaultPrice: 65.00
  }
]

/**
 * Automatically finds or creates the matching MT5 hedge for any Hyperliquid asset.
 */
export function findOrCreateMt5Hedge(
  assetName: string,
  assetPrice: number,
  existingPresets: MT5SwapPreset[]
): { preset: MT5SwapPreset; isNew: boolean } {
  // Strip dex prefix e.g. "xyz:EUR" -> "EUR", "cash:BTC" -> "BTC", "BTC" -> "BTC"
  const cleanTicker = assetName.includes(':') ? assetName.split(':')[1] : assetName
  const upperTicker = cleanTicker.toUpperCase()

  // 1. Check if an existing preset already matches the exact assetName or cleanTicker
  const exactMatch = existingPresets.find(
    (p) =>
      p.assetName.toLowerCase() === assetName.toLowerCase() ||
      p.id.toLowerCase() === upperTicker.toLowerCase() ||
      p.symbol.toLowerCase() === upperTicker.toLowerCase()
  )
  if (exactMatch) return { preset: exactMatch, isNew: false }

  // 2. Ticker alias mappings
  const tickerAliases: Record<string, string> = {
    EUR: 'EURUSD',
    GBP: 'GBPUSD',
    JPY: 'USDJPY',
    GOLD: 'XAUUSD',
    SILVER: 'XAGUSD',
    AUD: 'AUDUSD',
    CAD: 'USDCAD',
    CHF: 'USDCHF',
    NZD: 'NZDUSD',
    BTC: 'BTCUSD',
    ETH: 'ETHUSD',
    SOL: 'SOLUSD',
    DOGE: 'DOGEUSD',
    SUI: 'SUIUSD',
    AVAX: 'AVAXUSD',
    LINK: 'LINKUSD',
    BNB: 'BNBUSD',
    ADA: 'ADAUSD',
    XRP: 'XRPUSD',
    LTC: 'LTCUSD',
    NEAR: 'NEARUSD',
    APT: 'APTUSD',
    ARB: 'ARBUSD',
    OP: 'OPUSD',
    MATIC: 'MATICUSD',
    TIA: 'TIAUSD',
    INJ: 'INJUSD',
    ATOM: 'ATOMUSD',
    SP500: 'US500',
    USA500: 'US500',
    XYZ100: 'US100',
    USTECH: 'US100',
    JP225: 'JP225',
    CL: 'USOIL',
    WTI: 'USOIL',
    BRENTOIL: 'USOIL',
    NATGAS: 'USOIL',
    COPPER: 'COPPER'
  }

  const aliasTarget = tickerAliases[upperTicker]
  if (aliasTarget) {
    const aliasMatch = existingPresets.find(
      (p) => p.id.toUpperCase() === aliasTarget || p.symbol.toUpperCase() === aliasTarget
    )
    if (aliasMatch) return { preset: aliasMatch, isNew: false }
  }

  // 3. Synthesize an MT5 hedge preset for this instrument
  const isCrypto = !assetName.includes(':') // Native Hyperliquid perps are crypto
  const isIndex = upperTicker.includes('JP225') || upperTicker.includes('NIKKEI') || upperTicker.includes('US500') || upperTicker.includes('US100')
  const isMicro = assetPrice < 2.0 && assetPrice > 0
  const isHighValue = assetPrice > 500
  const pointSize = isIndex ? 1.0 : isMicro ? 0.00001 : isHighValue ? 0.1 : 0.01
  const contractSize = isMicro ? 100000 : 1

  const safePrice = assetPrice > 0 ? assetPrice : 100
  // Benchmark financing: long -6.5%/yr, short +1.2%/yr
  const dailyLongCost = (safePrice * 0.065) / 365
  const dailyShortEarn = (safePrice * 0.012) / 365
  const swapLongPoints = -(dailyLongCost / pointSize)
  const swapShortPoints = +(dailyShortEarn / pointSize)

  const mt5Symbol = isCrypto ? `${upperTicker}USD` : upperTicker

  const newPreset: MT5SwapPreset = {
    id: upperTicker,
    label: `${upperTicker} · ${mt5Symbol} (MT5 CFD)`,
    symbol: mt5Symbol,
    assetName: assetName,
    swapLongPoints: parseFloat(swapLongPoints.toFixed(2)),
    swapShortPoints: parseFloat(swapShortPoints.toFixed(2)),
    pointSize,
    contractSize,
    defaultPrice: safePrice
  }

  return { preset: newPreset, isNew: true }
}

