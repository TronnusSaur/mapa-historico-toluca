import re
import json
import urllib.parse

with open(r'scripts/normalize_server_alfa.sh', 'r', encoding='utf-8') as f:
    lines = f.readlines()

folder_map = {} # 'cat/idContrato' -> 'cat/orig_folder'
file_map = {}   # 'cat/idContrato/new_file' -> 'cat/orig_folder/orig_file'

for line in lines:
    m = re.search(r'mv "([^"]+)" "([^"]+)"', line)
    if m:
        src, dst = m.group(1), m.group(2)
        parts_src = src.split('/')
        parts_dst = dst.split('/')
        if len(parts_src) == 2 and len(parts_dst) == 2:
            folder_map[dst] = src
        elif len(parts_src) == 3 and len(parts_dst) == 3:
            cat, id_c, new_f = parts_dst
            orig_folder = folder_map.get(f"{cat}/{id_c}", f"{cat}/{id_c}")
            orig_file = parts_src[2]
            file_map[f"{cat}/{id_c}/{new_f}"] = f"{orig_folder}/{orig_file}"

print(f"Total mapped files: {len(file_map)}")

# Cargar public/data/evidencias_obras_2026.json y agregar fotosFallback
with open(r'public/data/evidencias_obras_2026.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

tunnel_base = 'https://dependent-max-warcraft-portsmouth.trycloudflare.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202026'

def make_fallback_url(new_url):
    if not new_url: return None
    # Extraer la ruta relativa después de EVIDENCIAS%20DE%20OBRAS%202026/
    idx = new_url.find('EVIDENCIAS%20DE%20OBRAS%202026/')
    if idx == -1: return None
    rel_encoded = new_url[idx + len('EVIDENCIAS%20DE%20OBRAS%202026/'):]
    rel_decoded = urllib.parse.unquote(rel_encoded)
    
    orig_path = file_map.get(rel_decoded)
    if orig_path:
        # Codificar partes de orig_path
        parts = orig_path.split('/')
        encoded_orig = '/'.join(urllib.parse.quote(p) for p in parts)
        return f"{tunnel_base}/{encoded_orig}"
    return None

updated_count = 0
for id_c, item in manifest.items():
    fotos = item.get('fotos', {})
    inicio = fotos.get('inicio')
    proceso = fotos.get('proceso', [])
    terminado = fotos.get('terminado')
    
    fallback_inicio = make_fallback_url(inicio)
    fallback_proceso = [make_fallback_url(p) for p in proceso if make_fallback_url(p)]
    fallback_terminado = make_fallback_url(terminado)
    
    item['fotosFallback'] = {
        'inicio': fallback_inicio,
        'proceso': fallback_proceso,
        'terminado': fallback_terminado
    }
    updated_count += 1

with open(r'public/data/evidencias_obras_2026.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Manifest actualizado con {updated_count} fallbacks exitosamente.")

# Test de un fallback con HTTP request
sample_url = manifest['VERDE-050']['fotosFallback']['inicio']
print("\nProbando URL fallback de VERDE-050:")
print(sample_url)
import urllib.request
try:
    with urllib.request.urlopen(sample_url, timeout=10) as resp:
        print("RESULTADO HTTP:", resp.status)
except Exception as e:
    print("Error al probar:", e)
