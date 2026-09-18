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

sql = """
CREATE OR REPLACE VIEW public.mapeo_t AS 
SELECT * FROM contratos_test.mapeo_t;

CREATE OR REPLACE VIEW public.mapeo_p AS 
SELECT * FROM contratos_test.mapeo_p;

CREATE OR REPLACE VIEW public.info_contratos AS 
SELECT * FROM contratos_test."infoContratos";

GRANT SELECT ON public.mapeo_t TO anon, authenticated;
GRANT SELECT ON public.mapeo_p TO anon, authenticated;
GRANT SELECT ON public.info_contratos TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
"""

print("Creando vistas en public y otorgando permisos a anon...")
res = run_sql(sql)
print("Resultado SQL:", res)

# Ahora probar la petición vía PostgREST con la anon key (exactamente como lo hace el cliente Supabase del frontend)
anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
postgrest_headers = {
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}',
    'User-Agent': 'Mozilla/5.0'
}

for view_name in ['mapeo_t', 'mapeo_p', 'info_contratos']:
    url = f"{base_url}/rest/v1/{view_name}?select=*&limit=3"
    req = urllib.request.Request(url, headers=postgrest_headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"\n[PostgREST] {view_name} -> HTTP 200 OK! Registros devueltos: {len(data)}")
            if data:
                print("   Ejemplo:", list(data[0].keys())[:6])
    except Exception as e:
        print(f"\n[PostgREST] {view_name} ERROR:", e)
