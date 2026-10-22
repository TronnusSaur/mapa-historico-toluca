import json

with open("scripts/scanned_evidencias_2026.json", "r", encoding="utf-8") as f:
    scanned = json.load(f)

print("Categories and folder counts:")
for cat, folders in scanned.items():
    print(f"[{cat}]: {len(folders)} items")
    for fname, fdata in list(folders.items())[:15]:
        print(f"   {fname}: {len(fdata['files'])} files -> {fdata['files'][:4]}")

# Search for 108, 109, 113, 115
print("\n--- Search for 104-116 in scanned: ---")
for cat, folders in scanned.items():
    for fname, fdata in folders.items():
        for n in range(104, 117):
            if f"-{n}-" in fname or f"-{n} " in fname or f"/{n}" in fname or f"_{n}" in fname or f"-{n}/" in fname or fname.endswith(f"-{n}"):
                print(f"LPN-{n}: [{cat}] '{fname}' -> {fdata['files']}")
