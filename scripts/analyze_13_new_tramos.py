import urllib.request
import base64
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://supabase.soranoserver.com'
auth = base64.b64encode(b'supabase:this_password_is_insecure_and_should_be_updated').decode('ascii')
headers = {
    'Authorization': f'Basic {auth}',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0'
}

def run_sql(sql):
    payload = json.dumps({'query': sql}).encode('utf-8')
    req = urllib.request.Request(base_url + '/api/platform/pg-meta/default/query', data=payload, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

with open('public/data/obras_tramos_supabase.json', 'r', encoding='utf-8') as f:
    old_data = json.load(f)
old_cids = {str(r.get('idContrato') or r.get('No. Contrato') or '').strip() for r in old_data}

all_rows = run_sql('SELECT * FROM contratos_test.mapeo_t ORDER BY "idMapeo_t";')
new_rows = [r for r in all_rows if str(r.get('idContrato') or r.get('No. Contrato') or '').strip() not in old_cids]

print(f"Total rows in db: {len(all_rows)}, Old rows: {len(old_data)}, New rows: {len(new_rows)}")

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    ev_scan = json.load(f)

analysis = []

for r in new_rows:
    id_m = r.get('idMapeo_t')
    cid = r.get('idContrato') or r.get('No. Contrato')
    no_c = r.get('No. Contrato')
    tipo = r.get('Tipo de Obra')
    nombre = r.get('Nombre de la Obra')
    colonia = r.get('Localidad/Colonia')
    delegacion = r.get('Delegación')
    inicio = r.get('Inicio de Ejecucion')
    fin = r.get('Termino de Ejecucion')
    
    p_pts = []
    for k in sorted(r.keys()):
        if k.startswith('Geolocalizaci') and r[k] and str(r[k]).strip():
            p_pts.append((k, str(r[k]).strip()))
            
    # Search in ev_scan
    clean_no_c = (no_c or '').replace('/', '-').replace(' ', '-')
    clean_cid = str(cid or '').replace('/', '-').replace(' ', '-')
    
    ev_found = []
    for cat, folders in ev_scan.items():
        for fname, fdata in folders.items():
            if (clean_no_c and clean_no_c.lower() in fname.lower()) or (clean_cid and clean_cid.lower() in fname.lower()):
                ev_found.append({
                    "category": cat,
                    "folder": fname,
                    "path": fdata["path"],
                    "files": fdata["files"]
                })
            else:
                # check number e.g. 104, 105
                import re
                m = re.search(r'LPN-(\d+)', clean_no_c or clean_cid)
                if m:
                    num_str = m.group(1)
                    if f"-{num_str}-" in fname or f"-{num_str}/" in fname:
                        ev_found.append({
                            "category": cat,
                            "folder": fname,
                            "path": fdata["path"],
                            "files": fdata["files"]
                        })

    item = {
        "idMapeo_t": id_m,
        "idContrato": cid,
        "noContrato": no_c,
        "tipo": tipo,
        "delegacion": delegacion,
        "colonia": colonia,
        "nombre": nombre,
        "inicio": inicio,
        "fin": fin,
        "num_puntos": len(p_pts),
        "puntos": p_pts,
        "evidencias": ev_found
    }
    analysis.append(item)

with open('scripts/new_tramos_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(analysis, f, indent=2, ensure_ascii=False)

for item in analysis:
    print(f"\n[{item['idContrato']}] | No: {item['noContrato']}")
    print(f"  Tipo: {item['tipo']}")
    print(f"  Delegacion/Colonia: {item['delegacion']} / {item['colonia']}")
    print(f"  Puntos geolocalizados: {item['num_puntos']}")
    if item['evidencias']:
        for ev in item['evidencias']:
            print(f"  [OK FOTOS] Cat: '{ev['category']}' | Carpeta: '{ev['folder']}' | Archivos: {ev['files']}")
    else:
        print(f"  [FALTAN FOTOS] No se encontró carpeta para este contrato en el servidor de imágenes.")
