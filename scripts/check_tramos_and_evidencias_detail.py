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

# 1. Fetch all rows in contratos_test.mapeo_t
all_tramos = run_sql('SELECT * FROM contratos_test.mapeo_t ORDER BY "idMapeo_t";')
print(f"Total tramos in contratos_test.mapeo_t: {len(all_tramos)}")

# Check idMapeo_t or idContrato
for r in all_tramos:
    id_c = r.get('idContrato') or r.get('No. Contrato')
    tipo = r.get('Tipo de Obra')
    nombre = r.get('Nombre de la Obra')
    # Count P coords
    p_count = sum(1 for k, v in r.items() if k.startswith('Geolocalizaci') and v and str(v).strip())
    print(f"  idMapeo_t={r.get('idMapeo_t')}: [{id_c}] tipo={tipo} | P_coords={p_count} | {nombre[:50]}...")

# 2. Check scas.evidencias_fotograficas
try:
    ev_scas = run_sql('SELECT * FROM scas.evidencias_fotograficas LIMIT 30;')
    print(f"\nscas.evidencias_fotograficas count sample ({len(ev_scas)}):")
    for ev in ev_scas[:10]:
        print(" ", ev)
except Exception as e:
    print("\nscas.evidencias_fotograficas error:", e)

# 3. Check storage.objects with all buckets
try:
    all_objs = run_sql('SELECT bucket_id, name, created_at, metadata FROM storage.objects ORDER BY created_at DESC LIMIT 50;')
    print(f"\nLatest storage.objects ({len(all_objs)}):")
    for o in all_objs:
        print(f"  [{o['bucket_id']}] {o['name']} ({o['created_at']})")
except Exception as e:
    print("\nstorage.objects error:", e)

# 4. Check infoContratos
try:
    info_c = run_sql('SELECT count(*) FROM contratos_test.infoContratos;')
    print(f"\ncontratos_test.infoContratos count: {info_c}")
    sample_c = run_sql('SELECT * FROM contratos_test.infoContratos LIMIT 5;')
    print("infoContratos columns:", list(sample_c[0].keys()) if sample_c else [])
except Exception as e:
    print("\ninfoContratos error:", e)
