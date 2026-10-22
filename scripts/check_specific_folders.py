import urllib.request
import re
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/'

def get_links(url):
    try:
        # url should be clean, we quote once
        clean_url = urllib.parse.unquote(url)
        quoted_url = urllib.parse.quote(clean_url, safe=':/?=')
        req = urllib.request.Request(quoted_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            links = re.findall(r'href="([^"]+)"', html)
            return [urllib.parse.unquote(l) for l in links if not l.startswith('?') and l != '../']
    except Exception as e:
        print(f"Error {url}: {e}")
        return []

base = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS DE OBRAS 2026/'

# Check LINEAS DE DRENAJE
items_drenaje = get_links(base + 'LINEAS DE DRENAJE/')
print("Items in LINEAS DE DRENAJE:", items_drenaje)
for it in items_drenaje:
    sub = get_links(base + 'LINEAS DE DRENAJE/' + it)
    print(f"  Inside {it}: {sub}")

# Check REHABILITACIÓN DE POZO
items_pozo = get_links(base + 'REHABILITACIÓN DE POZO/')
print("\nItems in REHABILITACIÓN DE POZO:", items_pozo)

# Check CONCRETOS ECOLOGICOS 066
conc_066 = get_links(base + 'CONCRETOS ECOLOGICOS/MT-DGOP-FAISMUN-LPN-066-2026/')
print("\nFiles in 066:", conc_066)

# Check SEÑALAMIENTO
items_sen = get_links(base + 'SEÑALAMIENTO/')
print("\nItems in SEÑALAMIENTO:", items_sen)
for s in items_sen:
    sub = get_links(base + 'SEÑALAMIENTO/' + s)
    print(f"  Inside {s}: {sub}")

# Check all categories for any folder containing 108, 109, 113, 115
print("\n--- Search 108, 109, 113, 115 in all categories ---")
cats = get_links(base)
for cat in cats:
    subfolders = get_links(base + cat)
    for s in subfolders:
        for num in ['108', '109', '113', '115']:
            if num in s:
                print(f"FOUND {num} in [{cat}] -> {s}")
