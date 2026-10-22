import urllib.request
import re
import urllib.parse
import json
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/'

def get_links_with_header(url):
    try:
        clean = urllib.parse.unquote(url)
        q = urllib.parse.quote(clean, safe=':/?=')
        req = urllib.request.Request(q, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            last_mod = r.headers.get('Last-Modified')
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../'], last_mod
    except Exception as e:
        return [], None

print("Checking 2026 categories and files for recent modifications...")

cats, _ = get_links_with_header(base + 'EVIDENCIAS DE OBRAS 2026/')
recent_files = []

for c in cats:
    folders, _ = get_links_with_header(base + 'EVIDENCIAS DE OBRAS 2026/' + c)
    for fo in folders:
        url_fo = base + 'EVIDENCIAS DE OBRAS 2026/' + c + fo
        files, fo_mod = get_links_with_header(url_fo)
        for fi in files:
            file_url = url_fo + fi
            try:
                q_file = urllib.parse.quote(urllib.parse.unquote(file_url), safe=':/?=')
                req = urllib.request.Request(q_file, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    mod = resp.headers.get('Last-Modified')
                    if mod and ('21 Oct 2026' in mod or '22 Oct 2026' in mod):
                        recent_files.append((c, fo, fi, mod, resp.headers.get('Content-Length')))
            except Exception as e:
                pass

print(f"\n--- RECENT FILES UPLOADED TODAY ({len(recent_files)}) ---")
for c, fo, fi, mod, sz in recent_files:
    print(f"[{c}] {fo}{fi} | Mod: {mod} | Size: {sz}")

if not recent_files:
    print("No files with Last-Modified 21/22 Oct 2026 found in 2026 obras.")
