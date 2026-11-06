"""Serve the prebuilt site locally with Python 3; no package install required."""
import http.server
import functools
import sys
from pathlib import Path
root = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist').resolve()
if not (root / 'index.html').exists():
    raise SystemExit('dist/index.html not found; run from the extracted package root.')
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
print('Liaoyu Zhice: http://127.0.0.1:4173')
http.server.ThreadingHTTPServer(('127.0.0.1', 4173), handler).serve_forever()
