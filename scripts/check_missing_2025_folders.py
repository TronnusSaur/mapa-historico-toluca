import urllib.request
import re
import urllib.parse
import json

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

# Check 030
url_030 = base + urllib.parse.quote('CONCRETOS ECOLOGICOS/MT-DGOP-FAISMUN-LPN-030-2025/')
files_030 = get_links(url_030)
print(f"Files in 030: {files_030}")

# Search for 001, 002, 003, 004, 045 in all 2025 categories
cats = get_links(base)
for cat in cats:
    folders = get_links(base + cat)
    for fo in folders:
        for target in ['001', '002', '003', '004', '045']:
            if target in fo:
                sub_files = get_links(base + cat + fo)
                print(f"Found {target} in [{cat}] {fo} -> {sub_files}")
