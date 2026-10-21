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

print("=== CHECKING SUPABASE STORAGE BUCKETS ===")
try:
    buckets = run_sql('SELECT * FROM storage.buckets;')
    print(f"Buckets ({len(buckets)}):", [b.get('name') for b in buckets])
except Exception as e:
    print("Buckets error:", e)

try:
    objs = run_sql('SELECT bucket_id, name, created_at, updated_at FROM storage.objects ORDER BY created_at DESC LIMIT 100;')
    print(f"\nStorage objects ({len(objs)}):")
    for o in objs:
        print(f"  [{o.get('bucket_id')}] {o.get('name')} ({o.get('created_at')})")
except Exception as e:
    print("Objects error:", e)

print("\n=== CHECKING TABLES FOR 'EVIDENCIA' OR 'FOTO' ===")
try:
    tables = run_sql("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name ILIKE '%evidencia%' 
           OR table_name ILIKE '%foto%' 
           OR table_name ILIKE '%archivo%'
           OR table_schema = 'scas';
    """)
    print("Tables found:", tables)
    for t in tables:
        schema = t['table_schema']
        tname = t['table_name']
        try:
            cnt = run_sql(f'SELECT count(*) FROM "{schema}"."{tname}";')
            print(f"  {schema}.{tname}: {cnt}")
        except Exception as err:
            print(f"  {schema}.{tname} err: {err}")
except Exception as e:
    print("Tables search error:", e)

print("\n=== CHECKING SCHEMAS ===")
try:
    schemas = run_sql('SELECT schema_name FROM information_schema.schemata;')
    print("Schemas:", [s['schema_name'] for s in schemas])
except Exception as e:
    print("Schemas error:", e)
