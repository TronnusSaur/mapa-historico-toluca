import urllib.request
import re
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_2025 = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS DE OBRAS 2025/'

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

with open('public/data/evidencias_obras_2025.json', 'r', encoding='utf-8') as f:
    manifest_2025 = json.load(f)

categories = get_links(base_2025)
print(f"2025 Categories ({len(categories)}):", categories)

scanned_2025 = {}
for cat in categories:
    folders = get_links(base_2025 + cat)
    scanned_2025[cat] = {}
    for fo in folders:
        files = get_links(base_2025 + cat + fo)
        scanned_2025[cat][fo] = files
        print(f"  [{cat}] {fo} -> {files}")

with open('scripts/scanned_evidencias_2025.json', 'w', encoding='utf-8') as f:
    json.dump(scanned_2025, f, indent=2, ensure_ascii=False)

print("\nSaved scanned_evidencias_2025.json")
