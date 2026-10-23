import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { MT5SwapPreset } from '../types/calculator'

interface Mt5HedgeDropdownProps {
  presets: MT5SwapPreset[]
  selectedPresetId: string
  onSelectPreset: (id: string) => void
}

export const Mt5HedgeDropdown: React.FC<Mt5HedgeDropdownProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0]

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

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button with green border matching image 2 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#111215] border border-[#00e599] rounded px-3 py-2 text-white font-mono text-xs focus:outline-none transition-colors"
      >
        <span className="font-semibold">{selectedPreset ? selectedPreset.label : 'Select Hedge'}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-white" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {/* Dropdown Menu matching Image 2 */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-[#14161a] border border-[#272b35] rounded shadow-2xl overflow-hidden font-mono text-xs max-h-60 overflow-y-auto animate-slide-down origin-top">
          {presets.map((p) => {
            const isSelected = p.id === selectedPresetId
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelectPreset(p.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#2563eb] text-white font-semibold'
                    : 'text-neutral-200 hover:bg-[#1e2229]'
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] opacity-75">
                  {p.swapLongPoints > 0 ? '+' : ''}{p.swapLongPoints} / {p.swapShortPoints > 0 ? '+' : ''}{p.swapShortPoints}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
