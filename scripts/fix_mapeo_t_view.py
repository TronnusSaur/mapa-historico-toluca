import urllib.request
import base64
import json

base_url = 'https://realized-wider-walked-donors.trycloudflare.com'
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

# Check why mapeo_t had 404
views = run_sql("SELECT table_name FROM information_schema.views WHERE table_schema = 'public';")
print("Public views:", [v['table_name'] for v in views])

# Try recreating mapeo_t
run_sql("DROP VIEW IF EXISTS public.mapeo_t CASCADE;")
run_sql("CREATE VIEW public.mapeo_t AS SELECT * FROM contratos_test.mapeo_t;")
run_sql("GRANT SELECT ON public.mapeo_t TO anon, authenticated;")
run_sql("NOTIFY pgrst, 'reload schema';")

# Test postgrest
anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
postgrest_headers = {
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}',
    'User-Agent': 'Mozilla/5.0'
}

url = f"{base_url}/rest/v1/mapeo_t?select=*&limit=3"
req = urllib.request.Request(url, headers=postgrest_headers)
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("\nmapeo_t PostgREST OK! Count:", len(data))
    if data:
        print("Keys:", list(data[0].keys())[:8])
