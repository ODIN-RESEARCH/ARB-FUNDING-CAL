import React from 'react'
import { HyperliquidAsset, FundingCalculationResult } from '../types/calculator'
import { RotateCcw } from 'lucide-react'
import { SearchableAssetDropdown } from './SearchableAssetDropdown'

interface QuoteCalculatorProps {
  currentAsset: HyperliquidAsset | null
  assetList: HyperliquidAsset[]
  selectedAssetName: string
  onSelectAsset: (name: string) => void
  customDex: string
  onChangeCustomDex: (dex: string) => void
  onLoadCustomDex: () => void
  markPriceInput: string
  onChangeMarkPrice: (val: string) => void
  oraclePriceInput: string
  onChangeOraclePrice: (val: string) => void
  onResetToLive: () => void
  isModified: boolean
  quoteResult: FundingCalculationResult
  isLoading: boolean
}

export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({
  currentAsset,
  assetList,
  selectedAssetName,
  onSelectAsset,
  customDex,
  onChangeCustomDex,
  onLoadCustomDex,
  markPriceInput,
  onChangeMarkPrice,
  oraclePriceInput,
  onChangeOraclePrice,
  onResetToLive,
  isModified,
  quoteResult,
  isLoading
}) => {
  // Format numbers nicely
  const formatBps = (val: number, decimals: number = 3) => {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(decimals)} bps`
  }

  const formatPct = (val: number) => {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(2)}%`
  }

  const formatDollar = (val: number) => {
    const sign = val >= 0 ? '+' : '−'
    return `${sign}$${Math.abs(val).toFixed(3)}`
  }

  // Format API funding if available
  const apiFunding1hBps = currentAsset ? currentAsset.funding * 10000 : null
  const apiPremiumBps = currentAsset ? currentAsset.premium * 10000 : null

  return (
    <div className="bg-[#181a1f] border border-[#272b35] rounded-lg p-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-[#272b35] pb-2">
        <h2 className="text-sm font-sans font-bold text-white tracking-wide">
          Quote calculator
        </h2>
        {isModified && (
          <button
            onClick={onResetToLive}
            title="Reset to live API prices"
            className="flex items-center gap-1 text-[11px] text-[#00e599] hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to live
          </button>
        )}
      </div>

      {/* Asset selector */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] text-[#8b949e] font-sans">
            Live prices (Hyperliquid)
          </label>
          <span className="text-[10px] text-gray-500 font-mono">
            {assetList.length} pairs active
          </span>
        </div>
        <SearchableAssetDropdown
          assets={assetList}
          selectedAssetName={selectedAssetName}
          onSelectAsset={onSelectAsset}
        />
      </div>

      {/* Optional custom HIP-3 dex input */}
      <div className="mb-3">
        <label className="block text-[11px] text-[#8b949e] font-sans mb-1">
          Additional HIP-3 DEX (optional; 370+ TradFi & Crypto pairs active)
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="e.g. km, cash, para, mkts"
            value={customDex}
            onChange={(e) => onChangeCustomDex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onLoadCustomDex()
            }}
            className="flex-1 bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:border-[#00e599]"
          />
          <button
            onClick={onLoadCustomDex}
            disabled={isLoading || !customDex.trim()}
            className="px-2.5 py-1 bg-[#252830] hover:bg-[#2d3139] border border-[#272b35] rounded text-white text-[11px] disabled:opacity-40 transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {/* Mark Price & Oracle Price inputs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="relative has-tooltip">
          <label className="block text-[11px] text-[#8b949e] font-sans mb-1 cursor-help border-b border-dotted border-gray-700 inline-block">
            Mark price
          </label>
          <div className="tooltip-popup absolute bottom-full left-0 mb-1 w-44 p-2 bg-[#1e2229] border border-[#343a46] rounded shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
            Hyperliquid perpetual mark price from depth impact orders.
          </div>
          <input
            type="number"
            step="any"
            value={markPriceInput}
            onChange={(e) => onChangeMarkPrice(e.target.value)}
            className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#00e599] transition-colors"
          />
        </div>
        <div className="relative has-tooltip">
          <label className="block text-[11px] text-[#8b949e] font-sans mb-1 cursor-help border-b border-dotted border-gray-700 inline-block">
            Oracle price
          </label>
          <div className="tooltip-popup absolute bottom-full right-0 mb-1 w-44 p-2 bg-[#1e2229] border border-[#343a46] rounded shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
            Underlying aggregate spot index price from external oracle feed.
          </div>
          <input
            type="number"
            step="any"
            value={oraclePriceInput}
            onChange={(e) => onChangeOraclePrice(e.target.value)}
            className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#00e599] transition-colors"
          />
        </div>
      </div>

      {/* Status Pill Badge */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium ${
            quoteResult.longsPayShorts
              ? "bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30"
              : "bg-[#ff4d4f]/15 text-[#ff4d4f] border border-[#ff4d4f]/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              quoteResult.longsPayShorts ? "bg-[#00e599]" : "bg-[#ff4d4f]"
            }`}
          />
          <span>{quoteResult.statusBadge}</span>
        </div>
      </div>

      {/* Metric Breakdown Table */}
      <div className="space-y-2 border-t border-[#272b35] pt-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">Premium</span>
          <div className="text-right">
            <span className="text-white font-semibold">
              {formatBps(quoteResult.premiumBps, 2)}
            </span>
            <span className="text-gray-400 text-[10px] ml-1.5">
              ({quoteResult.premiumPrice >= 0 ? '+' : ''}{quoteResult.premiumPrice.toFixed(Math.abs(quoteResult.premiumPrice) < 0.01 ? 5 : 2)})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">Funding per 1h</span>
          <span className="text-white font-semibold">
            {formatBps(quoteResult.funding1hBps, 3)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">Funding per 8h</span>
          <span className="text-white font-semibold">
            {formatBps(quoteResult.funding8hBps, 3)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">Annualized</span>
          <span className="text-[#00e599] font-semibold">
            +{quoteResult.fundingAnnualizedBps.toLocaleString('en-US', { maximumFractionDigits: 0 })} bps · {formatPct(quoteResult.fundingAnnualizedPct)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[#272b35]/60 pt-1.5">
          <span className="text-[#8b949e]">Per $10k notional</span>
          <span className="text-white font-semibold">
            {formatDollar(quoteResult.costPer10kHourly)} per hour
          </span>
        </div>
      </div>

      {/* Footnote matching screenshot */}
      <div className="mt-3 text-[10px] text-[#6b7280] leading-normal border-t border-[#272b35] pt-2">
        {selectedAssetName}: updated every 5 s.
        {apiFunding1hBps !== null && (
          <span>
            {" "}Hyperliquid's own funding: {apiFunding1hBps > 0 ? '+' : ''}{apiFunding1hBps.toFixed(3)} bps/1h (from impact prices) vs {formatBps(quoteResult.funding1hBps, 3)} from mark − oracle here.
          </span>
        )}
        {apiPremiumBps !== null && (
          <span> API premium: {apiPremiumBps > 0 ? '+' : ''}{apiPremiumBps.toFixed(2)} bps.</span>
        )}
      </div>
    </div>
  )
}
