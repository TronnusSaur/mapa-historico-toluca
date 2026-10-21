import json
import urllib.parse

# Load new_tramos_analysis.json
with open('scripts/new_tramos_analysis.json', 'r', encoding='utf-8') as f:
    tramos = json.load(f)

# Load current evidencias_obras_2026.json
with open('public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    ev_catalog = json.load(f)

base_img_url = 'https://imagenes.soranoserver.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026/'

added_count = 0
for t in tramos:
    cid = t['idContrato']
    noc = t['noContrato']
    nombre = t['nombre']
    tipo = t['tipo']
    ev_list = t['evidencias']
    
    fotos_inicio = None
    fotos_proceso = []
    fotos_terminado = None
    cat_name = None
    
    if ev_list:
        ev = ev_list[0]
        cat_name = ev['category']
        folder = ev['folder']
        files = ev['files']
        
        # Determine files
        # Sort or identify inicio vs proceso
        inicio_files = [f for f in files if 'inicio' in f.lower() or 'inicial' in f.lower()]
        proceso_files = [f for f in files if 'proceso' in f.lower() or 'durante' in f.lower()]
        terminado_files = [f for f in files if 'termin' in f.lower() or 'final' in f.lower()]
        
        # If files are named INICIO.jpeg, INICIO2.jpeg, INICIO3.jpeg
        if not proceso_files and any('2' in f or '3' in f for f in files):
            # INICIO is inicio, INICIO2 and INICIO3 are proceso
            for f in files:
                encoded_f = urllib.parse.quote(f)
                file_url = f"{base_img_url}{urllib.parse.quote(cat_name)}/{urllib.parse.quote(folder)}/{encoded_f}"
                if '2' in f or '3' in f:
                    fotos_proceso.append(file_url)
                elif 'inicio' in f.lower():
                    fotos_inicio = file_url
        else:
            if inicio_files:
                fotos_inicio = f"{base_img_url}{urllib.parse.quote(cat_name)}/{urllib.parse.quote(folder)}/{urllib.parse.quote(inicio_files[0])}"
            if proceso_files:
                for pf in proceso_files:
                    fotos_proceso.append(f"{base_img_url}{urllib.parse.quote(cat_name)}/{urllib.parse.quote(folder)}/{urllib.parse.quote(pf)}")
            if terminado_files:
                fotos_terminado = f"{base_img_url}{urllib.parse.quote(cat_name)}/{urllib.parse.quote(folder)}/{urllib.parse.quote(terminado_files[0])}"
    
    entry = {
        "idContrato": cid,
        "noContrato": noc,
        "nombreObra": nombre,
        "tipoObra": tipo,
        "idEmpresa": None,
        "idDelegacion": t.get('delegacion'),
        "montoContratado": None,
        "fechaInicio": t.get('inicio'),
        "fechaFin": t.get('fin'),
        "categoria": cat_name,
        "fotos": {
            "inicio": fotos_inicio,
            "proceso": fotos_proceso,
            "terminado": fotos_terminado
        },
        "fotosFallback": {
            "inicio": fotos_inicio,
            "proceso": fotos_proceso,
            "terminado": fotos_terminado
        }
    }
    
    # Store with full contract key, e.g. MT/DGOP/FAISMUN/LPN-104/2026
    ev_catalog[noc] = entry
    added_count += 1
    print(f"Added {noc}: Categoria='{cat_name}' | Inicio={bool(fotos_inicio)} | Proceso={len(fotos_proceso)} fotos")

with open('public/data/evidencias_obras_2026.json', 'w', encoding='utf-8') as f:
    json.dump(ev_catalog, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully wrote {len(ev_catalog)} entries to public/data/evidencias_obras_2026.json (added {added_count})")
