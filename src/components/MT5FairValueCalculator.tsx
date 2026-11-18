import React, { useState } from 'react'
import { MT5SwapPreset, MT5CalculationResult } from '../types/calculator'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Mt5HedgeDropdown } from './Mt5HedgeDropdown'

interface MT5FairValueCalculatorProps {
  presets: MT5SwapPreset[]
  selectedPresetId: string
  onSelectPreset: (id: string) => void
  swapLongInput: string
  onChangeSwapLong: (val: string) => void
  swapShortInput: string
  onChangeSwapShort: (val: string) => void
  pointSizeInput: string
  onChangePointSize: (val: string) => void
  mt5Result: MT5CalculationResult
  useDirectRate?: boolean
  onToggleDirectRate?: (val: boolean) => void
  directRateInput?: string
  onChangeDirectRate?: (val: string) => void
}

export const MT5FairValueCalculator: React.FC<MT5FairValueCalculatorProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  swapLongInput,
  onChangeSwapLong,
  swapShortInput,
  onChangeSwapShort,
  pointSizeInput,
  onChangePointSize,
  mt5Result,
  useDirectRate = false,
  onToggleDirectRate,
  directRateInput = '',
  onChangeDirectRate
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const currentPreset = presets.find((p) => p.id === selectedPresetId) || presets[0]

  const formatPct = (val: number, decimals: number = 2) => {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(decimals)}%`
  }

  const formatBps = (val: number, decimals: number = 2) => {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(decimals)} bps`
  }

  return (
    <div className="bg-[#181a1f] border border-[#272b35] rounded-lg p-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-[#272b35] pb-2">
        <h2 className="text-sm font-sans font-bold text-white tracking-wide">
          Fair value from MT5
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[11px] text-[#8b949e] hover:text-[#e6edf3] flex items-center gap-1 font-sans"
        >
          <span>Broker Settings</span>
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* MT5 Hedge Selector */}
      <div className="mb-2">
        <label className="block text-[11px] text-[#8b949e] font-sans mb-1">
          MT5 hedge
        </label>
        <Mt5HedgeDropdown
          presets={presets}
          selectedPresetId={selectedPresetId}
          onSelectPreset={onSelectPreset}
        />
      </div>

      {/* Direct Annual Rate (%) Toggle */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => onToggleDirectRate && onToggleDirectRate(!useDirectRate)}
          className="text-[11px] text-[#00e599] hover:text-[#00e599]/80 underline decoration-dotted transition-colors font-sans cursor-pointer block text-left"
        >
          {useDirectRate
            ? '← Use broker swap points instead'
            : 'Or your own annual rate (%), instead of the swaps'}
        </button>

        {useDirectRate && (
          <div className="mt-2 p-2.5 bg-[#14161a] border border-[#00e599]/30 rounded space-y-1 animate-slide-down">
            <label className="block text-[10px] text-[#00e599] font-sans font-semibold">
              Implied Annual Financing Rate (%)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                value={directRateInput}
                onChange={(e) => onChangeDirectRate && onChangeDirectRate(e.target.value)}
                placeholder="e.g. 1.39"
                className="w-full bg-[#111215] border border-[#272b35] rounded px-2 py-1 text-white font-mono focus:border-[#00e599] focus:outline-none transition-colors"
              />
              <span className="text-[#8b949e] font-mono text-[11px] whitespace-nowrap">% / yr</span>
            </div>
            <p className="text-[10px] text-[#8b949e] font-sans">
              Overrides swap points to directly target your broker's exact net carry rate.
            </p>
          </div>
        )}
      </div>

      {/* Advanced broker inputs (collapsible or editable directly) */}
      {showAdvanced && (
        <div className="mb-3 p-2.5 bg-[#14161a] border border-[#272b35] rounded space-y-2 animate-slide-down origin-top">
          <div className="text-[11px] font-sans text-neutral-300 font-medium">
            Broker Swap Parameters
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#8b949e] font-sans mb-0.5">
                Swap Long (points)
              </label>
              <input
                type="number"
                step="any"
                value={swapLongInput}
                onChange={(e) => onChangeSwapLong(e.target.value)}
                className="w-full bg-[#111215] border border-[#272b35] rounded px-2 py-1 text-white font-mono focus:border-[#00e599] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#8b949e] font-sans mb-0.5">
                Swap Short (points)
              </label>
              <input
                type="number"
                step="any"
                value={swapShortInput}
                onChange={(e) => onChangeSwapShort(e.target.value)}
                className="w-full bg-[#111215] border border-[#272b35] rounded px-2 py-1 text-white font-mono focus:border-[#00e599] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-[#8b949e] font-sans mb-0.5">
              Point Size (e.g. 0.00001 for 5-digit FX)
            </label>
            <input
              type="number"
              step="any"
              value={pointSizeInput}
              onChange={(e) => onChangePointSize(e.target.value)}
              className="w-full bg-[#111215] border border-[#272b35] rounded px-2 py-1 text-white font-mono focus:border-[#00e599] focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Key-Value Breakdown matching reference screenshot */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">Symbol</span>
          <span className="text-white">
            {currentPreset.symbol} · {currentPreset.pointSize === 1.0 ? 'swaps in margin currency' : 'swaps in points'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">MT5 swap long / short</span>
          <div className="flex items-center gap-1 font-semibold">
            <span className="text-[#ff4d4f]">{Number(swapLongInput) > 0 ? `+${swapLongInput}` : swapLongInput}</span>
            <span className="text-gray-500">/</span>
            <span className="text-[#00e599]">{Number(swapShortInput) > 0 ? `+${swapShortInput}` : swapShortInput}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#8b949e]">Annualised long / short</span>
          <div className="flex items-center gap-1 font-semibold">
            <span className="text-[#ff4d4f]">{formatPct(mt5Result.annualizedLongPct)}</span>
            <span className="text-gray-500">/</span>
            <span className="text-[#00e599]">{formatPct(mt5Result.annualizedShortPct)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between relative has-tooltip">
          <span className="text-[#8b949e] cursor-help border-b border-dotted border-gray-600">Implied annual rate</span>
          <span className="text-[#c084fc] font-semibold">
            {formatPct(mt5Result.impliedAnnualRatePct)}
          </span>
          <div className="tooltip-popup absolute bottom-full left-0 mb-1.5 w-48 p-2 bg-[#1e2229] border border-[#343a46] rounded shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
            (Short Swap − Long Swap) / 2 converted to annual percentage rate.
          </div>
        </div>

        <div className="flex items-center justify-between relative has-tooltip">
          <span className="text-[#8b949e] cursor-help border-b border-dotted border-gray-600">Broker markup</span>
          <span className="text-white font-semibold">
            {formatPct(mt5Result.brokerMarkupPct)} a year
          </span>
          <div className="tooltip-popup absolute bottom-full left-0 mb-1.5 w-48 p-2 bg-[#1e2229] border border-[#343a46] rounded shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
            Retail broker haircut extracted on overnight financing spread.
          </div>
        </div>

        <div className="flex items-center justify-between relative has-tooltip">
          <span className="text-[#8b949e] cursor-help border-b border-dotted border-gray-600">Fair premium</span>
          <span className="text-[#c084fc] font-semibold">
            {formatBps(mt5Result.fairPremiumBps)}{' '}
            <span className="text-[11px] font-normal text-purple-300/80">
              ({mt5Result.fairPremiumPrice >= 0 ? '+' : ''}{Math.abs(mt5Result.fairPremiumPrice) < 0.005 ? mt5Result.fairPremiumPrice.toFixed(5) : Math.abs(mt5Result.fairPremiumPrice) < 0.1 ? mt5Result.fairPremiumPrice.toFixed(4) : mt5Result.fairPremiumPrice.toFixed(2)})
            </span>
          </span>
          <div className="tooltip-popup absolute bottom-full left-0 mb-1.5 w-52 p-2 bg-[#1e2229] border border-[#343a46] rounded shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
            Target Hyperliquid price deviation where funding matches MT5 financing.
          </div>
        </div>

        <div className="flex items-center justify-between relative has-tooltip">
          <span className="text-[#8b949e] cursor-help border-b border-dotted border-gray-600">No-carry band</span>
          <span className="text-white">
            {formatBps(mt5Result.noCarryBandMinBps)} to {formatBps(mt5Result.noCarryBandMaxBps)}
          </span>
          <div className="tooltip-popup absolute bottom-full left-0 mb-1.5 w-56 p-2 bg-[#1e2229] border border-[#343a46] rounded shadow-xl text-[10px] text-gray-300 font-sans z-30 pointer-events-none">
            Deviations inside this zone generate zero profit due to broker swap spread.
          </div>
        </div>

        {/* Premium vs fair Verdict Badge */}
        <div className="pt-2 border-t border-[#272b35]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#8b949e]">Premium vs fair</span>
            <span className={`font-bold ${mt5Result.premiumVsFairBps >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
              {formatBps(mt5Result.premiumVsFairBps)}
            </span>
          </div>
          <div
            className={`w-full text-center py-2 px-3 rounded text-[11px] font-sans font-semibold border transition-all duration-300 shadow-md ${
              mt5Result.recommendation === 'SHORT_HL_LONG_MT5'
                ? 'bg-[#00e599]/15 border-[#00e599]/50 text-[#00e599] animate-pulse-glow'
                : mt5Result.recommendation === 'LONG_HL_SHORT_MT5'
                ? 'bg-[#38bdf8]/15 border-[#38bdf8]/50 text-[#38bdf8] shadow-[#38bdf8]/20'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            {mt5Result.recommendationText}
          </div>
        </div>

        {/* Arbitrage Carry Net Breakdown */}
        <div className="mt-2 bg-[#121417] p-2.5 rounded border border-[#22252c] space-y-1.5 text-[11px]">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-sans font-semibold">
            Delta-Neutral Hedge Returns
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Short HL + Long MT5:</span>
            <span className={`font-semibold ${mt5Result.netCarryShortHlLongMt5 > 0 ? 'text-[#00e599]' : 'text-gray-400'}`}>
              {formatPct(mt5Result.netCarryShortHlLongMt5)} / yr
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Long HL + Short MT5:</span>
            <span className={`font-semibold ${mt5Result.netCarryLongHlShortMt5 > 0 ? 'text-[#00e599]' : 'text-gray-400'}`}>
              {formatPct(mt5Result.netCarryLongHlShortMt5)} / yr
            </span>
          </div>
        </div>
      </div>

      {/* Explanatory Footnote matching screenshot */}
      <div className="mt-3 text-[10px] text-[#6b7280] leading-relaxed border-t border-[#272b35] pt-2">
        Implied rate = (short swap − long swap) / 2; the band is where neither hedge earns carry: Hyperliquid funding between the short swap and minus the long swap. Swaps annualised × 365; fees, spreads and the funding parameters of the market (see below) matter too.
      </div>
    </div>
  )
}
