import urllib.request
import re
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_img = 'https://imagenes.soranoserver.com/imagenes/'

def get_links(url):
    try:
        clean = urllib.parse.unquote(url)
        quoted = urllib.parse.quote(clean, safe=':/?=')
        req = urllib.request.Request(quoted, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return []

root_items = get_links(base_img)
print(f"Root items on images server ({len(root_items)}):")
for r in root_items:
    print(f" - {r}")

results_2026 = {}
ev_2026_url = base_img + 'EVIDENCIAS DE OBRAS 2026/'
cats_2026 = get_links(ev_2026_url)
print(f"\n2026 Categories ({len(cats_2026)}):")

for cat in cats_2026:
    cat_name = cat.rstrip('/')
    results_2026[cat_name] = {}
    items = get_links(ev_2026_url + cat)
    
    # Separate files vs subfolders
    direct_files = [it for it in items if not it.endswith('/')]
    subfolders = [it for it in items if it.endswith('/')]
    
    if direct_files:
        results_2026[cat_name]["_DIRECT_FILES_"] = {
            "path": cat,
            "files": direct_files
        }
        print(f"  [CAT {cat_name}] Direct files: {direct_files}")
        
    for fo in subfolders:
        fo_name = fo.rstrip('/')
        files = get_links(ev_2026_url + cat + fo)
        results_2026[cat_name][fo_name] = {
            "path": f"{cat}{fo}",
            "files": files
        }
        if files:
            print(f"  [{cat_name}] -> {fo_name}: {files}")

with open("scripts/scanned_evidencias_2026.json", "w", encoding="utf-8") as f:
    json.dump(results_2026, f, indent=2, ensure_ascii=False)

print("\nSuccessfully updated scripts/scanned_evidencias_2026.json")
