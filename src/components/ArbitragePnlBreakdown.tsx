import React, { useState } from 'react'
import { FundingCalculationResult, MT5CalculationResult } from '../types/calculator'
import { ArrowRightLeft } from 'lucide-react'

interface ArbitragePnlBreakdownProps {
  quoteResult: FundingCalculationResult
  mt5Result: MT5CalculationResult
  symbol: string
  assetName: string
  onOpenGuide?: () => void
}

export const ArbitragePnlBreakdown: React.FC<ArbitragePnlBreakdownProps> = ({
  quoteResult,
  mt5Result,
  symbol,
  assetName,
  onOpenGuide
}) => {
  const [notionalSize, setNotionalSize] = useState<number>(10000)

  // HL Funding rate annualized %
  const hlAnnualPct = quoteResult.fundingAnnualizedPct

  // MT5 Long & Short annual rates %
  const mt5LongPct = mt5Result.annualizedLongPct
  const mt5ShortPct = mt5Result.annualizedShortPct

  // Strategy 1: Short HL Perp + Long MT5 Spot/CFD
  // Earning HL funding when funding > 0
  const strat1HlEarnPct = hlAnnualPct // received
  const strat1Mt5EarnPct = mt5LongPct // paid (usually negative)
  const strat1NetPct = strat1HlEarnPct + strat1Mt5EarnPct
  const strat1AnnualDollar = (notionalSize * strat1NetPct) / 100
  const strat1DailyDollar = strat1AnnualDollar / 365
  const strat1HourlyDollar = strat1DailyDollar / 24

  // Break-even MT5 swap rate required for Strategy 1:
  // We receive hlAnnualPct, so MT5 long swap can cost at most -hlAnnualPct
  const strat1BreakEvenMt5SwapPct = -hlAnnualPct

  // Strategy 2: Long HL Perp + Short MT5 Spot/CFD
  // Paying HL funding when funding > 0, earning MT5 short swap
  const strat2HlEarnPct = -hlAnnualPct // paid
  const strat2Mt5EarnPct = mt5ShortPct // earned (positive or negative)
  const strat2NetPct = strat2HlEarnPct + strat2Mt5EarnPct
  const strat2AnnualDollar = (notionalSize * strat2NetPct) / 100
  const strat2DailyDollar = strat2AnnualDollar / 365
  const strat2HourlyDollar = strat2DailyDollar / 24

  // Break-even MT5 swap rate required for Strategy 2:
  // We pay hlAnnualPct, so MT5 short swap must pay at least +hlAnnualPct
  const strat2BreakEvenMt5SwapPct = hlAnnualPct

  const isStrat1Best = strat1NetPct >= strat2NetPct

  return (
    <div className="mt-5 bg-[#181a1f] border border-[#272b35] rounded-lg p-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#272b35] pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#00e599]" />
          <h2 className="text-sm font-sans font-bold text-white tracking-wide">
            Delta-Neutral Funding Arbitrage PnL Simulator
          </h2>
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="text-[10px] text-[#38bdf8] hover:text-[#7dd3fc] hover:underline font-sans ml-1 flex items-center gap-0.5"
            >
              (How it works?)
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8b949e] font-sans">Notional Hedge Size:</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-gray-500">$</span>
            <input
              type="number"
              min="100"
              step="1000"
              value={notionalSize}
              onChange={(e) => setNotionalSize(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-28 bg-[#111215] border border-[#272b35] rounded pl-6 pr-2 py-1 text-white font-mono text-xs focus:border-[#00e599] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy Card 1: Short HL Perp + Long MT5 */}
        <div
          className={`p-3.5 rounded-lg border transition-all duration-300 interactive-card ${
            isStrat1Best && strat1NetPct > 0
              ? 'bg-[#00e599]/10 border-[#00e599]/50 shadow-lg shadow-[#00e599]/10 animate-pulse-glow'
              : 'bg-[#14161a] border-[#272b35]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-sans font-bold text-white text-xs">
              Strategy A: Short HL + Long MT5
            </div>
            {isStrat1Best && strat1NetPct > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#00e599] text-black shadow-sm shadow-[#00e599]/30">
                Optimal Hedge
              </span>
            )}
          </div>

          <div className="text-[11px] text-gray-400 font-sans mb-3">
            Short <span className="text-white">{assetName}</span> on Hyperliquid, Long <span className="text-white">{symbol}</span> on MT5.
          </div>

          <div className="space-y-1.5 mb-3 border-y border-[#272b35] py-2">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">HL Funding Yield:</span>
              <span className={strat1HlEarnPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}>
                {strat1HlEarnPct >= 0 ? '+' : ''}{strat1HlEarnPct.toFixed(2)}% / yr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">MT5 Long Swap:</span>
              <span className={strat1Mt5EarnPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}>
                {strat1Mt5EarnPct >= 0 ? '+' : ''}{strat1Mt5EarnPct.toFixed(2)}% / yr
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#272b35]/40 font-semibold">
              <span className="text-white">Net Carry APY:</span>
              <span className={strat1NetPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}>
                {strat1NetPct >= 0 ? '+' : ''}{strat1NetPct.toFixed(2)}% / yr
              </span>
            </div>
          </div>

          {/* Dollar cashflows */}
          <div className="grid grid-cols-3 gap-2 text-center bg-[#111215] p-2 rounded border border-[#272b35] mb-2.5">
            <div>
              <div className="text-[10px] text-gray-500 font-sans">Hourly</div>
              <div className={`font-semibold ${strat1HourlyDollar >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
                {strat1HourlyDollar >= 0 ? '+' : ''}${strat1HourlyDollar.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-sans">Daily</div>
              <div className={`font-semibold ${strat1DailyDollar >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
                {strat1DailyDollar >= 0 ? '+' : ''}${strat1DailyDollar.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-sans">Annual</div>
              <div className={`font-semibold ${strat1AnnualDollar >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
                {strat1AnnualDollar >= 0 ? '+' : ''}${strat1AnnualDollar.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 bg-[#1c1f26] p-2 rounded">
            <span className="text-gray-300 font-medium">Break-even rule:</span> MT5 long swap can cost up to{' '}
            <span className="text-[#38bdf8] font-bold">
              {strat1BreakEvenMt5SwapPct.toFixed(2)}%/yr
            </span>{' '}
            before hedge turns negative.
          </div>
        </div>

        {/* Strategy Card 2: Long HL Perp + Short MT5 */}
        <div
          className={`p-3.5 rounded-lg border transition-all duration-300 interactive-card ${
            !isStrat1Best && strat2NetPct > 0
              ? 'bg-[#00e599]/10 border-[#00e599]/50 shadow-lg shadow-[#00e599]/10 animate-pulse-glow'
              : 'bg-[#14161a] border-[#272b35]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-sans font-bold text-white text-xs">
              Strategy B: Long HL + Short MT5
            </div>
            {!isStrat1Best && strat2NetPct > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#00e599] text-black shadow-sm shadow-[#00e599]/30">
                Optimal Hedge
              </span>
            )}
          </div>

          <div className="text-[11px] text-gray-400 font-sans mb-3">
            Long <span className="text-white">{assetName}</span> on Hyperliquid, Short <span className="text-white">{symbol}</span> on MT5.
          </div>

          <div className="space-y-1.5 mb-3 border-y border-[#272b35] py-2">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">HL Funding Cost:</span>
              <span className={strat2HlEarnPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}>
                {strat2HlEarnPct >= 0 ? '+' : ''}{strat2HlEarnPct.toFixed(2)}% / yr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">MT5 Short Swap:</span>
              <span className={strat2Mt5EarnPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}>
                {strat2Mt5EarnPct >= 0 ? '+' : ''}{strat2Mt5EarnPct.toFixed(2)}% / yr
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#272b35]/40 font-semibold">
              <span className="text-white">Net Carry APY:</span>
              <span className={strat2NetPct >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}>
                {strat2NetPct >= 0 ? '+' : ''}{strat2NetPct.toFixed(2)}% / yr
              </span>
            </div>
          </div>

          {/* Dollar cashflows */}
          <div className="grid grid-cols-3 gap-2 text-center bg-[#111215] p-2 rounded border border-[#272b35] mb-2.5">
            <div>
              <div className="text-[10px] text-gray-500 font-sans">Hourly</div>
              <div className={`font-semibold ${strat2HourlyDollar >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
                {strat2HourlyDollar >= 0 ? '+' : ''}${strat2HourlyDollar.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-sans">Daily</div>
              <div className={`font-semibold ${strat2DailyDollar >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
                {strat2DailyDollar >= 0 ? '+' : ''}${strat2DailyDollar.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-sans">Annual</div>
              <div className={`font-semibold ${strat2AnnualDollar >= 0 ? 'text-[#00e599]' : 'text-[#ff4d4f]'}`}>
                {strat2AnnualDollar >= 0 ? '+' : ''}${strat2AnnualDollar.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 bg-[#1c1f26] p-2 rounded">
            <span className="text-gray-300 font-medium">Break-even rule:</span> MT5 short swap must pay at least{' '}
            <span className="text-[#38bdf8] font-bold">
              +{strat2BreakEvenMt5SwapPct.toFixed(2)}%/yr
            </span>{' '}
            to break even on the hedge.
          </div>
        </div>
      </div>
    </div>
  )
}
