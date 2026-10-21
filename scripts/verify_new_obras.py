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

# 1. Total records in contratos_test.mapeo_t and public.mapeo_t
count_test = run_sql('SELECT count(*) FROM contratos_test.mapeo_t;')
count_pub = run_sql('SELECT count(*) FROM public.mapeo_t;')
print(f"Count in contratos_test.mapeo_t: {count_test}")
print(f"Count in public.mapeo_t: {count_pub}")

# 2. Check all tables/views in contratos_test and public
tables = run_sql("""
    SELECT table_schema, table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema IN ('contratos_test', 'public', 'storage')
    ORDER BY table_schema, table_name;
""")
print('\nTables & Views:')
for t in tables:
    print(f"  {t['table_schema']}.{t['table_name']} ({t['table_type']})")

# 3. Check storage buckets
try:
    buckets = run_sql("SELECT id, name, public FROM storage.buckets;")
    print("\nStorage Buckets:")
    for b in buckets:
        print(f"  {b['id']} (name: {b['name']}, public: {b['public']})")
except Exception as e:
    print("Storage buckets error:", e)

# 4. Check storage objects
try:
    objects = run_sql("SELECT bucket_id, name, created_at FROM storage.objects ORDER BY created_at DESC LIMIT 20;")
    print(f"\nRecent Storage Objects ({len(objects)}):")
    for o in objects:
        print(f"  [{o['bucket_id']}] {o['name']} ({o['created_at']})")
except Exception as e:
    print("Storage objects error:", e)
