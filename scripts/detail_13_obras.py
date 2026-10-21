import urllib.request
import base64
import json

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

rows = run_sql('SELECT * FROM contratos_test.mapeo_t WHERE "idMapeo_t" > 71 ORDER BY "idMapeo_t";')
print(f"Total rows with idMapeo_t > 71: {len(rows)}")

with open('scripts/scanned_evidencias_2026.json', 'r', encoding='utf-8') as f:
    ev_scan = json.load(f)

for r in rows:
    id_m = r.get('idMapeo_t')
    cid = r.get('idContrato') or r.get('No. Contrato')
    no_c = r.get('No. Contrato')
    tipo = r.get('Tipo de Obra')
    nombre = r.get('Nombre de la Obra')
    colonia = r.get('Localidad/Colonia')
    delegacion = r.get('Delegación')
    p_pts = []
    for k in sorted(r.keys()):
        if k.startswith('Geolocalizaci') and r[k] and str(r[k]).strip():
            p_pts.append((k, str(r[k]).strip()))
    
    # Search in ev_scan
    clean_id = str(cid).replace('/', '-').replace(' ', '-')
    ev_found = []
    for cat, folders in ev_scan.items():
        for fname, fdata in folders.items():
            if clean_id.lower() in fname.lower() or (no_c and no_c.replace('/', '-').lower() in fname.lower()):
                ev_found.append((cat, fname, fdata['files']))
            else:
                # Try matching the number, e.g. 108
                parts = str(cid).split('-')
                if len(parts) >= 2:
                    sub = parts[1] # e.g. 108
                    if f"-{sub}-" in fname:
                        ev_found.append((cat, fname, fdata['files']))
    
    print(f"\n==========================================")
    print(f"idMapeo_t: {id_m} | Contrato: {cid}")
    print(f"No. Contrato: {no_c}")
    print(f"Tipo: {tipo}")
    print(f"Lugar: {delegacion} - {colonia}")
    print(f"Nombre: {nombre}")
    print(f"Puntos ({len(p_pts)}):")
    for pk, pv in p_pts:
        print(f"   {pk}: {pv}")
    if ev_found:
        print(f"📷 EVIDENCIAS ENCONTRADAS ({len(ev_found)}):")
        for cat, fname, files in ev_found:
            print(f"   [{cat}] {fname} -> {files}")
    else:
        print(f"❌ SIN EVIDENCIAS en el servidor de imágenes!")
