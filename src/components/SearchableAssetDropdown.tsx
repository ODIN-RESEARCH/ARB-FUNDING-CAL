import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { HyperliquidAsset } from '../types/calculator'

interface SearchableAssetDropdownProps {
  assets: HyperliquidAsset[]
  selectedAssetName: string
  onSelectAsset: (name: string) => void
}

export type AssetCategory = 'all' | 'tradfi' | 'crypto'

export function getAssetCategory(name: string): {
  label: string
  pillClass: string
  isCrypto: boolean
} {
  if (!name.includes(':')) {
    return {
      label: 'Crypto L1',
      pillClass: 'bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30',
      isCrypto: true
    }
  }

  const clean = name.split(':')[1]?.toUpperCase() || ''
  if (['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].includes(clean)) {
    return {
      label: 'Forex',
      pillClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      isCrypto: false
    }
  }
  if (['GOLD', 'SILVER', 'CL', 'WTI', 'COPPER', 'NATGAS'].includes(clean)) {
    return {
      label: 'Commodity',
      pillClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      isCrypto: false
    }
  }
  if (['XYZ100', 'SP500', 'US500', 'USTECH', 'JP225'].includes(clean)) {
    return {
      label: 'Index',
      pillClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      isCrypto: false
    }
  }
  return {
    label: 'Stock CFD',
    pillClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    isCrypto: false
  }
}

export const SearchableAssetDropdown: React.FC<SearchableAssetDropdownProps> = ({
  assets,
  selectedAssetName,
  onSelectAsset
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('all')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Counts for tabs
  const { tradfiCount, cryptoCount } = useMemo(() => {
    let tCount = 0
    let cCount = 0
    for (const a of assets) {
      if (a.name.includes(':')) tCount++
      else cCount++
    }
    return { tradfiCount: tCount, cryptoCount: cCount }
  }, [assets])

  // Filter assets based on active category and search query
  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return assets.filter((a) => {
      const cat = getAssetCategory(a.name)
      if (activeCategory === 'crypto' && !cat.isCrypto) return false
      if (activeCategory === 'tradfi' && cat.isCrypto) return false

      if (!q) return true
      const nameLower = a.name.toLowerCase()
      const cleanLower = a.name.includes(':') ? a.name.split(':')[1].toLowerCase() : nameLower

      return (
        nameLower.includes(q) ||
        cleanLower.includes(q) ||
        cat.label.toLowerCase().includes(q)
      )
    })
  }, [assets, activeCategory, searchQuery])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (name: string) => {
    onSelectAsset(name)
    setIsOpen(false)
    setSearchQuery('')
  }

  const selectedCategory = getAssetCategory(selectedAssetName)

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button matching screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#181a1f] border ${
          isOpen ? 'border-[#00e599]' : 'border-[#272b35] hover:border-[#3a414f]'
        } rounded px-3 py-2 text-white font-mono text-xs transition-colors focus:outline-none`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-white">{selectedAssetName}</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-sans font-medium ${selectedCategory.pillClass}`}
          >
            {selectedCategory.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-[10px] text-gray-500 font-sans hidden sm:inline">
            {assets.length} pairs loaded
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e2025] border border-[#2d3139] rounded-md shadow-2xl p-2 font-mono text-xs animate-slide-down origin-top">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8b949e]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search e.g. JPY, EUR, GOLD, BTC, TSLA, NVDA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14161a] border border-[#2b2f38] rounded px-8 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e599] text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 mb-2 pb-1.5 border-b border-[#2b2f38] text-[10px] font-sans">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#00e599]/20 text-[#00e599] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-[#282c35]'
              }`}
            >
              All ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('tradfi')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeCategory === 'tradfi'
                  ? 'bg-sky-500/20 text-sky-400 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-[#282c35]'
              }`}
            >
              TradFi & FX ({tradfiCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('crypto')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeCategory === 'crypto'
                  ? 'bg-[#00e599]/20 text-[#00e599] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-[#282c35]'
              }`}
            >
              Crypto L1 ({cryptoCount})
            </button>
          </div>

          {/* Summary / Result count */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 mb-1 font-sans">
            <span>
              {searchQuery
                ? `Found ${filteredAssets.length} matching "${searchQuery}"`
                : `Showing ${filteredAssets.length} of ${assets.length} instruments`}
            </span>
            <span className="text-gray-500 text-[9px]">Live Hyperliquid Feed</span>
          </div>

          {/* Scrollable Asset List */}
          <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5 custom-dropdown-scrollbar">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const isSelected = asset.name === selectedAssetName
                const cat = getAssetCategory(asset.name)
                return (
                  <button
                    key={asset.name}
                    type="button"
                    onClick={() => handleSelect(asset.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-all duration-150 group ${
                      isSelected
                        ? 'text-[#00e599] font-semibold bg-[#00e599]/15 border-l-2 border-[#00e599]'
                        : 'text-neutral-200 hover:bg-[#282c35] hover:translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{asset.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-sans font-normal ${cat.pillClass}`}
                      >
                        {cat.label}
                      </span>
                    </div>
                    {asset.markPx > 0 && (
                      <span className="text-[10px] text-gray-400 font-mono ml-2 shrink-0">
                        ${asset.markPx < 10 ? asset.markPx.toFixed(4) : asset.markPx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="py-6 text-center text-gray-500 text-xs font-sans">
                No instruments found for "{searchQuery}"
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setActiveCategory('all')
                    }}
                    className="text-[#00e599] text-[11px] hover:underline"
                  >
                    Show all {assets.length} instruments
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
