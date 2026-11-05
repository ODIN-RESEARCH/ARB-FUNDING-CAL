import React from 'react'
import { HLFundingParams, MarketTier } from '../types/calculator'
import { X, RotateCcw, CheckCircle2 } from 'lucide-react'
import { DEFAULT_HL_PARAMS, MARKET_TIER_PARAMS } from '../services/fundingMath'

interface MarketParamsModalProps {
  isOpen: boolean
  onClose: () => void
  params: HLFundingParams
  onUpdateParams: (newParams: HLFundingParams) => void
}

export const MarketParamsModal: React.FC<MarketParamsModalProps> = ({
  isOpen,
  onClose,
  params,
  onUpdateParams
}) => {
  if (!isOpen) return null

  const handleSelectTier = (tier: MarketTier) => {
    onUpdateParams(MARKET_TIER_PARAMS[tier])
  }

  const handleReset = () => {
    onUpdateParams(DEFAULT_HL_PARAMS)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono text-xs">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-fade-in transition-opacity"
        onClick={onClose}
      />
      <div className="bg-[#181a1f] border border-[#272b35] rounded-xl max-w-lg w-full p-5 shadow-2xl relative z-10 animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#272b35] pb-3 mb-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-white">Market Funding Parameters</h3>
            <p className="text-[11px] text-[#8b949e]">Hyperliquid / tradeXYZ piecewise engine calibration</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#252830] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 1-Click Tier Selection (tradeXYZ / Hyperliquid specifications) */}
          <div>
            <label className="block text-[11px] text-[#8b949e] font-sans mb-1.5 font-medium">
              Calibrated Market Tiers (1-Click Presets):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTier('fx')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  params.tier === 'fx'
                    ? 'bg-[#00e599]/15 border-[#00e599] text-[#00e599] font-bold shadow-sm shadow-[#00e599]/10'
                    : 'bg-[#111215] border-[#272b35] text-[#8b949e] hover:text-white hover:border-[#3a414f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">xyz FX</span>
                  {params.tier === 'fx' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00e599]" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 font-sans">EUR, JPY, GBP</div>
                <div className="text-[9px] text-[#00e599] mt-0.5">±3 clamp · 0% floor</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTier('tradfi')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  params.tier === 'tradfi'
                    ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] font-bold shadow-sm shadow-[#38bdf8]/10'
                    : 'bg-[#111215] border-[#272b35] text-[#8b949e] hover:text-white hover:border-[#3a414f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">xyz TradFi</span>
                  {params.tier === 'tradfi' && <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 font-sans">GOLD, TSLA, SPX</div>
                <div className="text-[9px] text-[#38bdf8] mt-0.5">±3 clamp · 5.48% floor</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTier('crypto')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  params.tier === 'crypto'
                    ? 'bg-[#a855f7]/15 border-[#a855f7] text-[#a855f7] font-bold shadow-sm shadow-[#a855f7]/10'
                    : 'bg-[#111215] border-[#272b35] text-[#8b949e] hover:text-white hover:border-[#3a414f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Main DEX</span>
                  {params.tier === 'crypto' && <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7]" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 font-sans">BTC, ETH, SOL</div>
                <div className="text-[9px] text-[#a855f7] mt-0.5">±5 clamp · 10.95% floor</div>
              </button>
            </div>
          </div>

          {/* Floor Range */}
          <div>
            <label className="block text-[11px] text-[#8b949e] font-sans mb-1 font-medium">
              Zero-Slope / Interest Rate Floor Band (bps)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-500">Floor Min:</span>
                <input
                  type="number"
                  step="0.5"
                  value={params.floorMinBps}
                  onChange={(e) =>
                    onUpdateParams({ ...params, tier: undefined, floorMinBps: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-500">Floor Max:</span>
                <input
                  type="number"
                  step="0.5"
                  value={params.floorMaxBps}
                  onChange={(e) =>
                    onUpdateParams({ ...params, tier: undefined, floorMaxBps: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              For FX (tradeXYZ), deadband is -3 to +3 bps where funding is exactly 0.00%.
            </p>
          </div>

          {/* Clamp & Decay Divisor */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-[#8b949e] font-sans mb-1 font-medium">
                Clamp (bps)
              </label>
              <input
                type="number"
                step="0.5"
                value={params.clampBps ?? 3.0}
                onChange={(e) =>
                  onUpdateParams({ ...params, tier: undefined, clampBps: parseFloat(e.target.value) || 3.0 })
                }
                className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">±3 bps (tradeXYZ) or ±5 bps (Main DEX)</p>
            </div>
            <div>
              <label className="block text-[11px] text-[#8b949e] font-sans mb-1 font-medium">
                Decay Divisor (h)
              </label>
              <input
                type="number"
                step="1"
                value={params.decayDivisor ?? 16.0}
                onChange={(e) =>
                  onUpdateParams({ ...params, tier: undefined, decayDivisor: parseFloat(e.target.value) || 16.0 })
                }
                className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">16h (tradeXYZ) or 8h (Main DEX)</p>
            </div>
          </div>

          {/* Baseline Interest Rate */}
          <div>
            <label className="block text-[11px] text-[#8b949e] font-sans mb-1 font-medium">
              Baseline Interest Rate per 8h (bps)
            </label>
            <input
              type="number"
              step="0.1"
              value={params.interestRate8hBps}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                const divisor = params.decayDivisor || 16.0
                onUpdateParams({
                  ...params,
                  tier: undefined,
                  interestRate8hBps: val,
                  interestRateAnnualPct: (val / divisor) * 24 * 365 / 100
                })
              }}
              className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              0.0 bps for Forex; 1.0 bps for Crypto/TradFi.
            </p>
          </div>

          {/* Hourly Cap */}
          <div>
            <label className="block text-[11px] text-[#8b949e] font-sans mb-1 font-medium">
              Hourly Funding Cap (bps)
            </label>
            <input
              type="number"
              step="10"
              value={params.hourlyCapBps}
              onChange={(e) =>
                onUpdateParams({ ...params, hourlyCapBps: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Standard max funding clamp per hour (400 bps/hr = 4%/hr).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#272b35] pt-3 mt-5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] text-[#8b949e] hover:text-white transition-colors py-1 px-2 rounded hover:bg-[#252830]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00e599] hover:bg-[#00c784] text-black font-semibold rounded text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
