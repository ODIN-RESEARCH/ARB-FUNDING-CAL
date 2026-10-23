# Funding Arbitrage Calculator (Hyperliquid & MT5)

A real-time analytics and simulation dashboard that models Hyperliquid perpetual funding rates against underlying Oracle/MT5 prices, visualizes the interest-rate floor and slopes, and calculates delta-neutral funding arbitrage returns against MetaTrader 5 (MT5) broker swaps.

---

## 📸 Overview & Purpose

Perpetual funding rate arbitrage (cash-and-carry or cross-venue carry trades) matches positions on Hyperliquid against opposing hedge positions on traditional venues like MetaTrader 5 (MT5 forex/metals broker accounts).

* **Core Premise**:
  * If you go **Long on Hyperliquid** with funding rate $-10\%/\text{year}$, longs receive or pay funding depending on the sign.
  * To break even on a delta-neutral hedge, you must make at least $+10\%/\text{year}$ on the opposing **Short position on MT5**.
  * Conversely, if Hyperliquid funding is positive ($+10.95\%/\text{year}$), **Shorting Hyperliquid** earns funding, and **Longing MT5** incurs swap cost (e.g. $-2.61\%/\text{year}$). Net yield = $+8.34\%/\text{year}$ risk-free delta-neutral carry.

---

## ⚡ Key Features

1. **Precision Hyperliquid Funding Curve**:
   * **Interest Rate Floor**: Fixed floor interest rate ($10.95\%/\text{yr}$ or $+0.125\text{ bps}/1\text{h}$, $+1.0\text{ bps}/8\text{h}$) bounded between $-4.0\text{ bps}$ and $+6.0\text{ bps}$.
   * **Slopes Outside Floor**: Piecewise linear transition with slope 1:
     $$\text{Funding}_{8\text{h}} = \begin{cases} P + 5.0\text{ bps} & \text{if } P < -4\text{ bps} \\ 1.0\text{ bps (Floor)} & \text{if } -4\text{ bps} \le P \le +6\text{ bps} \\ P - 5.0\text{ bps} & \text{if } P > +6\text{ bps} \end{cases}$$
   * **Hourly Cap**: Configurable cap (default $4.0\%/\text{h} = 400\text{ bps}/\text{h}$).

2. **Interactive SVG Visualization**:
   * **Dynamic X-Axis**: Toggle between Basis Points ($\pm 20, \pm 50, \pm 200\text{ bps}$) or Price Deviation ($\text{mark} - \text{oracle}$).
   * **Dynamic Y-Axis**: Annualized ($\%/\text{year}$), $8\text{h}$ equivalent ($\text{bps}/8\text{h}$), or $1\text{h}$ settled ($\text{bps}/1\text{h}$).
   * **Floor Band**: Translucent green region with floor rate annotation.
   * **MT5 Break-Even Thresholds**:
     * Long Swap break-even dotted line ($\text{MT5 long swap paid break-even}$).
     * Short Swap break-even dotted line ($\text{MT5 short swap earned break-even}$).
     * Purple vertical line marking MT5 Implied Fair Premium ($\text{Fair } -0.001$).
   * **Hover Crosshair & Click-to-Simulate**: Click anywhere on the curve to simulate custom price deviations.

3. **Live Hyperliquid API Integration**:
   * Direct connection to `https://api.hyperliquid.xyz/info`.
   * Real-time support for **HIP-3 builder DEXes** (`trade.xyz` with `xyz:EUR`, `xyz:JPY`, `xyz:GBP`, `xyz:GOLD`, `xyz:SILVER`, `xyz:SP500`, etc.) and native perps (`BTC`, `ETH`, `SOL`).
   * Live polling every 5s with pause/resume and fallback offline snapshots.

4. **MetaTrader 5 (MT5) Fair Value Engine**:
   * Pre-configured swap profiles for major FX and metals (`EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `XAGUSD`, `AUDUSD`).
   * Custom broker point input (swaps in points, point size, contract size).
   * Implied annual interest rate: $\frac{\text{short swap} - \text{long swap}}{2}$.
   * Broker markup calculation: $\frac{-\text{long swap} - \text{short swap}}{2}$.
   * No-carry band calculation ($[-4.96, -4.76]\text{ bps}$).

5. **Delta-Neutral Arbitrage PnL Simulator**:
   * Enter custom notional hedge capital (e.g. $\$10,000, \$50,000$).
   * Hourly, daily, and annual dollar yield projections.
   * Clear break-even conditions highlighting whether Strategy A (Short HL / Long MT5) or Strategy B (Long HL / Short MT5) earns carry.

---

## 🛠 Tech Stack

* **React 18** + **TypeScript**
* **Vite** (Build Tool & Dev Server)
* **Tailwind CSS** (Dark terminal aesthetic matching Hyperliquid)
* **Lucide React** (Vector icons)
* **Hyperliquid Public Info API**

---

## 🚀 1-Click Launch (For Clients & End Users)

**ZERO Node.js or npm required! Everything is pre-compiled and standalone.**

1. Simply **double-click** `START_CALCULATOR.bat` in the folder.
2. The dashboard will automatically open in your default browser at `http://localhost:5173`.
3. To exit: simply close the terminal window.

---

### Optional: Live MetaTrader 5 Bridge
If you have MetaTrader 5 installed on your machine and want live quote & swap streaming:
1. Ensure Python is installed (`python.org`).
2. Run `INSTALL_DEPENDENCIES.bat` once to install the official `MetaTrader5` Python package.
3. Launch `START_CALCULATOR.bat` — it will automatically detect MT5 and stream live tick quotes and broker swaps directly into the calculator.
4. If Python is not installed, the calculator operates seamlessly using the built-in Windows engine and pre-calibrated broker swap matrices.
