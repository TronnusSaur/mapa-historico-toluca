import json
import urllib.parse

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    evs = json.load(f)

# Also let's check old public/data/evidencias_obras_2026.json
with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    current_manifest = json.load(f)

print("--- MATCHING SCANNED EVIDENCIAS FOR 104-116 ---")
found_contracts = {}

for num in range(104, 117):
    pattern = f"-{num:03d}-"
    matches = []
    for cat, folders in evs.items():
        for f_name, f_data in folders.items():
            if pattern in f_name or f"/{num:03d}/" in f_name or f"_{num:03d}" in f_name or f" {num:03d} " in f_name:
                matches.append((cat, f_name, f_data))
    found_contracts[num] = matches

for num, matches in found_contracts.items():
    if matches:
        for cat, fname, fdata in matches:
            print(f"Contract {num}: [{cat}] -> {fname} | Files: {fdata['files']}")
    else:
        print(f"Contract {num}: NO FOLDER FOUND on images server!")

print("\n--- ALL FOLDERS IN REHABILITACIÓN, CONSTRUCCIÓN, SENDEROS, CONCRETOS ---")
for cat in ['CONSTRUCCIÓN DE CARPETA ASFALTICA', 'CONCRETOS HIDRAULICOS', 'REHABILITACIÓN DE CARPETAS', 'SENDEROS Y PARQUES']:
    print(f"\n[{cat}]:")
    for fname in evs.get(cat, {}):
        print(f"  - {fname}")
