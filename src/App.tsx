import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Header } from './components/Header'
import { ControlsBar } from './components/ControlsBar'
import { FundingChart } from './components/FundingChart'
import { QuoteCalculator } from './components/QuoteCalculator'
import { MT5FairValueCalculator } from './components/MT5FairValueCalculator'
import { MarketParamsModal } from './components/MarketParamsModal'
import { StrategyGuideModal } from './components/StrategyGuideModal'
import { ToastContainer, ToastItem } from './components/Toast'
import { ArbitragePnlBreakdown } from './components/ArbitragePnlBreakdown'
import { ArbitrageStatsBar } from './components/ArbitrageStatsBar'
import { Footer } from './components/Footer'
import {
  RangeOption,
  FundingUnit,
  PremiumUnit,
  YRangeOption,
  HLFundingParams,
  HyperliquidAsset,
  MT5SwapPreset
} from './types/calculator'
import {
  DEFAULT_HL_PARAMS,
  getParamsForAsset,
  POPULAR_MT5_PRESETS,
  calculateQuote,
  calculateMT5FairValue,
  findOrCreateMt5Hedge
} from './services/fundingMath'
import {
  fetchAllDefaultAssets,
  FALLBACK_ASSET_EUR
} from './services/hyperliquid'
import {
  fetchLiveMT5Status,
  fetchLiveMT5Symbol
} from './services/mt5Bridge'

