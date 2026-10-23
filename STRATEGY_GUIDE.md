# ODIN RESEARCH · INSTITUTIONAL STRATEGY MANUAL
## Hyperliquid Perpetual Funding & MetaTrader 5 Delta-Neutral Arbitrage

**Author:** ODIN RESEARCH ([odinresearch.com](https://odinresearch.com))  
**Asset Classes:** Crypto Perpetuals, Builder FX (HIP-3), Metals, Indices & Forex CFDs  
**Execution Venues:** Hyperliquid Layer 1 & MetaTrader 5 (MT5) Institutional ECN Brokers  

---

## 1. Executive Summary

This strategy exploits pricing asymmetries between **Hyperliquid perpetual futures funding rates** and **traditional MetaTrader 5 (MT5) spot/CFD financing swaps**.

By entering simultaneous, opposing positions of equal notional value on Hyperliquid and MT5, the strategy eliminates directional market risk (achieving **delta neutrality**) while continuously collecting net positive cash flow from financing yield.

```
                    ┌──────────────────────────────────────────────┐
                    │          MARKET PRICE DEVIATION              │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │                                              │
         [Hyperliquid Perp Leg]                         [MT5 Spot/CFD Leg]
       • Sells when HL > Oracle                       • Buys on MT5 Broker
       • Collects HL Funding Yield                    • Pays MT5 Long Swap
                    │                                              │
                    └──────────────────────┬───────────────────────┘
                                           │
                                  [NET CARRY PROFIT]
                       Annualized Delta-Neutral Yield: +5% to +25%
```

---

## 2. Core Mathematical Foundations

### A. Hyperliquid Perpetual Funding Formula

Hyperliquid calculates and settles funding rates **hourly** on a peer-to-peer basis between longs and shorts. The hourly funding rate $F_{\text{1h}}$ is determined by a piecewise linear function anchored around an **Interest Rate Floor**:

1. **Premium Index ($P$)**:
   The premium measures the relative deviation between perpetual mark/impact prices and the oracle index price:
   $$P = \frac{\text{Mark Price} - \text{Oracle Price}}{\text{Oracle Price}} \times 10,000 \quad (\text{in basis points, bps})$$

2. **Interest Rate Floor Band**:
   Hyperliquid institutes a fixed interest-rate floor of **$+1.0\text{ bps}$ per 8 hours** ($+0.125\text{ bps}/1\text{h} = \mathbf{10.95\%/\text{year}}$) when the premium remains within $[-4.0\text{ bps}, +6.0\text{ bps}]$:
   $$F_{8\text{h}} = \begin{cases} 
   P + 5.0\text{ bps} & \text{if } P < -4.0\text{ bps} \\
   1.0\text{ bps} \quad (10.95\%/\text{yr}) & \text{if } -4.0\text{ bps} \le P \le +6.0\text{ bps} \quad (\text{Floor Band}) \\
   P - 5.0\text{ bps} & \text{if } P > +6.0\text{ bps}
   \end{cases}$$

3. **Hourly Settlement Conversion**:
   $$F_{\text{1h}} = \frac{F_{8\text{h}}}{8}$$
   $$\text{Annualized Funding \%} = F_{\text{1h}} \times 24 \times 365 \div 100$$

---

### B. MetaTrader 5 (MT5) Broker Swap Financing

Traditional FX brokers charge or credit daily financing swaps at 21:00/22:00 UTC rollover:

1. **Daily Cashflow per Base Unit**:
   $$\text{Daily Return} = \text{Swap Points} \times \text{Point Size}$$
   *Example: For EURUSD with swap long $-8.001$ points and point size $0.00001$:*
   $$\text{Daily Return} = -8.001 \times 0.00001 = -\$0.00008001 \text{ per EUR}$$

2. **Annualized Swap Percentage**:
   $$\text{Annualized Swap \%} = \frac{\text{Daily Return}}{\text{Oracle Price}} \times 365 \times 100$$
   *For EURUSD at $1.1192$:*
   $$\text{Swap Long Annualized} = \frac{-0.00008001}{1.1192} \times 365 \times 100 = \mathbf{-2.61\%/\text{year}}$$
   $$\text{Swap Short Annualized} = \frac{+0.00001301}{1.1192} \times 365 \times 100 = \mathbf{+0.42\%/\text{year}}$$

3. **MT5 Implied Rate & Broker Markup**:
   $$\text{Implied Annual Rate} = \frac{\text{Short Swap} - \text{Long Swap}}{2} = \frac{+0.42\% - (-2.61\%)}{2} = \mathbf{+1.52\%/\text{year}}$$
   $$\text{Broker Markup} = \frac{-\text{Long Swap} - \text{Short Swap}}{2} = \frac{2.61\% - 0.42\%}{2} = \mathbf{+1.09\%/\text{year}}$$

---

## 3. The Arbitrage Opportunity Matrix

| Scenario | Condition | Hyperliquid Leg | MT5 Leg | Carry Mechanics |
| :--- | :--- | :--- | :--- | :--- |
| **Strategy A (Primary)** | Live Premium > Fair Premium | **SHORT Perp** | **LONG Spot/CFD** | Earn $+10.95\%$ HL funding, pay $-2.61\%$ MT5 swap $\rightarrow$ **Net $+8.34\%/\text{yr}$ Yield** |
| **Strategy B (Discount)** | Live Premium < Fair Premium | **LONG Perp** | **SHORT Spot/CFD** | Pay negative/low HL funding, collect positive MT5 short swap |
| **No-Carry Band** | Between $-4.96$ & $-4.76\text{ bps}$ | *Flat / Neutral* | *Flat / Neutral* | Neither direction earns net positive carry |

### Break-Even Rule
* To execute **Strategy A** (Short HL / Long MT5), Hyperliquid funding must exceed the MT5 long swap cost:
  $$\text{Break-Even Target:} \quad F_{\text{HL}} > |\text{Swap}_{\text{MT5 Long}}|$$
* On EURUSD: Since MT5 long swap costs $2.61\%/\text{year}$, any Hyperliquid funding above $2.61\%$ generates pure carry profit. At the $10.95\%$ floor, the net profit is **$+8.34\%$ APY**.

---

## 4. Execution & Risk Management Playbook

### 1. Capital Allocation & Collateral Ratio
* Allocate **50% of capital** to Hyperliquid (USDC margin) and **50% of capital** to MT5 (USD account).
* Keep leverage moderate ($2\times$ to $5\times$) to prevent margin calls during short-term price excursions.

### 2. Triple Swap Wednesday Handling
* Traditional MT5 forex brokers charge/credit **$3\times$ swap on Wednesday night** to cover weekend rollover.
* Factor in Wednesday rollover timing when calculating short-term holding periods.

### 3. Rebalancing Protocol
* Because position values fluctuate in opposite directions, periodically rebalance capital between Hyperliquid and MT5 if one leg accumulates excessive profits while the other draws down collateral.

---

## 5. Using the Funding Arbitrage Calculator

1. **Select Hyperliquid Instrument**: Use the top searchable dropdown to pick any instrument (`xyz:EUR`, `xyz:GBP`, `xyz:JPY`, `xyz:GOLD`, etc.).
2. **Auto-Hedge Detection**: The calculator automatically pairs the matching MT5 asset (`EURUSD`, `XAUUSD`, etc.) and pulls live swaps.
3. **Simulate Position Sizing**: Enter your target capital (e.g., $\$10,000$, $\$50,000$) in the **Delta-Neutral Simulator** to view projected hourly, daily, and annual dollar returns.
4. **Interactive Curve**: Click anywhere on the curve to simulate custom premium shocks or mark price deviations.

---
*Developed by ODIN RESEARCH · [odinresearch.com](https://odinresearch.com)*
