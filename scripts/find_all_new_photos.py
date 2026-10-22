import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    scanned_2026 = json.load(f)

with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev_2026 = json.load(f)

print("--- AUDITING ALL 2026 WORKS FOR NEW/UPDATED PHOTOS ---")
updates = []

base_url = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/'

for cat, folders in scanned_2026.items():
    if cat == 'BACHEO':
        continue # Bacheo is handled via bacheo data
    for f_name, f_data in folders.items():
        files = f_data['files']
        if not files:
            continue
            
        # Try to match with an entry in ev_2026
        # Matches by folder name in fotosFallback or clean id
        matched_k = None
        matched_obj = None
        
        for k, v in ev_2026.items():
            noc = (v.get('noContrato') or '').replace('/', '-').replace(' ', '-')
            idc = (v.get('idContrato') or '').replace('/', '-').replace(' ', '-')
            fb_inicio = v.get('fotosFallback', {}).get('inicio') or ''
            
            if f_name.lower() in fb_inicio.lower() or \
               f_name.lower() in noc.lower() or \
               f_name.lower() in idc.lower() or \
               (noc and noc.lower() in f_name.lower()):
                matched_k = k
                matched_obj = v
                break
                
        # Classify files
        inicio_f = [f for f in files if 'inicio' in f.lower() or 'inicial' in f.lower()]
        # Proceso: anything with proceso or 2 or durante
        proceso_f = [f for f in files if 'proceso' in f.lower() or 'durante' in f.lower() or ('2' in f and 'termin' not in f.lower()) or ('3' in f and 'termin' not in f.lower())]
        # Terminado:
        terminado_f = [f for f in files if 'termin' in f.lower() or 'final' in f.lower()]
        
        # Avoid putting inicio in proceso
        proceso_clean = [f for f in proceso_f if f not in inicio_f and f not in terminado_f]
        
        encoded_cat = urllib.parse.quote(cat)
        encoded_folder = urllib.parse.quote(f_name)
        
        new_inicio = f"{base_url}{encoded_cat}/{encoded_folder}/{urllib.parse.quote(inicio_f[0])}" if inicio_f else None
        new_proceso = [f"{base_url}{encoded_cat}/{encoded_folder}/{urllib.parse.quote(f)}" for f in proceso_clean]
        new_terminado = f"{base_url}{encoded_cat}/{encoded_folder}/{urllib.parse.quote(terminado_f[0])}" if terminado_f else None
        
        if matched_obj:
            curr_inicio = matched_obj['fotos'].get('inicio')
            curr_proceso = matched_obj['fotos'].get('proceso') or []
            curr_terminado = matched_obj['fotos'].get('terminado')
            
            changes = []
            if new_inicio and not curr_inicio:
                changes.append(f"INICIO: {new_inicio}")
            if len(new_proceso) > len(curr_proceso):
                changes.append(f"PROCESO: {len(new_proceso)} fotos (antes {len(curr_proceso)})")
            if new_terminado and not curr_terminado:
                changes.append(f"TERMINADO: {new_terminado}")
                
            if changes:
                updates.append({
                    "contractKey": matched_k,
                    "folder": f"[{cat}] {f_name}",
                    "changes": changes,
                    "new_inicio": new_inicio or curr_inicio,
                    "new_proceso": new_proceso if len(new_proceso) >= len(curr_proceso) else curr_proceso,
                    "new_terminado": new_terminado or curr_terminado
                })
        else:
            print(f"Unmatched folder with files: [{cat}] {f_name} -> {files}")

print(f"\nFound {len(updates)} works with NEW PHOTOS:")
for u in updates:
    print(f"\n* Obra: {u['contractKey']} ({u['folder']})")
    for c in u['changes']:
        print(f"   -> {c}")
