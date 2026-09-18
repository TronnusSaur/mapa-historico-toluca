import urllib.request
import json

base_url = 'https://realized-wider-walked-donors.trycloudflare.com'
anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
headers = {
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}',
    'User-Agent': 'Mozilla/5.0'
}

def fetch_table(name):
    url = f"{base_url}/rest/v1/{name}?select=*"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

tramos_data = fetch_table('mapeo_t')
puntuales_data = fetch_table('mapeo_p')

print(f"Tramos descargados de Supabase Alfa: {len(tramos_data)}")
print(f"Puntuales descargados de Supabase Alfa: {len(puntuales_data)}")

print("\nPrimer tramo:")
print("  idContrato:", tramos_data[0].get('idContrato'))
print("  No. Contrato:", tramos_data[0].get('No. Contrato'))
print("  Tipo de Obra:", tramos_data[0].get('Tipo de Obra'))
print("  Geolocalizacion P1:", tramos_data[0].get('Geolocalización P1') or tramos_data[0].get('Geolocalizacin P1') or [k for k in tramos_data[0] if 'P1' in k])

print("\nPrimer puntual:")
print("  idContrato:", puntuales_data[0].get('idContrato'))
print("  No. Contrato:", puntuales_data[0].get('No. Contrato'))
print("  Tipo de Obra:", puntuales_data[0].get('Tipo de Obra'))
