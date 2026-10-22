import urllib.request
import json

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev = json.load(f)

test_contracts = [
    'MT/DGOP/FEFOM/LPN-108/2026',
    'MT/DGOP/FEFOM/LPN-109/2026',
    'MT/DGOP/FEFOM/LPN-113/2026',
    'MT/DGOP/FEFOM/LPN-115/2026'
]

for c in test_contracts:
    data = ev.get(c)
    if not data:
        print(f"Missing {c}")
        continue
    f = data.get('fotosFallback') or data.get('fotos') or {}
    inicio = f.get('inicio')
    proceso = f.get('proceso') or []
    print(f"\nTesting {c}:")
    if inicio:
        try:
            req = urllib.request.Request(inicio, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as r:
                print(f"  [OK 200] Inicio: (Content-Length: {r.headers.get('Content-Length')})")
        except Exception as e:
            print(f"  [ERR] Inicio: {e} | URL: {inicio}")
    for p in proceso:
        try:
            req = urllib.request.Request(p, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as r:
                print(f"  [OK 200] Proceso: (Content-Length: {r.headers.get('Content-Length')})")
        except Exception as e:
            print(f"  [ERR] Proceso: {e} | URL: {p}")
