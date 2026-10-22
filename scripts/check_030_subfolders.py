import urllib.request
import re
import urllib.parse

base = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202025/CONCRETOS%20ECOLOGICOS/MT-DGOP-FAISMUN-LPN-030-2025/'

def get_links(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        return []

for s in ['CALLE ISLAS DE LAS AVES/', 'CALLE NEVADO/', 'CALLE POPOCATEPETL/']:
    files = get_links(base + urllib.parse.quote(s))
    print(f"Files in {s}: {files}")
