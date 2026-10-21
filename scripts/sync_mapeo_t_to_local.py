import urllib.request
import json
import os

url = 'https://supabase.soranoserver.com/rest/v1/mapeo_t?select=*'
# Read supabase anon key from src/lib/supabase.ts
anon_key = ""
with open('src/lib/supabase.ts', 'r', encoding='utf-8') as f:
    text = f.read()
    import re
    m = re.search(r"DEFAULT_ANON_KEY\s*=\s*'([^']+)'", text)
    if m:
        anon_key = m.group(1)

req = urllib.request.Request(url, headers={
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}',
    'User-Agent': 'Mozilla/5.0'
})

try:
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode('utf-8'))
        print(f"Direct PostgREST fetch /rest/v1/mapeo_t succeeded: {len(data)} rows returned!")
        # Save full data to public/data/obras_tramos_supabase.json
        with open('public/data/obras_tramos_supabase.json', 'w', encoding='utf-8') as out:
            json.dump(data, out, indent=2, ensure_ascii=False)
        print("Updated public/data/obras_tramos_supabase.json successfully!")
except Exception as e:
    print("PostgREST fetch failed:", e)
