"""
Local MT5 Bridge Service for Funding Arbitrage Calculator.
Streams live symbol prices, bid/ask spreads, and swap rates from your local MetaTrader 5 terminal
to the Funding Arbitrage Calculator dashboard.
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False


def get_mt5_symbol_data(symbol_name: str):
    if not MT5_AVAILABLE:
        return None

    if not mt5.initialize():
        return None

    # Try exact match or common suffixes (e.g. EURUSD, EURUSD.raw, EURUSDm)
    info = mt5.symbol_info(symbol_name)
    if not info:
        # Search symbols
        symbols = mt5.symbols_get()
        if symbols:
            matched = [s for s in symbols if symbol_name.upper() in s.name.upper()]
            if matched:
                info = matched[0]

    if not info:
        return None

    # Ensure symbol is selected in Market Watch for fresh ticks
    mt5.symbol_select(info.name, True)

    tick = mt5.symbol_info_tick(info.name)
    bid = tick.bid if tick else info.bid
    ask = tick.ask if tick else info.ask

    return {
        "symbol": info.name,
        "bid": float(bid or 0),
        "ask": float(ask or 0),
        "mid": float((bid + ask) / 2 if bid and ask else (bid or ask or 0)),
        "swap_long": float(info.swap_long),
        "swap_short": float(info.swap_short),
        "point": float(info.point),
        "digits": int(info.digits),
        "trade_contract_size": float(info.trade_contract_size or 100000),
        "currency_base": info.currency_base,
        "currency_profit": info.currency_profit,
        "swap_mode": int(info.swap_mode),
        "swap_rollover3days": int(info.swap_rollover3days)
    }


class MT5BridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/status":
            connected = False
            account_info = None
            if MT5_AVAILABLE and mt5.initialize():
                connected = True
                term = mt5.terminal_info()
                acc = mt5.account_info()
                account_info = {
                    "company": term.company if term else "MetaQuotes",
                    "server": acc.server if acc else "Unknown",
                    "login": acc.login if acc else 0
                }

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({
                    "connected": connected,
                    "mt5_available": MT5_AVAILABLE,
                    "account": account_info
                }).encode("utf-8")
            )

        elif path == "/symbol":
            sym = query.get("name", ["EURUSD"])[0]
            data = get_mt5_symbol_data(sym)

            self.send_response(200 if data else 404)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            if data:
                self.wfile.write(json.dumps(data).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"error": f"Symbol {sym} not found in MT5"}).encode("utf-8"))

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def log_message(self, format, *args):
        # Quiet logger
        pass


def run_bridge(port=5175):
    server = HTTPServer(("127.0.0.1", port), MT5BridgeHandler)
    print(f"MT5 Bridge Server running on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if MT5_AVAILABLE:
            mt5.shutdown()


if __name__ == "__main__":
    run_bridge()
