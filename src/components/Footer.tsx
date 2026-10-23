import React from 'react'
import { ExternalLink, ShieldCheck, Zap } from 'lucide-react'

interface FooterProps {
  mt5Connected?: boolean
  mt5Server?: string
}

export const Footer: React.FC<FooterProps> = ({ mt5Connected, mt5Server }) => {
  return (
    <footer className="mt-8 border-t border-[#272b35]/80 pt-5 pb-6 text-xs font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Exactly as requested in user's branding image */}
        <div className="flex items-center gap-3">
          <img
            src="./odin-crest.png"
            alt="Odin Crest Emblem"
            className="w-9 h-9 rounded object-contain border border-[#d4af37]/40 shadow-sm shadow-amber-500/10"
          />
          <div>
            <div className="text-[#8b949e] text-[11px] font-sans font-medium">
              App provided by <span className="text-[#e6edf3] font-semibold">ODIN RESEARCH</span>
            </div>
            <a
              href="https://odinresearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:text-[#7dd3fc] text-xs font-mono font-medium inline-flex items-center gap-1 transition-colors hover:underline"
            >
              <span>odinresearch.com</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>

        {/* Right Side: Institutional System Badges */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6b7280]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181a1f] border border-[#272b35]">
            <Zap className="w-3 h-3 text-[#00e599]" />
            <span>Hyperliquid L1 Mainnet: Connected</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181a1f] border border-[#272b35]">
            <ShieldCheck className={`w-3 h-3 ${mt5Connected ? 'text-[#38bdf8]' : 'text-[#22d3ee]'}`} />
            <span>
              {mt5Connected
                ? `MT5 Broker: ${mt5Server || 'ICMarkets'}`
                : 'Broker Swaps: Calibrated ECN'}
            </span>
          </div>

          <span className="text-[10px] text-[#4b5563]">v1.2 · ODIN Institutional</span>
        </div>
      </div>
    </footer>
  )
}
