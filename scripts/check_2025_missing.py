import urllib.request
import re
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS DE OBRAS 2025/'

def get_links(url):
    try:
        req = urllib.request.Request(urllib.parse.quote(url, safe=':/'), headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return []

links_2025 = get_links(base)
print(f"Folders in 2025: {len(links_2025)}")
for l in links_2025:
    if any(k in l for k in ['108', '109', '113', '115', 'ADOLFO LÓPEZ', 'ANTONIO ALBARRÁN', 'REFORMA', 'TIANGUISTENCO']):
        print(f"  Match 2025: {l}")
