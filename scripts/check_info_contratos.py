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

# Check columns and sample of infoContratos
cols = run_sql("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'contratos_test' AND table_name = 'infoContratos';
""")
print("Columns of infoContratos:", [c['column_name'] for c in cols])

# Check any contracts matching 104..116
matches = run_sql("""
    SELECT * 
    FROM contratos_test."infoContratos" 
    WHERE "No. Contrato" ~ '10[4-9]|11[0-6]'
       OR "idContrato" ~ '10[4-9]|11[0-6]';
""")
print(f"Matches in infoContratos: {len(matches)}")
for m in matches:
    print(m)
