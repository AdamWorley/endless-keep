#!/usr/bin/env python3
"""Serves ../dist for local testing of the installable (PWA) build: python3 pwa/serve.py [port]"""
import http.server, os, sys
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8420
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")
class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webmanifest": "application/manifest+json", ".js": "text/javascript", ".svg": "image/svg+xml"}
    def __init__(self, *a, **k): super().__init__(*a, directory=root, **k)
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")  # always pick up a fresh build; the service worker handles offline
        super().end_headers()
print(f"Endless Keep on http://localhost:{port}/", flush=True)
http.server.ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
