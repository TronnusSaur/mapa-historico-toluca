import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    scanned = json.load(f)

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

print("=== CHECKING ALL 2026 FOLDERS VS MANIFEST ===")
all_folders_scanned = []
for cat, folders in scanned.items():
    for fname, fdata in folders.items():
        all_folders_scanned.append((cat, fname, fdata['files']))

print(f"Total scanned folders in 2026: {len(all_folders_scanned)}")

# Check for files added that are not reflected in manifest
for cat, fname, files in all_folders_scanned:
    # Try to find matching entry in manifest
    matched_entry = None
    matched_k = None
    for k, entry in manifest.items():
        if fname.lower() in str(entry.get('fotosFallback', {}).get('inicio', '')).lower() or \
           fname.lower() in str(entry.get('fotos', {}).get('inicio', '')).lower() or \
           fname.replace('-', '/').lower() in str(entry.get('noContrato', '')).lower():
            matched_entry = entry
            matched_k = k
            break
            
    if matched_entry:
        # Check files
        m_inicio = matched_entry['fotos'].get('inicio')
        m_proceso = matched_entry['fotos'].get('proceso') or []
        m_terminado = matched_entry['fotos'].get('terminado')
        
        # Check if files has something not in manifest
        has_terminado_file = any('termin' in f.lower() or 'final' in f.lower() for f in files)
        if has_terminado_file and not m_terminado:
            print(f"🌟 NUEVA FOTO TERMINADO en [{cat}] {fname} -> {files} (Manifest no tiene terminado!)")
        
        has_proceso_file = any('proceso' in f.lower() or 'durante' in f.lower() or '2' in f for f in files)
        if has_proceso_file and len(m_proceso) == 0:
            print(f"🌟 NUEVA FOTO PROCESO en [{cat}] {fname} -> {files} (Manifest no tiene proceso!)")
    else:
        print(f"❓ CARPETA NO ASOCIADA EN MANIFEST: [{cat}] {fname} -> {files}")
