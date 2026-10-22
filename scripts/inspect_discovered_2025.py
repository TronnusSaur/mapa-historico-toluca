import urllib.request
import re
import urllib.parse

base = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202025/'

def get_links(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        return []

folders_to_check = [
    'CANAL A CELO ABIERTO/MT-DGOP-IPDM-LPN-003-2025/',
    'SENDEROS Y PARQUES/MT-DGOP-AVGFYD-LP-001-2025/',
    'SENDEROS Y PARQUES/MT-DGOP-IPDM-LPN-045-2025/',
    'REHABILITACION DE CARPETAS/MT-DGOP-IPDM-IR-004-2025/',
    'REHABILITACION DE CARPETAS/MT-DGOP-IPDM-IR-002-2025/'
]

for f in folders_to_check:
    files = get_links(base + urllib.parse.quote(f))
    print(f"\n{f} ({len(files)} files):")
    print(files[:10])
