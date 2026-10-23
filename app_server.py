"""
ODIN RESEARCH - Unified Standalone Server for Funding Arbitrage Calculator.
Zero Node.js / Zero npm required!
Serves the web application (dist/) and the live MetaTrader 5 bridge.
"""

import os
import sys
import time
import json
import webbrowser
import threading
import mimetypes
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

# Set up MIME types
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("image/x-icon", ".ico")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")
mimetypes.add_type("font/ttf", ".ttf")
mimetypes.add_type("application/json", ".json")

# Try importing MetaTrader5 (optional)
try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False

_mt5_connected = False
_last_mt5_check = 0.0

def check_mt5_connection() -> bool:
    global _mt5_connected, _last_mt5_check
    now = time.time()
    if now - _last_mt5_check < 4.0:
        return _mt5_connected

    _last_mt5_check = now
    if not MT5_AVAILABLE:
        _mt5_connected = False
        return False

    try:
        term = mt5.terminal_info()
        if term is not None:
            _mt5_connected = True
            return True
        _mt5_connected = bool(mt5.initialize())
        return _mt5_connected
    except Exception:
        _mt5_connected = False
        return False


def get_mt5_symbol_data(symbol_name: str):
    if not check_mt5_connection():
        return None

    info = mt5.symbol_info(symbol_name)
    if not info:
        symbols = mt5.symbols_get()
        if symbols:
            matched = [s for s in symbols if symbol_name.upper() in s.name.upper()]
            if matched:
                info = matched[0]

    if not info:
        return None

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


class UnifiedAppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.dist_dir = os.path.join(script_dir, "dist")
        super().__init__(*args, directory=self.dist_dir, **kwargs)

    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Handle API Routes for MT5
        if path == "/status":
            connected = check_mt5_connection()
            account_info = None
            if connected:
                try:
                    term = mt5.terminal_info()
                    acc = mt5.account_info()
                    account_info = {
                        "company": term.company if term else "MetaQuotes",
                        "server": acc.server if acc else "Unknown",
                        "login": acc.login if acc else 0
                    }
                except Exception:
                    pass

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(
                json.dumps({
                    "connected": connected,
                    "mt5_available": MT5_AVAILABLE,
                    "account": account_info
                }).encode("utf-8")
            )
            return

        if path == "/symbol":
            sym = query.get("name", ["EURUSD"])[0]
            data = get_mt5_symbol_data(sym)

            self.send_response(200 if data else 404)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            if data:
                self.wfile.write(json.dumps(data).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"error": f"Symbol {sym} not found in MT5"}).encode("utf-8"))
            return

        # Serve static files from dist/ with SPA fallback
        clean_path = path.lstrip("/")
        if not clean_path:
            clean_path = "index.html"

        file_path = os.path.join(self.dist_dir, clean_path.replace("/", os.sep))
        if not os.path.isfile(file_path):
            # SPA Fallback
            file_path = os.path.join(self.dist_dir, "index.html")

        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode("utf-8"))

    def log_message(self, format, *args):
        pass  # Quiet logger


class BridgeOnlyHandler(SimpleHTTPRequestHandler):
    """Also listens on port 5175 for backwards compatibility with existing frontend calls"""
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/status":
            connected = check_mt5_connection()
            account_info = None
            if connected:
                try:
                    term = mt5.terminal_info()
                    acc = mt5.account_info()
                    account_info = {
                        "company": term.company if term else "MetaQuotes",
                        "server": acc.server if acc else "Unknown",
                        "login": acc.login if acc else 0
                    }
                except Exception:
                    pass

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(
                json.dumps({
                    "connected": connected,
                    "mt5_available": MT5_AVAILABLE,
                    "account": account_info
                }).encode("utf-8")
            )
            return

        if path == "/symbol":
            sym = query.get("name", ["EURUSD"])[0]
            data = get_mt5_symbol_data(sym)

            self.send_response(200 if data else 404)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            if data:
                self.wfile.write(json.dumps(data).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"error": f"Symbol {sym} not found in MT5"}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        pass


def run_servers():
    print("=====================================================================")
    print("           ODIN RESEARCH - FUNDING ARBITRAGE CALCULATOR              ")
    print("              Standalone Server (Zero NPM / Zero Node)               ")
    print("=====================================================================")
    print("")

    # Start 5175 bridge in background thread
    try:
        bridge_server = ThreadedHTTPServer(("127.0.0.1", 5175), BridgeOnlyHandler)
        t = threading.Thread(target=bridge_server.serve_forever, daemon=True)
        t.start()
        print("  [OK] MT5 Bridge active on http://127.0.0.1:5175")
    except Exception as e:
        print(f"  [NOTE] Port 5175 already in use or unavailable: {e}")

    # Start main web server on 5173
    web_port = 5173
    web_server = None
    for p in [5173, 5174, 5176, 5177, 8080, 8088, 3000]:
        try:
            web_server = ThreadedHTTPServer(("127.0.0.1", p), UnifiedAppHandler)
            web_port = p
            break
        except Exception:
            continue

    if not web_server:
        print("[ERROR] Could not bind to any web port.")
        sys.exit(1)

    url = f"http://localhost:{web_port}"
    print(f"  [OK] Dashboard running on {url}")
    print("  [OK] Opening browser...")
    print("")
    print("=====================================================================")
    print("  STATUS: Running smoothly! Leave this window open while using.")
    print("  To close: simply close this console window.")
    print("=====================================================================")

    webbrowser.open(url)

    # Warm up MT5 connection in background without delaying browser launch
    threading.Thread(target=check_mt5_connection, daemon=True).start()

    try:
        web_server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if MT5_AVAILABLE:
            try:
                mt5.shutdown()
            except Exception:
                pass


if __name__ == "__main__":
    run_servers()
