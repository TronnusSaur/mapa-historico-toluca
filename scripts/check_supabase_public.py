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

# Check existing tables in public
tables = run_sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
print("Public tables:", [t['table_name'] for t in tables])

# Check permissions for anon on public
perms = run_sql("SELECT grantee, privilege_type, table_name FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee = 'anon';")
print("Anon permissions count:", len(perms))
