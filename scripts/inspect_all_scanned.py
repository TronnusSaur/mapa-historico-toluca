import json

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for cat, folders in data.items():
    print(f"\n=== {cat} ({len(folders)}) ===")
    for f_name, f_data in folders.items():
        print(f"  - {f_name}: {f_data['files']}")
