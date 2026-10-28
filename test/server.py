"""Local test server: serves dist/ with test/mock-supabase.js injected, so the app
runs against a copy of a backup instead of the production Supabase project.

Usage: python3 test/server.py [backup-folder] [port]
"""
import http.server, json, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
backups = sorted((root / 'backups').glob('*/'))
backup = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else backups[-1]
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8790
dist = root / 'dist'

def seed():
    tables = {}
    for f in backup.glob('*.json'):
        if f.stem != 'photos-index':
            tables[f.stem] = json.loads(f.read_text())
    photos = [l for l in (backup / 'photos-index.txt').read_text().splitlines() if l.strip()]
    return {'tables': tables, 'photos': photos, 'backupAt': backup.name}

MISSING = b'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#ccc"/></svg>'

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(dist), **kw)

    def send(self, body, ctype):
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split('?')[0]
        if path in ('/', '/index.html'):
            html = (dist / 'index.html').read_text()
            html = html.replace('<head>', '<head><script src="/__test__/mock-supabase.js"></script>', 1)
            return self.send(html.encode(), 'text/html; charset=utf-8')
        if path == '/__test__/mock-supabase.js':
            return self.send((root / 'test/mock-supabase.js').read_bytes(), 'text/javascript')
        if path == '/__test__/seed.json':
            return self.send(json.dumps(seed()).encode(), 'application/json')
        if path == '/__test__/missing.svg':
            return self.send(MISSING, 'image/svg+xml')
        if path.startswith('/__test__/photos/'):
            from urllib.parse import unquote
            f = (backup / 'photos' / unquote(path[len('/__test__/photos/'):])).resolve()
            if f.is_file() and backup in f.parents:
                return self.send(f.read_bytes(), self.guess_type(str(f)))
            return self.send(MISSING, 'image/svg+xml')
        if path == '/sw.js':  # no service worker in tests: it would outlive the mock
            return self.send(b'self.addEventListener("install",()=>self.skipWaiting())', 'text/javascript')
        return super().do_GET()

print(f'Testumgebung: http://localhost:{port}/  (Backup: {backup.name})')
http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
