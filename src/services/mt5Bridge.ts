export interface MT5LiveQuote {
  symbol: string
  bid: number
  ask: number
  mid: number
  swap_long: number
  swap_short: number
  point: number
  digits: number
  trade_contract_size: number
}

export interface MT5BridgeStatus {
  connected: boolean
  mt5_available?: boolean
  account?: {
    company: string
    server: string
    login: number
  }
}

export async function fetchLiveMT5Status(): Promise<MT5BridgeStatus> {
  try {
    const res = await fetch('http://127.0.0.1:5175/status', {
      signal: AbortSignal.timeout(1500)
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Bridge offline
  }
  return { connected: false }
}

export async function fetchLiveMT5Symbol(symbolName: string): Promise<MT5LiveQuote | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:5175/symbol?name=${encodeURIComponent(symbolName)}`,
      { signal: AbortSignal.timeout(1500) }
    )
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Bridge offline
  }
  return null
}
