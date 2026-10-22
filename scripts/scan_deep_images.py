import urllib.request
import re
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/'

def get_links(url):
    try:
        req = urllib.request.Request(urllib.parse.quote(url, safe=':/?='), headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        return []

root_links = get_links(base)
print("Root links:", root_links)

# Check EVIDENCIAS DE OBRAS 2025
print("\n--- Scanning EVIDENCIAS DE OBRAS 2025 ---")
links_2025 = get_links(base + 'EVIDENCIAS DE OBRAS 2025/')
for f in links_2025:
    sub_url = base + 'EVIDENCIAS DE OBRAS 2025/' + f
    sub_files = get_links(sub_url)
    print(f"2025: {f} -> {sub_files}")

# Check files directly in 2026 categories
print("\n--- Checking files directly inside 2026 categories ---")
cats_2026 = get_links(base + 'EVIDENCIAS DE OBRAS 2026/')
for cat in cats_2026:
    cat_url = base + 'EVIDENCIAS DE OBRAS 2026/' + cat
    cat_items = get_links(cat_url)
    files_direct = [it for it in cat_items if not it.endswith('/')]
    folders = [it for it in cat_items if it.endswith('/')]
    if files_direct:
        print(f"Direct files in 2026/{cat}: {files_direct}")
    for fo in folders:
        fo_items = get_links(cat_url + fo)
        # Check if there are sub-subfolders or new files
        sub_subs = [s for s in fo_items if s.endswith('/')]
        if sub_subs:
            print(f"Sub-subfolders in {cat}/{fo}: {sub_subs}")

# Check SERVICIOS PUBLICOS 2026
print("\n--- Scanning SERVICIOS PUBLICOS 2026 ---")
sp_2026 = get_links(base + 'SERVICIOS PUBLICOS 2026/')
print("SP 2026 items:", sp_2026)

# Check EMERGENCIAS
print("\n--- Scanning EMERGENCIAS ---")
emergencias = get_links(base + 'EMERGENCIAS/')
print("Emergencias items:", emergencias[:10])
