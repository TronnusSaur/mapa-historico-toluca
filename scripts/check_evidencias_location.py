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

# 1. Search in storage.objects for '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116'
contracts = [f"1{i:02d}" for i in range(4, 17)]
print("Checking storage.objects for contract numbers 104 to 116...")
for c in contracts:
    objs = run_sql(f"SELECT bucket_id, name, created_at FROM storage.objects WHERE name ILIKE '%{c}%';")
    if objs:
        print(f"  Match for {c}: {objs}")

# 2. Check all storage.objects created in the last 30 days
recent_storage = run_sql("SELECT bucket_id, name, created_at FROM storage.objects ORDER BY created_at DESC LIMIT 30;")
print("\nRecent 30 storage.objects:")
for o in recent_storage:
    print(f"  [{o['bucket_id']}] {o['name']} ({o['created_at']})")

# 3. Check scas.evidencias_fotograficas
try:
    scas_all = run_sql("SELECT id_evidencia, id_contrato, etapa, nombre_archivo, storage_path, url_publica FROM scas.evidencias_fotograficas;")
    print(f"\nAll scas.evidencias_fotograficas ({len(scas_all)}):")
    for s in scas_all:
        print(" ", s)
except Exception as e:
    print("scas error:", e)

# 4. Check if there are any other tables with 'evidencia' in any schema
ev_tables = run_sql("""
    SELECT table_schema, table_name, column_name 
    FROM information_schema.columns 
    WHERE table_name ILIKE '%evidencia%' OR column_name ILIKE '%evidencia%' OR column_name ILIKE '%foto%'
    ORDER BY table_schema, table_name;
""")
print("\nTables with evidencia/foto columns:")
for t in ev_tables:
    print(f"  {t['table_schema']}.{t['table_name']}.{t['column_name']}")
