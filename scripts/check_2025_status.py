import json

with open('public/data/evidencias_obras_2025.json', 'r', encoding='utf-8') as f:
    ev_2025 = json.load(f)

print(f"Total entries in evidencias_obras_2025.json: {len(ev_2025)}")
keys_with_photos = [k for k, v in ev_2025.items() if v.get('fotos', {}).get('inicio') or v.get('fotosFallback', {}).get('inicio')]
print(f"Entries with photos: {len(keys_with_photos)}")

# Check contracts 103..116 in 2025
for n in range(103, 117):
    matches = [k for k, v in ev_2025.items() if f"-{n}" in k or f"/{n}" in k or f"_{n}" in k or f"-{n}-" in str(v.get('noContrato', ''))]
    if matches:
        for m in matches:
            v = ev_2025[m]
            f_in = v.get('fotos', {}).get('inicio') or v.get('fotosFallback', {}).get('inicio')
            f_fin = v.get('fotos', {}).get('terminado') or v.get('fotosFallback', {}).get('terminado')
            print(f"2025 - {n}: Key={m} | Inicio={bool(f_in)} | Terminado={bool(f_fin)}")
    else:
        print(f"2025 - {n}: NOT IN 2025 MANIFEST!")
