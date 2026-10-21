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

# 1. Columns of contratos_test.mapeo_t
cols = run_sql("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'contratos_test' AND table_name = 'mapeo_t';
""")
print("Columns in contratos_test.mapeo_t:")
for c in cols:
    print(f"  {c['column_name']} ({c['data_type']})")

# 2. Check the last 15 rows in contratos_test.mapeo_t
recent_rows = run_sql("""
    SELECT "No. Contrato", "Nombre de la Obra", "Tipo de Obra", "Inicio de Ejecucion", "Termino de Ejecucion"
    FROM contratos_test.mapeo_t
    LIMIT 20;
""")
print("\nSample rows in mapeo_t:")
for r in recent_rows[:10]:
    print(f"  [{r.get('No. Contrato')}] {r.get('Tipo de Obra')} | {r.get('Nombre de la Obra')[:60]}...")

# 3. Check scas-evidencias bucket
try:
    scas_objs = run_sql("SELECT name, bucket_id, created_at, metadata FROM storage.objects WHERE bucket_id = 'scas-evidencias' ORDER BY created_at DESC LIMIT 30;")
    print(f"\nObjects in scas-evidencias ({len(scas_objs)}):")
    for o in scas_objs:
        print(f"  {o['name']} ({o['created_at']})")
except Exception as e:
    print("scas-evidencias error:", e)

# 4. Check all schemas and tables in database
all_tables = run_sql("""
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
""")
print("\nAll database tables/views:")
for t in all_tables:
    print(f"  {t['table_schema']}.{t['table_name']}")
