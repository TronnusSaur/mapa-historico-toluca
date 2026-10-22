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

cats = get_links(base)
keywords = ['INDEPENDENCIA', 'ZAPATA', 'QUIMICA', 'QUÍMICA', 'CUAUHTEMOC', 'CUAUHTÉMOC', 'ALAMEDA', 'DERIVADORA', 'FERNANDEZ', 'FERNÁNDEZ', '001', '002', '003', '004', '045']

print("Searching 2025 for keywords...")
found = []
for c in cats:
    folders = get_links(base + urllib.parse.quote(c))
    for fo in folders:
        fo_u = fo.upper()
        if any(k in fo_u for k in keywords):
            sub_files = get_links(base + urllib.parse.quote(c) + urllib.parse.quote(fo))
            found.append((c, fo, sub_files))
            print(f"Match: [{c}] {fo} -> {len(sub_files)} files")

if not found:
    print("None of the 5 missing obras have folders under those keywords in 2025.")
