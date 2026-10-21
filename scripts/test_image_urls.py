import urllib.request
import json

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev = json.load(f)

test_contracts = [
    'MT/DGOP/FAISMUN/LPN-104/2026',
    'MT/DGOP/FEFOM/LPN-105/2026',
    'MT/DGOP/FEFOM/LPN-106/2026',
    'MT/DGOP/FEFOM/LPN-107/2026',
    'MT/DGOP/FEFOM/LPN-110/2026',
    'MT/DGOP/FEFOM/LPN-111/2026',
    'MT/DGOP/FEFOM/LPN-112/2026',
    'MT/DGOP/FEFOM/LPN-114/2026',
    'MT/DGOP/FEFOM/LPN-116/2026'
]

for c in test_contracts:
    data = ev.get(c)
    if not data:
        print(f"Missing {c}")
        continue
    inicio = data['fotos']['inicio']
    proceso = data['fotos']['proceso']
    print(f"\nTesting {c}:")
    if inicio:
        try:
            req = urllib.request.Request(inicio, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as r:
                print(f"  [OK] Inicio: {r.status} (Content-Length: {r.headers.get('Content-Length')})")
        except Exception as e:
            print(f"  [ERR] Inicio: {e} | URL: {inicio}")
    for p in proceso:
        try:
            req = urllib.request.Request(p, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as r:
                print(f"  [OK] Proceso: {r.status} (Content-Length: {r.headers.get('Content-Length')})")
        except Exception as e:
            print(f"  [ERR] Proceso: {e} | URL: {p}")
