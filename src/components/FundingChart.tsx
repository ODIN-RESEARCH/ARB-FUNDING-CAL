import React, { useState, useRef } from 'react'
import {
  RangeOption,
  FundingUnit,
  PremiumUnit,
  YRangeOption,
  HLFundingParams,
  MT5CalculationResult
} from '../types/calculator'
import { calculateHLFundingFromPremiumBps } from '../services/fundingMath'

interface FundingChartProps {
  range: RangeOption
  fundingUnit: FundingUnit
  premiumUnit: PremiumUnit
  yRange: YRangeOption
  oraclePrice: number
  livePremiumBps: number
  mt5Result: MT5CalculationResult
  params: HLFundingParams
}

export const FundingChart: React.FC<FundingChartProps> = ({
  range,
  fundingUnit,
  premiumUnit,
  yRange,
  oraclePrice,
  livePremiumBps,
  mt5Result,
  params
}) => {
  const containerRef = useRef<SVGSVGElement | null>(null)
  const [hoverData, setHoverData] = useState<{
    svgX: number
    svgY: number
    clientX: number
    clientY: number
    pBps: number
    pPrice: number
    fundingY: number
  } | null>(null)

  // Chart dimensions
  const width = 860
  const height = 560
  const padLeft = 75
  const padRight = 35
  const padTop = 35
  const padBottom = 55
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom

  // Domain X (in bps)
  const xMinBps = -range
  const xMaxBps = range

  // Convert funding value from annual % to selected unit
  const formatFundingValue = (annualPct: number): number => {
    if (fundingUnit === 'yr') return annualPct
    // annualPct to 8h bps: annualPct = 8hBps * 10.95% => 8hBps = annualPct / 10.95
    if (fundingUnit === '8h') return annualPct / 10.95
    // 1h bps: 8hBps / 8
    return annualPct / 10.95 / 8
  }

  // Determine Domain Y
  let yMin: number
  let yMax: number

  if (yRange !== 'auto') {
    const lim = yRange
    yMin = -lim
    yMax = lim
  } else {
    // Auto calculate Y bounds based on range
    const maxFundingAnnual = calculateHLFundingFromPremiumBps(range, params).fundingAnnualizedPct
    const minFundingAnnual = calculateHLFundingFromPremiumBps(-range, params).fundingAnnualizedPct
    const absMax = Math.max(Math.abs(maxFundingAnnual), Math.abs(minFundingAnnual), 30)

    if (absMax <= 25) {
      yMin = -20
      yMax = 20
    } else if (absMax <= 60) {
      yMin = -50
      yMax = 50
    } else if (absMax <= 120) {
      yMin = -100
      yMax = 100
    } else {
      yMin = -200
      yMax = 200
    }
  }

  // Scale functions
  const scaleX = (pBps: number): number => {
    return padLeft + ((pBps - xMinBps) / (xMaxBps - xMinBps)) * plotWidth
  }

  const scaleY = (fVal: number): number => {
    const fInUnit = formatFundingValue(fVal)
    const yMinInUnit = formatFundingValue(yMin)
    const yMaxInUnit = formatFundingValue(yMax)
    return padTop + (1 - (fInUnit - yMinInUnit) / (yMaxInUnit - yMinInUnit)) * plotHeight
  }

  const bpsToPrice = (pBps: number): number => (pBps / 10000) * oraclePrice

  // Floor band coordinates
  const floorLeftX = scaleX(params.floorMinBps)
  const floorRightX = scaleX(params.floorMaxBps)
  const floorWidth = Math.max(0, floorRightX - floorLeftX)
  const floorAnnualPct = params.interestRateAnnualPct

  // Piecewise curve points
  const pointsCount = 200
  const pathDParts: string[] = []
  for (let i = 0; i <= pointsCount; i++) {
    const pBps = xMinBps + (i / pointsCount) * (xMaxBps - xMinBps)
    const res = calculateHLFundingFromPremiumBps(pBps, params)
    const x = scaleX(pBps)
    const y = scaleY(res.fundingAnnualizedPct)
    pathDParts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  const curvePath = pathDParts.join(' ')

  // Live Premium Point
  const liveRes = calculateHLFundingFromPremiumBps(livePremiumBps, params)
  const liveX = scaleX(livePremiumBps)
  const liveY = scaleY(liveRes.fundingAnnualizedPct)
  const isLiveInView = livePremiumBps >= xMinBps && livePremiumBps <= xMaxBps

  // MT5 Fair Premium Vertical Line
  const fairBps = mt5Result.fairPremiumBps
  const fairX = scaleX(fairBps)
  const isFairInView = fairBps >= xMinBps && fairBps <= xMaxBps

  // MT5 Swap Horizontal Reference Lines
  // 1. Long swap paid break-even (+abs(annualizedLongPct))
  const mt5LongBreakEvenPct = -mt5Result.annualizedLongPct
  const mt5LongY = scaleY(mt5LongBreakEvenPct)

  // 2. Short swap earned break-even (+annualizedShortPct)
  const mt5ShortBreakEvenPct = mt5Result.annualizedShortPct
  const mt5ShortY = scaleY(mt5ShortBreakEvenPct)

  // 3. Implied annual rate line
  const mt5ImpliedPct = mt5Result.impliedAnnualRatePct
  const mt5ImpliedY = scaleY(mt5ImpliedPct)

  // Grid Ticks
  const xTicksCount = range === 20 ? 8 : 10
  const xTicks: number[] = []
  for (let i = 0; i <= xTicksCount; i++) {
    const p = xMinBps + (i / xTicksCount) * (xMaxBps - xMinBps)
    xTicks.push(p)
  }

  // Y Grid Ticks
  const yTicksValues =
    yMax === 200
      ? [-200, -150, -100, -50, 0, 50, 100, 150, 200]
      : yMax === 100
      ? [-100, -75, -50, -25, 0, 25, 50, 75, 100]
      : yMax === 50
      ? [-50, -25, 0, 25, 50]
      : [-20, -10, 0, 10, 20]

  const yZeroY = scaleY(0)

  // Handle mouse move for hover crosshair & precision tracking dot
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = containerRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    // Screen mouse coordinates relative to SVG
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    // Project client mouse coordinates into SVG viewBox coordinate space (0..width, 0..height)
    const svgX = (clientX / rect.width) * width
    const svgY = (clientY / rect.height) * height

    // Clamp inside plot area
    if (
      svgX < padLeft ||
      svgX > padLeft + plotWidth ||
      svgY < padTop ||
      svgY > padTop + plotHeight
    ) {
      setHoverData(null)
      return
    }

    const ratioX = (svgX - padLeft) / plotWidth
    const pBps = xMinBps + ratioX * (xMaxBps - xMinBps)
    const pPrice = bpsToPrice(pBps)
    const res = calculateHLFundingFromPremiumBps(pBps, params)
    const fundingY = formatFundingValue(res.fundingAnnualizedPct)

    // Exact curve coordinates on the chart line in SVG space
    const curveSvgX = scaleX(pBps)
    const curveSvgY = scaleY(res.fundingAnnualizedPct)

    setHoverData({
      svgX: curveSvgX,
      svgY: curveSvgY,
      clientX,
      clientY,
      pBps,
      pPrice,
      fundingY
    })
  }

  const handleMouseLeave = () => {
    setHoverData(null)
  }

  // Format tick labels
  const formatXTick = (pBps: number): string => {
    if (premiumUnit === 'bps') {
      return `${pBps > 0 ? '+' : ''}${pBps.toFixed(pBps % 1 === 0 ? 0 : 1)}`
    }
    const priceVal = bpsToPrice(pBps)
    const absVal = Math.abs(priceVal)
    const prefix = priceVal < 0 ? '−' : priceVal > 0 ? '+' : ''
    if (absVal < 0.005) {
      return `${prefix}${absVal.toFixed(5)}`
    } else if (absVal < 0.1) {
      return `${prefix}${absVal.toFixed(4)}`
    }
    return `${prefix}${absVal.toFixed(2)}`
  }

  const formatPremiumDisplay = (pBps: number): string => {
    if (premiumUnit === 'bps') {
      return `Premium ${pBps >= 0 ? '+' : ''}${pBps.toFixed(2)} bps`
    }
    const priceVal = bpsToPrice(pBps)
    const absVal = Math.abs(priceVal)
    const sign = priceVal >= 0 ? '+' : '−'
    const formattedPrice = absVal < 0.005 ? absVal.toFixed(5) : absVal < 0.1 ? absVal.toFixed(4) : absVal.toFixed(2)
    return `Premium ${sign}${formattedPrice}`
  }

  const formatFairDisplay = (fBps: number): string => {
    if (premiumUnit === 'bps') {
      return `Fair ${fBps >= 0 ? '+' : ''}${fBps.toFixed(2)} bps`
    }
    const priceVal = bpsToPrice(fBps)
    const absVal = Math.abs(priceVal)
    const sign = priceVal >= 0 ? '+' : '−'
    const formattedPrice = absVal < 0.005 ? absVal.toFixed(5) : absVal < 0.1 ? absVal.toFixed(4) : absVal.toFixed(2)
    return `Fair ${sign}${formattedPrice}`
  }

  const formatFloorBoundaryTick = (fBps: number): string => {
    if (premiumUnit === 'bps') {
      return `${fBps >= 0 ? '+' : ''}${fBps.toFixed(1)} bps`
    }
    const priceVal = bpsToPrice(fBps)
    const absVal = Math.abs(priceVal)
    const sign = priceVal >= 0 ? '+' : '−'
    const formattedPrice = absVal < 0.005 ? absVal.toFixed(5) : absVal < 0.1 ? absVal.toFixed(4) : absVal.toFixed(2)
    return `${sign}${formattedPrice}`
  }

  const formatYTick = (yVal: number): string => {
    const formatted = formatFundingValue(yVal)
    if (fundingUnit === 'yr') {
      return `${formatted > 0 ? '' : ''}${formatted.toFixed(0)}%`
    }
    return `${formatted.toFixed(formatted % 1 === 0 ? 0 : 2)} bps`
  }

  return (
    <div className="relative w-full bg-[#111215] rounded-lg border border-[#272b35] p-3 overflow-hidden shadow-2xl">
      <svg
        ref={containerRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none cursor-crosshair font-mono"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <clipPath id="plotClip">
            <rect x={padLeft} y={padTop} width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>

        {/* Y Axis Grid lines & labels */}
        {yTicksValues.map((yVal) => {
          const yPos = scaleY(yVal)
          if (yPos < padTop - 5 || yPos > padTop + plotHeight + 5) return null
          const isZero = yVal === 0
          return (
            <g key={`y-${yVal}`}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={padLeft + plotWidth}
                y2={yPos}
                stroke={isZero ? '#4b5563' : '#1f242d'}
                strokeWidth={isZero ? 1.5 : 1}
                strokeDasharray={isZero ? undefined : '2 3'}
              />
              <text
                x={padLeft - 10}
                y={yPos + 4}
                textAnchor="end"
                fontSize="11"
                fill={isZero ? '#e6edf3' : '#6b7280'}
                className="font-medium"
              >
                {formatYTick(yVal)}
              </text>
            </g>
          )
        })}

        {/* X Axis Grid lines & labels */}
        {xTicks.map((pBps, idx) => {
          const xPos = scaleX(pBps)
          const isZero = Math.abs(pBps) < 0.001
          return (
            <g key={`x-${idx}`}>
              <line
                x1={xPos}
                y1={padTop}
                x2={xPos}
                y2={padTop + plotHeight}
                stroke={isZero ? '#4b5563' : '#1f242d'}
                strokeWidth={isZero ? 1.5 : 1}
                strokeDasharray={isZero ? undefined : '2 3'}
              />
              <text
                x={xPos}
                y={padTop + plotHeight + 18}
                textAnchor="middle"
                fontSize="10"
                fill={isZero ? '#e6edf3' : '#6b7280'}
              >
                {formatXTick(pBps)}
              </text>
            </g>
          )
        })}

        {/* Floor Band (Shaded green area) */}
        <g clipPath="url(#plotClip)">
          {floorWidth > 0 && (
            <rect
              x={floorLeftX}
              y={padTop}
              width={floorWidth}
              height={plotHeight}
              fill="rgba(0, 229, 153, 0.08)"
              stroke="rgba(0, 229, 153, 0.25)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* MT5 Swap Long break-even line (Dotted top line) */}
          {mt5LongY >= padTop && mt5LongY <= padTop + plotHeight && (
            <g>
              <line
                x1={padLeft}
                y1={mt5LongY}
                x2={padLeft + plotWidth}
                y2={mt5LongY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="2 3"
              />
              <text
                x={padLeft + 12}
                y={mt5LongY - 5}
                fontSize="9"
                fill="#38bdf8"
                className="font-sans"
              >
                MT5 long swap (paid) +{(-mt5Result.annualizedLongPct).toFixed(2)} %/yr − short HL / long MT5 breaks even
              </text>
            </g>
          )}

          {/* MT5 Swap Short break-even line (Dotted bottom line) */}
          {mt5ShortY >= padTop && mt5ShortY <= padTop + plotHeight && (
            <g>
              <line
                x1={padLeft}
                y1={mt5ShortY}
                x2={padLeft + plotWidth}
                y2={mt5ShortY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="2 3"
              />
              <text
                x={padLeft + 12}
                y={mt5ShortY + 11}
                fontSize="9"
                fill="#38bdf8"
                className="font-sans"
              >
                MT5 short swap +{mt5Result.annualizedShortPct.toFixed(2)} %/yr − long HL / short MT5 breaks even
              </text>
            </g>
          )}

          {/* MT5 Implied Rate Dashed Line */}
          {mt5ImpliedY >= padTop && mt5ImpliedY <= padTop + plotHeight && (
            <g>
              <line
                x1={padLeft}
                y1={mt5ImpliedY}
                x2={padLeft + plotWidth}
                y2={mt5ImpliedY}
                stroke="#c084fc"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity="0.8"
              />
              <text
                x={padLeft + plotWidth - 12}
                y={mt5ImpliedY + 3}
                textAnchor="end"
                fontSize="9"
                fill="#c084fc"
                className="font-sans"
              >
                MT5 implied +{mt5Result.impliedAnnualRatePct.toFixed(3)} %/yr
              </text>
            </g>
          )}

          {/* MT5 Fair Premium Vertical Line (Purple) */}
          {isFairInView && (
            <g>
              <line
                x1={fairX}
                y1={padTop}
                x2={fairX}
                y2={padTop + plotHeight}
                stroke="#a855f7"
                strokeWidth="2"
              />
              <text
                x={fairX - 6}
                y={padTop + 45}
                textAnchor="end"
                fontSize="11"
                fill="#c084fc"
                className="font-sans font-medium"
              >
                {formatFairDisplay(fairBps)}
              </text>
            </g>
          )}

          {/* Main Cyan piecewise curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="#00e599"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Floor text indicator */}
          {floorLeftX < padLeft + plotWidth && floorRightX > padLeft && (
            <text
              x={(Math.max(floorLeftX, padLeft) + Math.min(floorRightX, padLeft + plotWidth)) / 2}
              y={padTop + 22}
              textAnchor="middle"
              fontSize="10"
              fill="#00e599"
              className="font-sans font-semibold tracking-wide"
            >
              {floorAnnualPct === 0
                ? `Zero Funding: ${params.floorMinBps} to +${params.floorMaxBps} bps`
                : `Floor: ${formatFundingValue(floorAnnualPct).toFixed(2)} ${fundingUnit === 'yr' ? '%/yr' : 'bps'}`}
            </text>
          )}

          {/* Floor boundary ticks */}
          {floorLeftX >= padLeft && floorLeftX <= padLeft + plotWidth && (
            <g>
              <line x1={floorLeftX} y1={yZeroY - 4} x2={floorLeftX} y2={yZeroY + 4} stroke="#00e599" strokeWidth="1.5" />
              <text x={floorLeftX} y={yZeroY - 6} textAnchor="middle" fontSize="9" fill="#00e599">
                {formatFloorBoundaryTick(params.floorMinBps)}
              </text>
            </g>
          )}
          {floorRightX >= padLeft && floorRightX <= padLeft + plotWidth && (
            <g>
              <line x1={floorRightX} y1={yZeroY - 4} x2={floorRightX} y2={yZeroY + 4} stroke="#00e599" strokeWidth="1.5" />
              <text x={floorRightX} y={yZeroY - 6} textAnchor="middle" fontSize="9" fill="#00e599">
                {formatFloorBoundaryTick(params.floorMaxBps)}
              </text>
            </g>
          )}

          {/* Live Premium Marker (Yellow Diamond) */}
          {isLiveInView && (
            <g>
              {/* Diamond symbol */}
              <polygon
                points={`${liveX},${liveY - 5} ${liveX + 5},${liveY} ${liveX},${liveY + 5} ${liveX - 5},${liveY}`}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth="1"
              />
              <text
                x={liveX}
                y={liveY - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#fbbf24"
                className="font-sans font-semibold"
              >
                {formatPremiumDisplay(livePremiumBps)}
              </text>
            </g>
          )}

          {/* Hover Crosshair & Dot - 100% attached to curve */}
          {hoverData && (
            <g>
              <line
                x1={hoverData.svgX}
                y1={padTop}
                x2={hoverData.svgX}
                y2={padTop + plotHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              <line
                x1={padLeft}
                y1={hoverData.svgY}
                x2={padLeft + plotWidth}
                y2={hoverData.svgY}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              <circle
                cx={hoverData.svgX}
                cy={hoverData.svgY}
                r="4.5"
                fill="#00e599"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </g>

        {/* Y Axis Title */}
        <text
          x={-(padTop + plotHeight / 2)}
          y={20}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="11"
          fill="#8b949e"
          className="font-sans font-medium"
        >
          Funding, {fundingUnit === 'yr' ? '% per year' : fundingUnit === '8h' ? 'bps per 8h' : 'bps per 1h'}
        </text>

        {/* X Axis Title */}
        <text
          x={padLeft + plotWidth / 2}
          y={height - 12}
          textAnchor="middle"
          fontSize="11"
          fill="#8b949e"
          className="font-sans font-medium"
        >
          Premium: mark − oracle, {premiumUnit === 'bps' ? 'in bps' : 'in price'}
        </text>
      </svg>

      {/* Floating Hover Tooltip - follows mouse cursor */}
      {hoverData && (
        <div
          className="absolute z-30 pointer-events-none bg-[#1e2229]/95 backdrop-blur-sm border border-[#3a414f] rounded-md shadow-2xl px-3 py-2 text-xs font-mono"
          style={{
            left: `${Math.min(hoverData.clientX + 14, (containerRef.current?.getBoundingClientRect().width || width) - 230)}px`,
            top: `${Math.max(hoverData.clientY - 45, 12)}px`
          }}
        >
          <div className="text-white font-semibold flex items-center justify-between gap-3">
            <span>Premium:</span>
            <span className="text-[#00e599]">
              {hoverData.pBps >= 0 ? '+' : ''}{hoverData.pBps.toFixed(2)} bps ({hoverData.pPrice >= 0 ? '+' : ''}{Math.abs(hoverData.pPrice) < 0.005 ? hoverData.pPrice.toFixed(5) : Math.abs(hoverData.pPrice) < 0.1 ? hoverData.pPrice.toFixed(4) : hoverData.pPrice.toFixed(2)})
            </span>
          </div>
          <div className="text-gray-300 flex items-center justify-between gap-3 mt-1">
            <span>Funding:</span>
            <span className="text-[#38bdf8] font-semibold">
              {hoverData.fundingY >= 0 ? '+' : ''}{hoverData.fundingY.toFixed(2)} {fundingUnit === 'yr' ? '%/yr' : 'bps'}
            </span>
          </div>
        </div>
      )}

      {/* Footnote text matching the reference screenshot */}
      <div className="mt-3 text-[11px] text-[#6b7280] leading-relaxed border-t border-[#1f242d] pt-2.5">
        Hyperliquid's premium index uses impact prices, not the mark: P = [max(impactBid − oracle, 0) − max(oracle − impactAsk, 0)] / oracle, sampled every 5 s and averaged over the hour. Mark − oracle is a proxy; the chart assumes the premium holds steady for the whole hour.
      </div>
    </div>
  )
}
