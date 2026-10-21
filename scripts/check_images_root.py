import urllib.request
import re
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/'

def get_links(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return []

root_links = get_links(base)
print("Root folders on imagenes server:")
for r in root_links:
    print(f" - {r}")
