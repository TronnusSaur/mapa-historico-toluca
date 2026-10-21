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

res = run_sql('SELECT "idContrato", "No. Contrato" FROM contratos_test."infoContratos" WHERE "No. Contrato" LIKE \'%2026%\' ORDER BY "idContrato";')
print(f"Total 2026 contracts in infoContratos: {len(res)}")
for r in res:
    print(r)
