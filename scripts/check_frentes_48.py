import urllib.request
import re
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/'

def get_links(url):
    try:
        clean = urllib.parse.unquote(url)
        q = urllib.parse.quote(clean, safe=':/?=')
        req = urllib.request.Request(q, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        return []

frentes = get_links(base + 'FRENTES_48/')
print(f"Items in FRENTES_48 ({len(frentes)}):")
for f in frentes[:30]:
    sub = get_links(base + 'FRENTES_48/' + f)
    print(f"  {f} -> {sub}")