export const App: React.FC = () => {
  // Chart control states
  const [range, setRange] = useState<RangeOption>(20)
  const [fundingUnit, setFundingUnit] = useState<FundingUnit>('yr')
  const [premiumUnit, setPremiumUnit] = useState<PremiumUnit>('price')
  const [yRange, setYRange] = useState<YRangeOption>('auto')

  // Market rules & params
  const [hlParams, setHlParams] = useState<HLFundingParams>(DEFAULT_HL_PARAMS)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false)

  // Floating Toast Notifications System
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Live Asset Data
  const [assets, setAssets] = useState<HyperliquidAsset[]>([FALLBACK_ASSET_EUR])
  const [selectedAssetName, setSelectedAssetName] = useState<string>('xyz:EUR')
  const [customDex, setCustomDex] = useState<string>('')

  // Live polling
  const [isPolling, setIsPolling] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(Date.now())

  // Price inputs (allow manual edits/simulation)
  const [markPriceInput, setMarkPriceInput] = useState<string>('1.1154')
  const [oraclePriceInput, setOraclePriceInput] = useState<string>('1.1154')
  const [isUserModified, setIsUserModified] = useState<boolean>(false)

  // MT5 Hedge presets & broker inputs
  const [mt5Presets, setMt5Presets] = useState<MT5SwapPreset[]>(POPULAR_MT5_PRESETS)
  const [selectedMt5PresetId, setSelectedMt5PresetId] = useState<string>('EURUSD')
  const [swapLongInput, setSwapLongInput] = useState<string>('-8.00')
  const [swapShortInput, setSwapShortInput] = useState<string>('1.30')
  const [pointSizeInput, setPointSizeInput] = useState<string>('0.00001')
  const [mt5Connected, setMt5Connected] = useState<boolean>(false)
  const [mt5Server, setMt5Server] = useState<string>('')

  // Current active asset object
  const currentAsset = useMemo(() => {
    return assets.find((a) => a.name === selectedAssetName) || assets[0] || null
  }, [assets, selectedAssetName])

  // Fetch all pairs (both TradFi/Forex from trade.xyz and Native Crypto from Hyperliquid L1)
  const loadAllPairs = useCallback(async (customDexName?: string, autoSelectFirst = false) => {
    setIsLoading(true)
    try {
      const fetched = await fetchAllDefaultAssets(customDexName)
      if (fetched.length > 0) {
        setAssets((prev) => {
          if (customDexName) {
            const existingNames = new Set(fetched.map((f) => f.name))
            const kept = prev.filter((p) => !existingNames.has(p.name))
            return [...fetched, ...kept]
          }
          return fetched
        })

        if (autoSelectFirst && fetched.length > 0) {
          const first = fetched[0]
          setSelectedAssetName(first.name)
          if (!isUserModified) {
            setMarkPriceInput(first.markPx.toString())
            setOraclePriceInput(first.oraclePx.toString())
          }
        }
      }
      setLastUpdated(Date.now())
    } catch (err) {
      console.error('Error fetching all pairs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isUserModified])

  // Polling loop
  useEffect(() => {
    // Initial fetch of ALL default assets (xyz TradFi + L1 Crypto = 370 pairs)
    loadAllPairs()

    if (!isPolling) return
    const interval = setInterval(() => {
      loadAllPairs(customDex.trim() || undefined)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPolling, customDex, loadAllPairs])

  // Update input prices when selected asset changes or updates (unless user modified)
  useEffect(() => {
    if (!currentAsset) return
    if (!isUserModified) {
      setMarkPriceInput(currentAsset.markPx.toString())
      setOraclePriceInput(currentAsset.oraclePx.toString())
    }
  }, [currentAsset, isUserModified])

  // MT5 bridge status poll
  useEffect(() => {
    let wasConnected = false
    const checkMT5 = async () => {
      const status = await fetchLiveMT5Status()
      setMt5Connected(status.connected)
      if (status.connected && !wasConnected) {
        wasConnected = true
        addToast({
          title: 'MT5 Bridge Online',
          message: `Streaming live broker prices from ${status.account?.server || 'MetaTrader 5'}`,
          type: 'edge'
        })
      }
      if (status.account?.server) {
        setMt5Server(status.account.server)
      }
    }
    checkMT5()
    const timer = setInterval(checkMT5, 8000)
    return () => clearInterval(timer)
  }, [addToast])

  // When asset dropdown selection changes
  const handleSelectAsset = (name: string) => {
    setSelectedAssetName(name)
    setIsUserModified(false)
    const found = assets.find((a) => a.name === name)
    if (found) {
      setMarkPriceInput(found.markPx.toString())
      setOraclePriceInput(found.oraclePx.toString())

      // Auto match MT5 hedge preset or synthesize CFD hedge for this instrument
      const { preset, isNew } = findOrCreateMt5Hedge(
        found.name,
        found.markPx || found.oraclePx,
        mt5Presets
      )

      if (isNew) {
        setMt5Presets((prev) => [preset, ...prev])
      }
      setSelectedMt5PresetId(preset.id)
      setSwapLongInput(preset.swapLongPoints.toString())
      setSwapShortInput(preset.swapShortPoints.toString())
      setPointSizeInput(preset.pointSize.toString())

      // Auto-calibrate market funding tier (Forex: 0% floor, TradFi: 5.48%, Crypto: 10.95%)
      const calibratedParams = getParamsForAsset(found.name)
      setHlParams(calibratedParams)

      addToast({
        title: `Tier: ${calibratedParams.tier?.toUpperCase() || 'CALIBRATED'} Linked`,
        message: `${found.name} (Clamp ±${calibratedParams.clampBps} bps, Band ${calibratedParams.floorMinBps} to +${calibratedParams.floorMaxBps} bps, Floor ${calibratedParams.interestRateAnnualPct.toFixed(2)}%/yr)`,
        type: 'success'
      })

      // If MT5 terminal is live, fetch actual real-time swap points
      if (mt5Connected) {
        fetchLiveMT5Symbol(preset.symbol).then((live) => {
          if (live) {
            setSwapLongInput(live.swap_long.toString())
            setSwapShortInput(live.swap_short.toString())
            setPointSizeInput(live.point.toString())
            addToast({
              title: 'Live MT5 Swaps Loaded',
              message: `Live tick swaps for ${preset.symbol}: ${live.swap_long} / +${live.swap_short}`,
              type: 'info'
            })
          }
        })
      }
    }
  }

  // Handle MT5 preset selection
  const handleSelectMt5Preset = (id: string) => {
    setSelectedMt5PresetId(id)
    const preset = mt5Presets.find((p) => p.id === id)
    if (preset) {
      setSwapLongInput(preset.swapLongPoints.toString())
      setSwapShortInput(preset.swapShortPoints.toString())
      setPointSizeInput(preset.pointSize.toString())

      addToast({
        title: 'MT5 Hedge Preset Changed',
        message: `Hedge switched to ${preset.symbol} (${preset.label})`,
        type: 'info'
      })

      // If MT5 terminal is live, fetch actual real-time swap points
      if (mt5Connected) {
        fetchLiveMT5Symbol(preset.symbol).then((live) => {
          if (live) {
            setSwapLongInput(live.swap_long.toString())
            setSwapShortInput(live.swap_short.toString())
            setPointSizeInput(live.point.toString())
          }
        })
      }

      // If user hasn't modified, sync HL asset too
      if (!isUserModified && preset.assetName) {
        const found = assets.find((a) => a.name === preset.assetName)
        if (found) {
          setSelectedAssetName(found.name)
          setMarkPriceInput(found.markPx.toString())
          setOraclePriceInput(found.oraclePx.toString())
          setHlParams(getParamsForAsset(found.name))
        }
      }
    }
  }

  // Reset to live
  const handleResetToLive = () => {
    setIsUserModified(false)
    if (currentAsset) {
      setMarkPriceInput(currentAsset.markPx.toString())
      setOraclePriceInput(currentAsset.oraclePx.toString())
      addToast({
        title: 'Reset to Live Feed',
        message: `Mark ($${currentAsset.markPx}) & Oracle ($${currentAsset.oraclePx}) refreshed from Hyperliquid`,
        type: 'info'
      })
    }
  }

  // Handle clicking on chart to set simulated premium
  const handleSelectPremiumBps = (simulatedBps: number) => {
    const oracle = parseFloat(oraclePriceInput) || 1.0
    const simulatedPrice = (simulatedBps / 10000) * oracle
    const newMarkPrice = oracle + simulatedPrice
    setMarkPriceInput(newMarkPrice.toFixed(5))
    setIsUserModified(true)
    addToast({
      title: 'Interactive Curve Simulation',
      message: `Simulating deviation of ${simulatedBps >= 0 ? '+' : ''}${simulatedBps.toFixed(1)} bps (Mark: $${newMarkPrice.toFixed(4)})`,
      type: 'info'
    })
  }

  // Parse numeric values
  const markPrice = parseFloat(markPriceInput) || 0
  const oraclePrice = parseFloat(oraclePriceInput) || 0
  const swapLong = parseFloat(swapLongInput) || 0
  const swapShort = parseFloat(swapShortInput) || 0
  const pointSize = parseFloat(pointSizeInput) || 0.00001

  // Real-time calculations
  const quoteResult = useMemo(() => {
    return calculateQuote(markPrice, oraclePrice, hlParams)
  }, [markPrice, oraclePrice, hlParams])

  const mt5Result = useMemo(() => {
    return calculateMT5FairValue(
      swapLong,
      swapShort,
      pointSize,
      oraclePrice,
      quoteResult.premiumBps,
      hlParams
    )
  }, [swapLong, swapShort, pointSize, oraclePrice, quoteResult.premiumBps, hlParams])

  const currentPreset =
    mt5Presets.find((p) => p.id === selectedMt5PresetId) || mt5Presets[0]

  return (
    <div className="min-h-screen bg-[#111215] text-[#e6edf3] p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <Header
        isPolling={isPolling}
        onTogglePolling={() => setIsPolling(!isPolling)}
        onManualRefresh={() => loadAllPairs(customDex.trim() || undefined)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        mt5Connected={mt5Connected}
        mt5Server={mt5Server}
      />

      {/* Top Hedge Intelligence Stats Strip */}
      <ArbitrageStatsBar
        quoteResult={quoteResult}
        mt5Result={mt5Result}
        assetName={selectedAssetName}
        symbol={currentPreset.symbol}
      />

      {/* Main Grid Layout: Left Chart Area, Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Section: Controls + Chart (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Controls Bar */}
          <ControlsBar
            range={range}
            onChangeRange={setRange}
            fundingUnit={fundingUnit}
            onChangeFundingUnit={setFundingUnit}
            premiumUnit={premiumUnit}
            onChangePremiumUnit={setPremiumUnit}
            yRange={yRange}
            onChangeYRange={setYRange}
            oraclePrice={oraclePrice}
            params={hlParams}
          />

          {/* Funding Chart */}
          <div className="flex-1">
            <FundingChart
              range={range}
              fundingUnit={fundingUnit}
              premiumUnit={premiumUnit}
              yRange={yRange}
              oraclePrice={oraclePrice}
              livePremiumBps={quoteResult.premiumBps}
              mt5Result={mt5Result}
              params={hlParams}
              onSelectPremiumBps={handleSelectPremiumBps}
            />
          </div>

          {/* Delta-neutral Arbitrage Carry Simulator */}
          <ArbitragePnlBreakdown
            quoteResult={quoteResult}
            mt5Result={mt5Result}
            symbol={currentPreset.symbol}
            assetName={selectedAssetName}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>

        {/* Right Section: Sidebar Cards (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Quote Calculator */}
          <QuoteCalculator
            currentAsset={currentAsset}
            assetList={assets}
            selectedAssetName={selectedAssetName}
            onSelectAsset={handleSelectAsset}
            customDex={customDex}
            onChangeCustomDex={setCustomDex}
            onLoadCustomDex={() => {
              if (customDex.trim()) {
                loadAllPairs(customDex.trim().toLowerCase(), true)
              }
            }}
            markPriceInput={markPriceInput}
            onChangeMarkPrice={(val) => {
              setMarkPriceInput(val)
              setIsUserModified(true)
            }}
            oraclePriceInput={oraclePriceInput}
            onChangeOraclePrice={(val) => {
              setOraclePriceInput(val)
              setIsUserModified(true)
            }}
            onResetToLive={handleResetToLive}
            isModified={isUserModified}
            quoteResult={quoteResult}
            isLoading={isLoading}
          />

          {/* Card 2: Fair Value from MT5 */}
          <MT5FairValueCalculator
            presets={mt5Presets}
            selectedPresetId={selectedMt5PresetId}
            onSelectPreset={handleSelectMt5Preset}
            swapLongInput={swapLongInput}
            onChangeSwapLong={setSwapLongInput}
            swapShortInput={swapShortInput}
            onChangeSwapShort={setSwapShortInput}
            pointSizeInput={pointSizeInput}
            onChangePointSize={setPointSizeInput}
            mt5Result={mt5Result}
          />
        </div>
      </div>

      {/* Market Parameters Modal */}
      <MarketParamsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        params={hlParams}
        onUpdateParams={setHlParams}
      />

      {/* Institutional Strategy Guide Modal Popup */}
      <StrategyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Floating Animated Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer Branding matching user's Odin Research banner */}
      <Footer mt5Connected={mt5Connected} mt5Server={mt5Server} />
    </div>
  )
}

export default App
