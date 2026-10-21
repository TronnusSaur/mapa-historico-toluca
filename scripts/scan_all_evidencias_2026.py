import urllib.request
import re
import urllib.parse
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/'

def get_links(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [l for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return []

categories = get_links(base)
print(f"Categories found ({len(categories)}):")

results = {}

for cat in categories:
    cat_url = base + cat
    cat_name = urllib.parse.unquote(cat).rstrip('/')
    subs = get_links(cat_url)
    results[cat_name] = {}
    print(f"\n[CAT] {cat_name} ({len(subs)} folders)")
    for s in subs:
        s_name = urllib.parse.unquote(s).rstrip('/')
        files = get_links(cat_url + s)
        files_clean = [urllib.parse.unquote(f) for f in files]
        results[cat_name][s_name] = {
            "path": f"{cat}{s}",
            "files": files_clean
        }
        if files_clean:
            print(f"  - {s_name}: {files_clean}")

with open("scripts/scanned_evidencias_2026.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\nSaved scan to scripts/scanned_evidencias_2026.json")
