import json

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev = json.load(f)

print("=== CHECKING LPN 104-116 IN UPDATED MANIFEST ===")
for n in range(104, 117):
    # Find entry
    matches = []
    for k, v in ev.items():
        noc = v.get('noContrato') or ''
        idc = v.get('idContrato') or ''
        if f"-{n}/" in noc or f"-{n}-" in noc or f"-{n}/" in idc or f"-{n}-" in idc or f"-{n}" in k:
            matches.append((k, v))
            
    print(f"\n--- LPN-{n} ---")
    if matches:
        for k, v in matches:
            f = v.get('fotosFallback') or v.get('fotos') or {}
            inicio = bool(f.get('inicio'))
            proceso = len(f.get('proceso') or [])
            terminado = bool(f.get('terminado'))
            print(f"Key: {k}")
            print(f"  Contrato: {v.get('noContrato')}")
            print(f"  Categoria: {v.get('categoria')}")
            print(f"  Inicio: {inicio} ({f.get('inicio')})")
            print(f"  Proceso: {proceso} fotos ({f.get('proceso')})")
            print(f"  Terminado: {terminado} ({f.get('terminado')})")
    else:
        print("  NO MATCH FOUND!")
