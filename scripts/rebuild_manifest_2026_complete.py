import json
import urllib.parse
import re

base_url = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/'

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    scanned = json.load(f)

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

def clean_key(s):
    if not s: return ''
    return re.sub(r'[\s/_-]+', '-', s.strip()).upper()

# Map all scanned folders by their LPN or number or clean name
scanned_map = []
for cat, folders in scanned.items():
    if cat == 'BACHEO':
        continue
    for fo_raw, fdata in folders.items():
        if fo_raw == '_DIRECT_FILES_':
            continue
        fo_clean = fo_raw.strip()
        files = fdata.get('files', [])
        if not files:
            continue
        
        # Extract LPN number if present
        m = re.search(r'LPN[-\s/]*(\d+)', fo_clean, re.IGNORECASE)
        lpn_num = int(m.group(1)) if m else None
        
        scanned_map.append({
            'cat': cat,
            'folder_raw': fo_raw,
            'folder_clean': fo_clean,
            'path': fdata.get('path', f"{cat}/{fo_raw}/"),
            'lpn_num': lpn_num,
            'files': files
        })

print(f"Total valid scanned folders: {len(scanned_map)}")

def build_photo_urls(cat, fo_raw, files):
    # Sort files naturally
    def sort_key(f):
        num_m = re.search(r'(\d+)', f)
        num = int(num_m.group(1)) if num_m else 0
        return (0 if 'inicio' in f.lower() or 'inicial' in f.lower() else 1 if 'proceso' in f.lower() else 2, num, f)

    files_sorted = sorted(files, key=sort_key)
    
    encoded_cat = urllib.parse.quote(cat.strip())
    # Note: fo_raw might have a leading space, keep exact character sequence for nginx!
    encoded_fo = urllib.parse.quote(fo_raw)
    folder_url = f"{base_url}{encoded_cat}/{encoded_fo}/"
    
    inicio_file = None
    proceso_files = []
    terminado_files = []
    
    for f in files_sorted:
        fl = f.lower()
        if 'termin' in fl or 'final' in fl:
            terminado_files.append(f)
        elif 'proceso' in fl or 'durante' in fl:
            proceso_files.append(f)
        elif 'inicio' in fl or 'inicial' in fl:
            if not inicio_file:
                inicio_file = f
            else:
                proceso_files.append(f)
        else:
            proceso_files.append(f)
            
    # Build URLs
    def make_url(fn):
        return f"{folder_url}{urllib.parse.quote(fn)}"
        
    inicio_url = make_url(inicio_file) if inicio_file else None
    proceso_urls = [make_url(fn) for fn in proceso_files]
    terminado_url = make_url(terminado_files[0]) if terminado_files else None
    
    return inicio_url, proceso_urls, terminado_url

# Now update manifest entries
updated_entries = 0
for k, entry in manifest.items():
    noc = entry.get('noContrato') or ''
    idc = entry.get('idContrato') or ''
    
    # Extract LPN number from entry
    m = re.search(r'LPN[-\s/]*(\d+)', noc or idc or k, re.IGNORECASE)
    entry_lpn = int(m.group(1)) if m else None
    
    # Try to find matching scanned folder
    match = None
    # 1. Exact LPN match
    if entry_lpn is not None:
        matches = [s for s in scanned_map if s['lpn_num'] == entry_lpn]
        if len(matches) == 1:
            match = matches[0]
        elif len(matches) > 1:
            # Pick best category or folder match
            entry_cat = entry.get('categoria', '').upper()
            cat_matches = [s for s in matches if s['cat'].upper() in entry_cat or entry_cat in s['cat'].upper()]
            match = cat_matches[0] if cat_matches else matches[0]
            
    # 2. Text match if no LPN
    if not match:
        for s in scanned_map:
            if clean_key(s['folder_clean']) in clean_key(noc) or clean_key(s['folder_clean']) in clean_key(idc):
                match = s
                break
                
    if match:
        inicio, proceso, terminado = build_photo_urls(match['cat'], match['folder_raw'], match['files'])
        entry['categoria'] = match['cat']
        entry['fotosFallback'] = {
            'inicio': inicio,
            'proceso': proceso,
            'terminado': terminado
        }
        # In fotos, preserve or update
        entry['fotos'] = {
            'inicio': inicio or entry['fotos'].get('inicio'),
            'proceso': proceso if len(proceso) >= len(entry['fotos'].get('proceso') or []) else entry['fotos'].get('proceso'),
            'terminado': terminado or entry['fotos'].get('terminado')
        }
        updated_entries += 1

print(f"Updated {updated_entries} entries in manifest!")

# Also check for any scanned folder that wasn't matched and add it
for s in scanned_map:
    lpn = s['lpn_num']
    if not lpn: continue
    
    # Check if exists in manifest
    exists = any(
        (re.search(r'LPN[-\s/]*(\d+)', (e.get('noContrato') or e.get('idContrato') or k), re.I) and 
         int(re.search(r'LPN[-\s/]*(\d+)', (e.get('noContrato') or e.get('idContrato') or k), re.I).group(1)) == lpn)
        for k, e in manifest.items()
    )
    if not exists:
        print(f"Adding completely new contract: LPN-{lpn} ({s['folder_clean']})")
        inicio, proceso, terminado = build_photo_urls(s['cat'], s['folder_raw'], s['files'])
        new_k = s['folder_clean']
        manifest[new_k] = {
            "idContrato": new_k,
            "noContrato": f"MT/DGOP/{new_k}",
            "nombreObra": s['folder_clean'],
            "tipoObra": s['cat'],
            "idEmpresa": None,
            "idDelegacion": None,
            "montoContratado": None,
            "fechaInicio": None,
            "fechaFin": None,
            "categoria": s['cat'],
            "fotos": {
                "inicio": inicio,
                "proceso": proceso,
                "terminado": terminado
            },
            "fotosFallback": {
                "inicio": inicio,
                "proceso": proceso,
                "terminado": terminado
            }
        }

with open('public/data/evidencias_obras_2026.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print("Saved updated public/data/evidencias_obras_2026.json successfully!")
