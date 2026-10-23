import React from 'react'
import { RangeOption, FundingUnit, PremiumUnit, YRangeOption, HLFundingParams } from '../types/calculator'

interface ControlsBarProps {
  range: RangeOption
  onChangeRange: (r: RangeOption) => void
  fundingUnit: FundingUnit
  onChangeFundingUnit: (u: FundingUnit) => void
  premiumUnit: PremiumUnit
  onChangePremiumUnit: (p: PremiumUnit) => void
  yRange: YRangeOption
  onChangeYRange: (y: YRangeOption) => void
  oraclePrice: number
  params: HLFundingParams
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  range,
  onChangeRange,
  fundingUnit,
  onChangeFundingUnit,
  premiumUnit,
  onChangePremiumUnit,
  yRange,
  onChangeYRange,
  oraclePrice,
  params
}) => {
  const fundingUnitLabel =
    fundingUnit === 'yr' ? '% per year' : fundingUnit === '8h' ? 'per 8h' : 'per 1h'

  return (
    <div className="mb-4">
      {/* Button groups toolbar */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        {/* RANGE */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] font-sans font-semibold tracking-wider text-[11px] uppercase mr-1">
            RANGE
          </span>
          <div className="flex bg-[#181a1f] p-0.5 rounded border border-[#272b35]">
            {([20, 50, 200] as RangeOption[]).map((r) => (
              <button
                key={r}
                onClick={() => onChangeRange(r)}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                  range === r
                    ? "bg-[#00e599] text-black font-semibold shadow-sm"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#252830]"
                }`}
              >
                ±{r} bps
              </button>
            ))}
          </div>
        </div>

        {/* FUNDING */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] font-sans font-semibold tracking-wider text-[11px] uppercase mr-1">
            FUNDING
          </span>
          <div className="flex bg-[#181a1f] p-0.5 rounded border border-[#272b35]">
            {(
              [
                { id: 'yr', label: '% per year' },
                { id: '8h', label: 'per 8h' },
                { id: '1h', label: 'per 1h' }
              ] as { id: FundingUnit; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => onChangeFundingUnit(f.id)}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                  fundingUnit === f.id
                    ? "bg-[#00e599] text-black font-semibold shadow-sm"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#252830]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* PREMIUM */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] font-sans font-semibold tracking-wider text-[11px] uppercase mr-1">
            PREMIUM
          </span>
          <div className="flex bg-[#181a1f] p-0.5 rounded border border-[#272b35]">
            {(['bps', 'price'] as PremiumUnit[]).map((p) => (
              <button
                key={p}
                onClick={() => onChangePremiumUnit(p)}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                  premiumUnit === p
                    ? "bg-[#00e599] text-black font-semibold shadow-sm"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#252830]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Y RANGE */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] font-sans font-semibold tracking-wider text-[11px] uppercase mr-1">
            Y RANGE
          </span>
          <div className="flex bg-[#181a1f] p-0.5 rounded border border-[#272b35]">
            {(
              [
                { id: 'auto', label: 'auto' },
                { id: 20, label: '±20%/yr' },
                { id: 50, label: '±50%/yr' },
                { id: 100, label: '±100%/yr' },
                { id: 200, label: '±200%/yr' }
              ] as { id: YRangeOption; label: string }[]
            ).map((y) => (
              <button
                key={y.id}
                onClick={() => onChangeYRange(y.id)}
                className={`px-2 py-1 rounded transition-colors text-[11px] font-medium ${
                  yRange === y.id
                    ? "bg-[#00e599] text-black font-semibold shadow-sm"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#252830]"
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic subtitle description line matching screenshot */}
      <div className="mt-2.5 text-[11px] text-[#8b949e]">
        Funding in {fundingUnitLabel} against the premium, ±{range} bps. Floor from {params.floorMinBps} to +{params.floorMaxBps} bps; positive means longs pay shorts. Premium shown as mark − oracle at an oracle of {oraclePrice.toFixed(4)}.
      </div>
    </div>
  )
}
