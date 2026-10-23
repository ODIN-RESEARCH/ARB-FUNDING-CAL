import React from 'react'
import { FundingCalculationResult, MT5CalculationResult } from '../types/calculator'
import { Scale } from 'lucide-react'

interface ArbitrageStatsBarProps {
  quoteResult: FundingCalculationResult
  mt5Result: MT5CalculationResult
  assetName: string
  symbol: string
}

export const ArbitrageStatsBar: React.FC<ArbitrageStatsBarProps> = ({
  quoteResult,
  mt5Result,
  assetName,
  symbol
}) => {
  const isShortHlProfitable = mt5Result.netCarryShortHlLongMt5 > 0
  const isLongHlProfitable = mt5Result.netCarryLongHlShortMt5 > 0
  const topEdge = Math.max(mt5Result.netCarryShortHlLongMt5, mt5Result.netCarryLongHlShortMt5)

  return (
    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
      {/* Metric 1: Live Premium */}
      <div className="p-2.5 rounded-lg bg-[#14161a] border border-[#272b35] flex flex-col justify-between interactive-card relative has-tooltip">
        <div className="text-[10px] text-[#8b949e] font-sans flex items-center justify-between">
          <span>Live Premium ({assetName})</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#20242c] text-gray-400">
            {quoteResult.isInsideFloor ? 'Floor Band' : 'Floating'}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-bold text-white">
            {quoteResult.premiumBps >= 0 ? '+' : ''}{quoteResult.premiumBps.toFixed(2)} bps
          </span>
          <span className="text-[10px] text-gray-500">
            ({quoteResult.premiumPrice >= 0 ? '+' : ''}{quoteResult.premiumPrice.toFixed(4)})
          </span>
        </div>
        {/* Tooltip Popup */}
        <div className="tooltip-popup absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e2229] border border-[#343a46] rounded-md shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
          <div className="font-bold text-white mb-0.5">Price Deviation</div>
          Hyperliquid Mark price vs Oracle price in basis points. 1 bps = 0.01% price spread.
        </div>
      </div>

      {/* Metric 2: Hyperliquid Funding APY */}
      <div className="p-2.5 rounded-lg bg-[#14161a] border border-[#272b35] flex flex-col justify-between interactive-card relative has-tooltip">
        <div className="text-[10px] text-[#8b949e] font-sans flex items-center justify-between">
          <span>HL Funding Rate</span>
          <span className="text-[9px] text-[#00e599]">
            {quoteResult.funding1hBps >= 0 ? '+' : ''}{quoteResult.funding1hBps.toFixed(3)} bps/1h
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-sm font-bold transition-colors ${quoteResult.fundingAnnualizedPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
            {quoteResult.fundingAnnualizedPct >= 0 ? '+' : ''}{quoteResult.fundingAnnualizedPct.toFixed(2)}%/yr
          </span>
          <span className="text-[10px] text-gray-500">
            {quoteResult.longsPayShorts ? 'Longs pay shorts' : 'Shorts pay longs'}
          </span>
        </div>
        {/* Tooltip Popup */}
        <div className="tooltip-popup absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-[#1e2229] border border-[#343a46] rounded-md shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
          <div className="font-bold text-[#00e599] mb-0.5">HL Perpetual Funding</div>
          Annualized continuous funding yield based on 8-hour rate. Inside floor (-4 to +6 bps), rate is fixed at 10.95%/yr.
        </div>
      </div>

      {/* Metric 3: MT5 Implied Swap Rate */}
      <div className="p-2.5 rounded-lg bg-[#14161a] border border-[#272b35] flex flex-col justify-between interactive-card relative has-tooltip">
        <div className="text-[10px] text-[#8b949e] font-sans flex items-center justify-between">
          <span>MT5 Swaps ({symbol})</span>
          <span className="text-[9px] text-[#c084fc]">
            Fair: {mt5Result.fairPremiumBps.toFixed(2)} bps
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-bold text-[#c084fc]">
            +{mt5Result.impliedAnnualRatePct.toFixed(2)}%/yr
          </span>
          <span className="text-[10px] text-gray-500">
            Markup: {mt5Result.brokerMarkupPct.toFixed(2)}%
          </span>
        </div>
        {/* Tooltip Popup */}
        <div className="tooltip-popup absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-[#1e2229] border border-[#343a46] rounded-md shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
          <div className="font-bold text-[#c084fc] mb-0.5">MT5 Interbank Carry</div>
          Implied interest differential = (Short Swap - Long Swap) / 2. Fair Premium is the exact break-even peg.
        </div>
      </div>

      {/* Metric 4: Net Delta-Neutral Carry Edge */}
      <div className={`p-2.5 rounded-lg border flex flex-col justify-between interactive-card relative has-tooltip transition-all duration-300 ${
        topEdge > 0
          ? 'bg-[#00e599]/10 border-[#00e599]/40 shadow-sm shadow-[#00e599]/10 animate-pulse-glow'
          : 'bg-[#14161a] border-[#272b35]'
      }`}>
        <div className="text-[10px] text-[#8b949e] font-sans flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold text-white">
            <Scale className={`w-3 h-3 ${topEdge > 0 ? 'text-[#00e599] animate-bounce' : 'text-gray-400'}`} />
            Net Carry Edge
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
            topEdge > 0 ? 'bg-[#00e599]/20 text-[#00e599]' : 'bg-gray-800 text-gray-400'
          }`}>
            {topEdge > 0 ? 'Profitable' : 'No Carry'}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-sm font-bold transition-all ${topEdge > 0 ? 'text-[#00e599] scale-105 origin-left' : 'text-gray-400'}`}>
            {topEdge > 0 ? `+${topEdge.toFixed(2)}%/yr` : '0.00%/yr'}
          </span>
          <span className="text-[10px] text-gray-400 truncate">
            {isShortHlProfitable
              ? 'Short HL + Long MT5'
              : isLongHlProfitable
              ? 'Long HL + Short MT5'
              : 'Neutral'}
          </span>
        </div>
        {/* Tooltip Popup */}
        <div className="tooltip-popup absolute bottom-full right-0 mb-2 w-56 p-2 bg-[#1e2229] border border-[#343a46] rounded-md shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
          <div className="font-bold text-[#00e599] mb-0.5">Net Delta-Neutral Yield</div>
          Total annual return from holding simultaneous opposing positions on Hyperliquid and MT5 with zero directional market risk.
        </div>
      </div>
    </div>
  )
}
