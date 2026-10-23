import React from 'react'
import { RefreshCw, Play, Pause, Settings2, BookOpen } from 'lucide-react'

interface HeaderProps {
  isPolling: boolean
  onTogglePolling: () => void
  onManualRefresh: () => void
  onOpenSettings: () => void
  onOpenGuide: () => void
  lastUpdated: number | null
  isLoading: boolean
  mt5Connected?: boolean
  mt5Server?: string
}

export const Header: React.FC<HeaderProps> = ({
  isPolling,
  onTogglePolling,
  onManualRefresh,
  onOpenSettings,
  onOpenGuide,
  lastUpdated,
  isLoading,
  mt5Connected,
  mt5Server
}) => {
  return (
    <header className="mb-6">
      {/* Top Utilities Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <a
            href="#back"
            onClick={(e) => { e.preventDefault(); }}
            className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors flex items-center gap-1 cursor-pointer font-mono"
          >
            <span>←</span> All apps
          </a>
          <span className="text-[#3a414f] text-xs">/</span>
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">Arbitrage Suite</span>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center gap-2">
          {/* HL Live indicator with radar ping animation */}
          <button
            onClick={onTogglePolling}
            title={isPolling ? "Pause live polling" : "Resume live polling"}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-all duration-200 ${
              isPolling
                ? "bg-[#10b981]/10 text-[#00e599] border-[#10b981]/30 hover:bg-[#10b981]/20 hover:border-[#10b981]/50"
                : "bg-[#272b35]/40 text-[#8b949e] border-[#272b35] hover:text-[#e6edf3]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isPolling && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e599] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isPolling ? "bg-[#00e599]" : "bg-neutral-500"
                }`}
              />
            </span>
            <span>{isPolling ? "HL Live (5s)" : "Paused"}</span>
            {isPolling ? <Pause className="w-3 h-3 ml-0.5 opacity-70" /> : <Play className="w-3 h-3 ml-0.5 opacity-70" />}
          </button>

          {/* MT5 Terminal Status Indicator with blue radar ping */}
          <div
            title={mt5Connected ? `Connected to ${mt5Server || 'MetaTrader 5'}` : 'MT5 Bridge Offline (Using calibrated presets)'}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-all duration-200 ${
              mt5Connected
                ? "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30 shadow-sm shadow-[#38bdf8]/10"
                : "bg-[#272b35]/40 text-[#8b949e] border-[#272b35]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {mt5Connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  mt5Connected ? "bg-[#38bdf8]" : "bg-neutral-600"
                }`}
              />
            </span>
            <span>{mt5Connected ? `MT5: Live (${mt5Server || 'IC Markets'})` : 'MT5: Presets'}</span>
          </div>

          {lastUpdated && (
            <span className="text-[11px] text-[#6b7280] hidden md:inline font-mono">
              {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}

          {/* Strategy Guide Button */}
          <button
            onClick={onOpenGuide}
            title="Institutional Carry Trade Strategy Guide & Formulas"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181a1f] border border-[#272b35] text-[#8b949e] hover:text-white hover:border-[#00e599]/40 hover:bg-[#00e599]/5 transition-all text-xs font-mono group"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00e599] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Strategy Guide</span>
          </button>

          {/* Manual refresh */}
          <button
            onClick={onManualRefresh}
            disabled={isLoading}
            title="Refresh prices now"
            className="p-1.5 rounded-md bg-[#181a1f] border border-[#272b35] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#3a414f] transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform ${isLoading ? "animate-spin text-[#00e599]" : "hover:rotate-45"}`} />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Calculator & Market Parameters"
            className="p-1.5 rounded-md bg-[#181a1f] border border-[#272b35] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#3a414f] transition-all hover:rotate-45 active:scale-95"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Brand Title & Logo Area */}
      <div className="flex items-center gap-3.5">
        <img
          src="/odin-crest.png"
          alt="Odin Research Crest"
          className="w-12 h-12 object-contain rounded-lg border border-[#d4af37]/50 shadow-lg shadow-amber-500/10 p-0.5 bg-[#14161a] hover:scale-105 transition-transform duration-300"
        />

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Funding Arbitrage Calculator
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold tracking-wider uppercase bg-gradient-to-r from-[#d4af37]/20 to-[#f59e0b]/20 text-[#fbbf24] border border-[#d4af37]/40 shadow-sm shimmer-badge">
              ODIN RESEARCH
            </span>
          </div>
          <p className="text-xs text-[#8b949e] max-w-4xl mt-0.5 leading-normal font-sans">
            Hyperliquid perp funding against the premium, in bps: the interest-rate floor, the slope outside it and the hourly cap, with a mark/oracle calculator and live prices.
          </p>
        </div>
      </div>
    </header>
  )
}
