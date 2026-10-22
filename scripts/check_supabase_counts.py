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

cnt_tramos = run_sql('SELECT count(*) FROM contratos_test.mapeo_t;')
cnt_puntuales = run_sql('SELECT count(*) FROM contratos_test.mapeo_p;')
print(f"contratos_test.mapeo_t count: {cnt_tramos}")
print(f"contratos_test.mapeo_p count: {cnt_puntuales}")

# Check latest idMapeo_t
latest_t = run_sql('SELECT "idMapeo_t", "No. Contrato", "Tipo de Obra" FROM contratos_test.mapeo_t ORDER BY "idMapeo_t" DESC LIMIT 15;')
print("\nLatest in mapeo_t:")
for r in latest_t:
    print(r)

# Check latest idMapeo_p
latest_p = run_sql('SELECT * FROM contratos_test.mapeo_p ORDER BY 1 DESC LIMIT 10;')
print("\nLatest in mapeo_p:")
for r in latest_p:
    print(r)
