import { HyperliquidAsset } from '../types/calculator'

const HL_API_URL = 'https://api.hyperliquid.xyz/info'

// Fallback snapshot matching screenshot exactly if network fails or offline
export const FALLBACK_ASSET_EUR: HyperliquidAsset = {
  name: 'xyz:EUR',
  dex: 'xyz',
  markPx: 1.1197,
  oraclePx: 1.1192,
  midPx: 1.11945,
  funding: 0.0000076, // +0.076 bps / 1h from API
  premium: 0.000491, // +4.91 bps from API
  impactPxs: [1.11945, 1.1197],
  dayNtlVlm: 2294110.5,
  openInterest: 23281595.0,
  lastUpdated: Date.now()
}

export interface DexInfo {
  name: string
  fullName?: string
}

export async function fetchPerpDexs(): Promise<DexInfo[]> {
  try {
    const res = await fetch(HL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'perpDexs' })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      return data
        .filter((d) => d && d.name)
        .map((d) => ({
          name: d.name,
          fullName: d.fullName || d.name
        }))
    }
    return [{ name: 'xyz', fullName: 'trade.xyz' }]
  } catch (err) {
    console.warn('Failed to fetch perpDexs, using default:', err)
    return [
      { name: 'xyz', fullName: 'trade.xyz' },
      { name: 'cash', fullName: 'dreamcash' },
      { name: 'km', fullName: 'Kinetiq Markets' },
      { name: 'para', fullName: 'Paragon' }
    ]
  }
}

export async function fetchAssetsForDex(dex?: string): Promise<HyperliquidAsset[]> {
  try {
    const payload = dex ? { type: 'metaAndAssetCtxs', dex } : { type: 'metaAndAssetCtxs' }
    const res = await fetch(HL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    if (Array.isArray(data) && data.length >= 2) {
      const meta = data[0]
      const ctxs = data[1]
      const assets: HyperliquidAsset[] = []

      for (let i = 0; i < meta.universe.length; i++) {
        const u = meta.universe[i]
        const c = ctxs[i]
        if (!u || !c) continue

        const markPx = parseFloat(c.markPx || c.midPx || c.oraclePx || '0')
        const oraclePx = parseFloat(c.oraclePx || '0')
        const midPx = parseFloat(c.midPx || c.markPx || '0')
        const funding = parseFloat(c.funding || '0')
        const premium = parseFloat(c.premium || '0')
        const impactPxs: [number, number] = Array.isArray(c.impactPxs) && c.impactPxs.length >= 2
          ? [parseFloat(c.impactPxs[0]), parseFloat(c.impactPxs[1])]
          : [markPx, markPx]

        assets.push({
          name: u.name,
          dex,
          markPx,
          oraclePx,
          midPx,
          funding,
          premium,
          impactPxs,
          dayNtlVlm: parseFloat(c.dayNtlVlm || '0'),
          openInterest: parseFloat(c.openInterest || '0'),
          lastUpdated: Date.now()
        })
      }
      return assets
    }
    return []
  } catch (err) {
    console.warn(`Failed to fetch assets for dex ${dex || 'default'}:`, err)
    return []
  }
}

export async function fetchAllDefaultAssets(customDex?: string): Promise<HyperliquidAsset[]> {
  try {
    const promises: Promise<HyperliquidAsset[]>[] = [
      fetchAssetsForDex('xyz'), // trade.xyz TradFi, FX, Metals, Equities (~136 pairs)
      fetchAssetsForDex(undefined) // Native L1 crypto perps (~234 pairs: BTC, ETH, SOL, etc.)
    ]
    if (customDex && customDex !== 'xyz') {
      promises.push(fetchAssetsForDex(customDex))
    }
    const results = await Promise.all(promises)
    const combined: HyperliquidAsset[] = []
    const seen = new Set<string>()

    for (const list of results) {
      for (const asset of list) {
        if (!seen.has(asset.name)) {
          seen.add(asset.name)
          combined.push(asset)
        }
      }
    }
    return combined.length > 0 ? combined : [FALLBACK_ASSET_EUR]
  } catch (err) {
    console.warn('Failed to fetch all default assets:', err)
    return [FALLBACK_ASSET_EUR]
  }
}

export async function fetchSingleAsset(assetName: string, customDex?: string): Promise<HyperliquidAsset | null> {
  // Determine if it has a prefix like "xyz:EUR"
  let dex = customDex
  if (!dex && assetName.includes(':')) {
    dex = assetName.split(':')[0]
  }

  const assets = await fetchAssetsForDex(dex)
  const found = assets.find((a) => a.name.toLowerCase() === assetName.toLowerCase())
  return found || null
}
