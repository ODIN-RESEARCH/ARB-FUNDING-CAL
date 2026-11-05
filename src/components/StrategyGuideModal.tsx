import React, { useState } from 'react'
import { X, BookOpen, Layers, TrendingUp, ShieldCheck, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react'

interface StrategyGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export const StrategyGuideModal: React.FC<StrategyGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curve' | 'mt5' | 'execution'>('overview')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 font-mono text-xs">
      {/* Backdrop with blur & fade-in animation */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-fade-in transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog with scale-up popup animation */}
      <div className="relative bg-[#16181d] border border-[#2d323c] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 z-10 animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#272b35] bg-[#14161a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00e599]/10 border border-[#00e599]/30 text-[#00e599]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-sans font-bold text-white tracking-wide">
                  Institutional Carry Trade Guide
                </h3>
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#00e599]/15 text-[#00e599] font-semibold border border-[#00e599]/30">
                  ODIN RESEARCH
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] font-sans">
                Delta-neutral funding arbitrage between Hyperliquid and MetaTrader 5
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#252830] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#272b35] bg-[#121417] text-xs font-sans overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-[#00e599] text-[#00e599]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Overview & Hedging
          </button>
          <button
            onClick={() => setActiveTab('curve')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'curve'
                ? 'border-[#00e599] text-[#00e599]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            The Funding Curve
          </button>
          <button
            onClick={() => setActiveTab('mt5')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'mt5'
                ? 'border-[#00e599] text-[#00e599]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            MT5 Swaps & Fair Value
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'execution'
                ? 'border-[#00e599] text-[#00e599]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Execution Checklist
          </button>
        </div>

        {/* Tab Content (Scrollable with custom scrollbar) */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh] text-neutral-300 font-sans leading-relaxed text-xs custom-dropdown-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3 bg-[#181a1f] border border-[#272b35] rounded-lg">
                <div className="text-white font-bold mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e599]" />
                  What is Delta-Neutral Funding Arbitrage?
                </div>
                <p className="text-[#8b949e] text-[11px] leading-relaxed">
                  Perpetual futures contracts on Hyperliquid pay or receive continuous funding hourly. By taking an equal and opposing position on a traditional broker (like MetaTrader 5 Forex/CFD), directional price risk is completely eliminated. You collect pure net interest differential.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-[#14161a] border border-[#00e599]/30">
                  <div className="text-[#00e599] font-bold text-xs mb-1">
                    Strategy A: High Positive Funding
                  </div>
                  <div className="text-white text-[11px] mb-2 font-sans">
                    When HL perps trade at a premium above fair MT5 value:
                  </div>
                  <ul className="space-y-1 text-[11px] text-[#8b949e]">
                    <li className="flex items-center gap-1.5 text-neutral-200">
                      <ChevronRight className="w-3 h-3 text-[#00e599]" />
                      <strong>Short HL Perp:</strong> Collects funding rate
                    </li>
                    <li className="flex items-center gap-1.5 text-neutral-200">
                      <ChevronRight className="w-3 h-3 text-[#00e599]" />
                      <strong>Long MT5:</strong> Incurs long swap points
                    </li>
                    <li className="text-[#00e599] pt-1 border-t border-[#272b35]">
                      Net = HL Funding APY + MT5 Long Swap
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-[#14161a] border border-[#38bdf8]/30">
                  <div className="text-[#38bdf8] font-bold text-xs mb-1">
                    Strategy B: Deep Negative Funding
                  </div>
                  <div className="text-white text-[11px] mb-2 font-sans">
                    When HL perps trade at a discount below fair MT5 value:
                  </div>
                  <ul className="space-y-1 text-[11px] text-[#8b949e]">
                    <li className="flex items-center gap-1.5 text-neutral-200">
                      <ChevronRight className="w-3 h-3 text-[#38bdf8]" />
                      <strong>Long HL Perp:</strong> Collects short subsidy
                    </li>
                    <li className="flex items-center gap-1.5 text-neutral-200">
                      <ChevronRight className="w-3 h-3 text-[#38bdf8]" />
                      <strong>Short MT5:</strong> Earns short swap points
                    </li>
                    <li className="text-[#38bdf8] pt-1 border-t border-[#272b35]">
                      Net = MT5 Short Swap - HL Funding Cost
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curve' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3 bg-[#181a1f] border border-[#272b35] rounded-lg">
                <div className="text-white font-bold mb-1">Hyperliquid Piecewise Funding Engine (3 Market Tiers)</div>
                <p className="text-[#8b949e] text-[11px] leading-relaxed">
                  Hyperliquid and tradeXYZ (HIP-3) apply 3 calibrated market tiers depending on asset class. Forex perps have zero interest rate floor, while crypto and commodities have fixed positive baselines.
                </p>
              </div>

              {/* 3 Tiers Comparison Table matching empirical tradeXYZ data */}
              <div className="overflow-x-auto border border-[#272b35] rounded-lg">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="bg-[#111215] text-[#8b949e] border-b border-[#272b35]">
                    <tr>
                      <th className="p-2">Market Tier</th>
                      <th className="p-2">Interest Rate (8h)</th>
                      <th className="p-2">Clamp</th>
                      <th className="p-2">Zero-Slope Band</th>
                      <th className="p-2">Flat Baseline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#272b35]">
                    <tr className="bg-[#14161a]/60">
                      <td className="p-2 text-purple-400 font-bold">Main DEX (BTC, ETH)</td>
                      <td className="p-2">1.0 bps</td>
                      <td className="p-2">±5.0 bps</td>
                      <td className="p-2">-4 to +6 bps</td>
                      <td className="p-2 text-[#00e599]">0.125 bps/h (+10.95%/yr)</td>
                    </tr>
                    <tr className="bg-[#14161a]/60">
                      <td className="p-2 text-cyan-400 font-bold">xyz TradFi (GOLD, TSLA, SPX)</td>
                      <td className="p-2">1.0 bps</td>
                      <td className="p-2">±3.0 bps</td>
                      <td className="p-2">-2 to +4 bps</td>
                      <td className="p-2 text-[#00e599]">0.0625 bps/h (+5.48%/yr)</td>
                    </tr>
                    <tr className="bg-[#00e599]/5">
                      <td className="p-2 text-[#00e599] font-bold">xyz FX (JPY, EUR, GBP)</td>
                      <td className="p-2">0.0 bps</td>
                      <td className="p-2">±3.0 bps</td>
                      <td className="p-2 font-bold text-white">-3 to +3 bps</td>
                      <td className="p-2 text-neutral-400">0.000 bps/h (0.00%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-[#111215] border border-[#00e599]/30">
                  <span className="text-[#00e599] font-bold">Forex Empirical Inferred Curve (212 Hourly Observations):</span>
                  <div className="text-gray-300 mt-1 space-y-0.5 text-[10px]">
                    <div>• <strong>P &gt; +3 bps:</strong> Funding = (Premium − 3) / 16</div>
                    <div>• <strong>−3 &le; P &le; +3 bps:</strong> Funding = 0.00% (dead zero funding)</div>
                    <div>• <strong>P &lt; −3 bps:</strong> Funding = (Premium + 3) / 16</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#111215] border border-[#272b35]">
                  <span className="text-amber-400 font-bold">Why Grid Center Calibration Matters:</span>
                  <div className="text-gray-300 mt-0.5 text-[10px] leading-normal font-sans">
                    Correcting the grid centre from old crypto-assumptions to the true FX fair premium (e.g. <strong>-0.05564 for USDJPY</strong> and <strong>+0.000366 for EURUSD</strong>) resulted in <strong>+53% higher net carry profit</strong> in empirical backtests by aligning order grids with true swap parity.
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#111215] border border-[#272b35]">
                  <span className="text-[#ff4d4f] font-bold">Hourly Funding Cap:</span>
                  <div className="text-gray-300 mt-0.5">
                    Absolute funding is capped at <span className="text-white font-bold">400 bps/hr (4%/hr)</span> to prevent cascade liquidation events.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mt5' && (
            <div className="space-y-3.5 animate-fade-in font-mono text-xs">
              <div className="p-3 bg-[#181a1f] border border-[#272b35] rounded-lg font-sans">
                <div className="text-white font-bold mb-1">MetaTrader 5 Swap Calibration</div>
                <p className="text-[#8b949e] text-[11px] leading-relaxed">
                  Forex and CFD brokers credit or debit overnight rollover interest via swap points. These points directly translate into annual percentage yields (APY).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-[#14161a] border border-[#272b35] rounded">
                  <div className="text-[#38bdf8] font-bold font-sans">Implied Annual Rate</div>
                  <div className="text-gray-400 text-[10px] mt-1">
                    (Short Swap − Long Swap) / 2
                  </div>
                  <p className="text-neutral-300 text-[10px] mt-1 font-sans">
                    Reflects the true interbank cash rate differential between the currency pair.
                  </p>
                </div>

                <div className="p-2.5 bg-[#14161a] border border-[#272b35] rounded">
                  <div className="text-[#f59e0b] font-bold font-sans">Broker Markup (Financing Spread)</div>
                  <div className="text-gray-400 text-[10px] mt-1">
                    (−Long Swap − Short Swap) / 2
                  </div>
                  <p className="text-neutral-300 text-[10px] mt-1 font-sans">
                    The broker's retail spread haircut extracted on both sides of overnight financing.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#111215] border border-purple-500/30 rounded text-[11px]">
                <div className="text-purple-400 font-bold font-sans">Fair Premium & No-Carry Band</div>
                <div className="text-gray-300 text-[10px] mt-1 font-sans leading-relaxed">
                  The <strong>Fair Premium</strong> is the exact price deviation where Hyperliquid funding exactly offsets MT5 carry.
                  The <strong>No-Carry Band</strong> represents the dead-zone where neither long nor short hedges earn carry due to retail spreads.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-3 animate-fade-in font-sans">
              <div className="p-3 bg-[#181a1f] border border-[#272b35] rounded-lg">
                <div className="text-white font-bold mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
                  Pre-Flight Execution Checklist
                </div>
                <p className="text-[#8b949e] text-[11px]">
                  Follow these standard institutional protocols when opening cross-venue carry positions:
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2.5 p-2 rounded bg-[#14161a] border border-[#272b35]">
                  <span className="font-mono text-[#00e599] font-bold">01</span>
                  <div>
                    <strong className="text-white">Verify Venue Delta:</strong> Confirm notional dollar exposure matches 1:1 on both venues (e.g. $10,000 on HL Perp = 0.10 lots on EURUSD).
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded bg-[#14161a] border border-[#272b35]">
                  <span className="font-mono text-[#00e599] font-bold">02</span>
                  <div>
                    <strong className="text-white">Triple Wednesday Swaps:</strong> MT5 brokers charge or pay 3× swap on Wednesday roll-over (for weekend settlement). Factor this into carry projections.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded bg-[#14161a] border border-[#272b35]">
                  <span className="font-mono text-[#00e599] font-bold">03</span>
                  <div>
                    <strong className="text-white">Margin Buffer & Liquidation:</strong> Keep at least 30-40% free margin buffer on Hyperliquid to tolerate short-term volatility spikes without forced liquidation.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#272b35] bg-[#14161a] flex items-center justify-between text-xs">
          <div className="text-[#8b949e] text-[11px] font-sans">
            Need help? Visit <a href="https://odinresearch.com" target="_blank" rel="noreferrer" className="text-[#38bdf8] hover:underline">odinresearch.com</a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00e599] hover:bg-[#00c784] text-black font-semibold rounded text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  )
}
