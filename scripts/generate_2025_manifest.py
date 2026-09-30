import os
import re
import json
import urllib.parse

TUNNEL_BASE = 'https://video-chelsea-prince-unsigned.trycloudflare.com/imagenes/EVIDENCIAS%20DE%20OBRAS%202025'

# 1. Cargar obras 2025 de Supabase
with open('public/data/obras_tramos_supabase.json', 'r', encoding='utf-8') as f:
    tramos = json.load(f)

with open('public/data/obras_puntuales_supabase.json', 'r', encoding='utf-8') as f:
    puntuales = json.load(f)

obras_2025 = [o for o in tramos + puntuales if '2025' in str(o.get('No. Contrato', ''))]
print(f"Total obras 2025: {len(obras_2025)}")

# 2. Cargar árbol de evidencias 2025
with open('scratch_2025_tree.json', 'r', encoding='utf-8') as f:
    tree = json.load(f)

# Índice de obras por LPN y por contrato normalizado
obras_by_lpn = {}
obras_by_clean_no = {}

for o in obras_2025:
    no = o.get('No. Contrato', '')
    m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', no, re.IGNORECASE)
    if m:
        lpn_key = f"LPN-{int(m.group(1)):03d}-{m.group(2)}"
        obras_by_lpn[lpn_key] = o
        obras_by_lpn[f"LPN-{int(m.group(1))}-{m.group(2)}"] = o
    
    clean_no = re.sub(r'[\s/]+', '-', no.upper()).strip('-')
    obras_by_clean_no[clean_no] = o

manifest = {}
server_bash_commands = [
    "#!/bin/bash",
    "# Script de normalización opcional para Servidor Alfa en:",
    "# /home/kinger/imagenes/EVIDENCIAS DE OBRAS 2025",
    "cd \"/home/kinger/imagenes/EVIDENCIAS DE OBRAS 2025\" 2>/dev/null || cd \"/imagenes/EVIDENCIAS DE OBRAS 2025\" 2>/dev/null || cd \"/var/www/html/imagenes/EVIDENCIAS DE OBRAS 2025\" 2>/dev/null || exit 1",
    ""
]

# Normalizar carpetas con espacio al inicio
for cat, cdata in tree.items():
    if 'BACHEO' in cat: continue
    for sf in cdata.get('subfolders', {}).keys():
        if sf != sf.strip():
            server_bash_commands.append(f'if [ -d "{cat}/{sf}" ]; then mv "{cat}/{sf}" "{cat}/{sf.strip()}"; fi')

