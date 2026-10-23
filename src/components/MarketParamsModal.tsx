import React from 'react'
import { HLFundingParams } from '../types/calculator'
import { X, RotateCcw } from 'lucide-react'
import { DEFAULT_HL_PARAMS } from '../services/fundingMath'

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

  const handleReset = () => {
    onUpdateParams(DEFAULT_HL_PARAMS)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono text-xs">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-fade-in transition-opacity"
        onClick={onClose}
      />
      <div className="bg-[#181a1f] border border-[#272b35] rounded-xl max-w-md w-full p-5 shadow-2xl relative z-10 animate-scale-up">
        <div className="flex items-center justify-between border-b border-[#272b35] pb-3 mb-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-white">Market Funding Parameters</h3>
            <p className="text-[11px] text-[#8b949e]">Configure Hyperliquid perpetual engine rules</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#252830] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Floor Range */}
          <div>
            <label className="block text-[11px] text-[#8b949e] font-sans mb-1 font-medium">
              Interest Rate Floor Range (bps)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-500">Floor Min:</span>
                <input
                  type="number"
                  step="0.5"
                  value={params.floorMinBps}
                  onChange={(e) =>
                    onUpdateParams({ ...params, floorMinBps: parseFloat(e.target.value) || 0 })
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
                    onUpdateParams({ ...params, floorMaxBps: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Standard Hyperliquid clamp is -4 bps to +6 bps. Inside this range, funding equals the floor rate.
            </p>
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
                onUpdateParams({
                  ...params,
                  interestRate8hBps: val,
                  interestRateAnnualPct: (val * 3 * 365) / 100
                })
              }}
              className="w-full bg-[#111215] border border-[#272b35] rounded px-2.5 py-1.5 text-white font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Default is 1.0 bps per 8h (0.01% / 8h = 10.95% annualized).
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
              Maximum absolute hourly funding payment allowed (default: 400 bps = 4%/hr).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#272b35] pt-3 mt-5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] text-[#8b949e] hover:text-white"
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
