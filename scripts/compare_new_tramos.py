import json
import urllib.request
import base64

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

# Load previous 71 rows from local backup
try:
    with open('public/data/obras_tramos_supabase.json', 'r', encoding='utf-8') as f:
        old_data = json.load(f)
    old_ids = set()
    for r in old_data:
        cid = r.get('idContrato') or r.get('No. Contrato')
        if cid:
            old_ids.add(str(cid).strip())
    print(f"Old local backup has {len(old_data)} rows ({len(old_ids)} unique IDs)")
except Exception as e:
    print("Error reading old data:", e)
    old_ids = set()

# Fetch all rows from database
current_rows = run_sql('SELECT * FROM contratos_test.mapeo_t ORDER BY "idMapeo_t";')
print(f"Current database has {len(current_rows)} rows\n")

new_rows = []
for r in current_rows:
    cid = str(r.get('idContrato') or r.get('No. Contrato') or '').strip()
    # Check if this row was not in old_ids
    if cid not in old_ids:
        new_rows.append(r)

print(f"=== NUEVAS OBRAS ENCONTRADAS ({len(new_rows)}) ===")
for r in new_rows:
    cid = r.get('idContrato') or r.get('No. Contrato')
    no_c = r.get('No. Contrato')
    tipo = r.get('Tipo de Obra')
    nombre = r.get('Nombre de la Obra')
    inicio = r.get('Inicio de Ejecucion')
    fin = r.get('Termino de Ejecucion')
    p_pts = []
    for k, v in r.items():
        if k.startswith('Geolocalizaci') and v and str(v).strip():
            p_pts.append((k, str(v).strip()))
    print(f"\n* ID: {cid} | No. Contrato: {no_c}")
    print(f"  Tipo: {tipo}")
    print(f"  Periodo: {inicio} al {fin}")
    print(f"  Puntos ({len(p_pts)}): {[p[1] for p in p_pts]}")
    print(f"  Nombre: {nombre}")