for cat, cdata in tree.items():
    if 'BACHEO' in cat:
        continue
    
    subfolders = cdata.get('subfolders', {})
    for sf, files in subfolders.items():
        clean_sf = sf.strip()
        
        # Buscar obra asociada
        matched_obra = None
        m = re.search(r'LPN[-\s/]*(\d+)[-\s/]*(\d{4})', clean_sf, re.IGNORECASE)
        if m:
            lpn_key = f"LPN-{int(m.group(1)):03d}-{m.group(2)}"
            matched_obra = obras_by_lpn.get(lpn_key)
            if not matched_obra:
                matched_obra = obras_by_lpn.get(f"LPN-{int(m.group(1))}-{m.group(2)}")
                
        if not matched_obra:
            norm = re.sub(r'[\s/]+', '-', clean_sf.upper()).strip('-')
            matched_obra = obras_by_clean_no.get(norm)
            
        # Clasificar fotos
        img_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        foto_inicio = None
        foto_terminado = None
        fotos_proceso = []
        otras_fotos = []
        
        def file_sort_key(name):
            nl = name.lower()
            if 'inicio' in nl or 'inicial' in nl: return (0, name)
            if 'proceso' in nl: return (1, name)
            if 'termin' in nl or 'final' in nl: return (3, name)
            return (2, name)
            
        sorted_imgs = sorted(img_files, key=file_sort_key)
        
        for f in sorted_imgs:
            fl = f.lower()
            if any(k in fl for k in ['inicio', 'inicial']):
                if not foto_inicio:
                    foto_inicio = f
                else:
                    otras_fotos.append(f)
            elif any(k in fl for k in ['termin', 'final']):
                if not foto_terminado:
                    foto_terminado = f
                else:
                    otras_fotos.append(f)
            elif 'proceso' in fl:
                fotos_proceso.append(f)
            else:
                otras_fotos.append(f)
                
        if not foto_inicio and otras_fotos:
            foto_inicio = otras_fotos.pop(0)
            
        if not foto_terminado and len(otras_fotos) >= 2:
            foto_terminado = otras_fotos.pop(-1)
            
        while len(fotos_proceso) < 6 and otras_fotos:
            fotos_proceso.append(otras_fotos.pop(0))
            
        cat_enc = urllib.parse.quote(cat)
        sf_enc = urllib.parse.quote(sf)
        
        def make_url(filename):
            if not filename: return None
            return f"{TUNNEL_BASE}/{cat_enc}/{sf_enc}/{urllib.parse.quote(filename)}"
            
        sf_clean_enc = urllib.parse.quote(clean_sf)
        def make_fallback_url(filename, fallback_name=None):
            if not filename: return None
            fn = fallback_name or filename
            return f"{TUNNEL_BASE}/{cat_enc}/{sf_clean_enc}/{urllib.parse.quote(fn)}"

        url_inicio = make_url(foto_inicio)
        urls_proceso = [make_url(p) for p in fotos_proceso]
        url_terminado = make_url(foto_terminado)
        
        fallback_inicio = make_fallback_url(foto_inicio, f"_inicio{os.path.splitext(foto_inicio)[1].lower()}" if foto_inicio else None)
        fallback_proceso = [make_fallback_url(p, f"_proceso_{i+1}{os.path.splitext(p)[1].lower()}") for i, p in enumerate(fotos_proceso)]
        fallback_terminado = make_fallback_url(foto_terminado, f"_terminado{os.path.splitext(foto_terminado)[1].lower()}" if foto_terminado else None)

        if foto_inicio:
            server_bash_commands.append(f'if [ -f "{cat}/{clean_sf}/{foto_inicio}" ]; then mv "{cat}/{clean_sf}/{foto_inicio}" "{cat}/{clean_sf}/_inicio{os.path.splitext(foto_inicio)[1].lower()}"; fi')
        for i, p in enumerate(fotos_proceso):
            server_bash_commands.append(f'if [ -f "{cat}/{clean_sf}/{p}" ]; then mv "{cat}/{clean_sf}/{p}" "{cat}/{clean_sf}/_proceso_{i+1}{os.path.splitext(p)[1].lower()}"; fi')
        if foto_terminado:
            server_bash_commands.append(f'if [ -f "{cat}/{clean_sf}/{foto_terminado}" ]; then mv "{cat}/{clean_sf}/{foto_terminado}" "{cat}/{clean_sf}/_terminado{os.path.splitext(foto_terminado)[1].lower()}"; fi')

        no_contrato = matched_obra.get('No. Contrato', clean_sf) if matched_obra else clean_sf
        nombre_obra = matched_obra.get('Nombre de la Obra', '') if matched_obra else ''
        tipo_obra = matched_obra.get('Tipo de Obra', cat) if matched_obra else cat
        fecha_inicio = matched_obra.get('Inicio de Ejecucion', '') if matched_obra else ''
        fecha_fin = matched_obra.get('Termino de Ejecucion', '') if matched_obra else ''
        
        del_match = re.search(r'DELEGACI[ÓO]N\s+([^,]+)', nombre_obra, re.IGNORECASE)
        delegacion = del_match.group(1).strip() if del_match else 'Toluca'

        item_data = {
            'idContrato': clean_sf,
            'noContrato': no_contrato,
            'nombreObra': nombre_obra,
            'tipoObra': tipo_obra,
            'idEmpresa': '',
            'idDelegacion': delegacion,
            'montoContratado': '',
            'fechaInicio': fecha_inicio,
            'fechaFin': fecha_fin,
            'categoria': cat,
            'fotos': {
                'inicio': url_inicio,
                'proceso': urls_proceso,
                'terminado': url_terminado
            },
            'fotosFallback': {
                'inicio': fallback_inicio,
                'proceso': fallback_proceso,
                'terminado': fallback_terminado
            }
        }
        
        manifest[clean_sf] = item_data
        if no_contrato != clean_sf:
            manifest[no_contrato] = item_data

manifest_path = 'public/data/evidencias_obras_2025.json'
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Manifiesto 2025 generado exitosamente en: {manifest_path} ({len(manifest)} entradas)")

bash_path = 'scripts/normalize_server_alfa_2025.sh'
with open(bash_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(server_bash_commands) + '\n')

print(f"Script bash guardado en: {bash_path}")
